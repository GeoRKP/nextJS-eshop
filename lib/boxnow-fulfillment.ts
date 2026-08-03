// Box Now fulfillment core — plain server-only module (NOT "use server").
//
// createBoxNowDeliveryForOrder books a real courier parcel and bills the
// account for it. Exporting it from a "use server" module made it a public,
// unauthenticated endpoint. It lives here so only server code can reach it:
// the post-payment flow in order-fulfillment.ts, and the assertAdmin-guarded
// wrapper in actions/boxnow.actions.ts.

import { prisma } from "@/db/prisma";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { ShippingAddress } from "@/types";
import { createDeliveryRequest } from "./boxnow";

/** Normalize a phone to full international format for Box Now (default GR +30). */
function toInternationalPhone(phone: string): string {
  const cc = process.env.BOXNOW_DEFAULT_COUNTRY_CODE || "+30";
  const trimmed = phone.replace(/\s+/g, "");
  if (trimmed.startsWith("+")) return trimmed;
  // "00" trunk prefix is already international (e.g. 00306912345678) — just swap for "+".
  if (trimmed.startsWith("00")) return `+${trimmed.slice(2)}`;
  return `${cc}${trimmed.replace(/^0+/, "")}`;
}

/**
 * Core (unguarded) creation of a Box Now delivery request for a locker order.
 * Idempotent: no-op if the order isn't a locker order or already has a reference number.
 */
export async function createBoxNowDeliveryForOrder(
  orderId: string
): Promise<{ created: boolean; referenceNumber?: string; reason?: string }> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      orderitems: true,
      user: { select: { email: true, name: true } },
    },
  });
  if (!order) return { created: false, reason: "order not found" };
  if (order.shippingMethod !== "boxnow_locker")
    return { created: false, reason: "not a locker order" };
  if (order.boxnowReferenceNumber)
    return {
      created: false,
      referenceNumber: order.boxnowReferenceNumber,
      reason: "already created",
    };

  const locker = order.boxnowLocker as { id?: string } | null;
  if (!locker?.id) return { created: false, reason: "no locker on order" };

  const addr = order.shippingAddress as ShippingAddress;
  const phone = addr?.phone ? toInternationalPhone(addr.phone) : "";

  // COD at the locker is only used when explicitly enabled and the payment is cash-on-delivery.
  const codEnabled = process.env.BOXNOW_COD_ENABLED === "true";
  const isCod = order.paymentMethod === "CashOnDelivery";
  const collect = codEnabled && isCod ? Number(order.totalPrice).toFixed(2) : "0.00";

  const idShort = order.id.slice(0, 8).toUpperCase();
  const result = await createDeliveryRequest({
    orderNumber: order.id,
    invoiceValue: Number(order.totalPrice).toFixed(2),
    amountToBeCollected: collect,
    paymentMode: codEnabled && isCod ? "cod" : "prepaid",
    destinationLockerId: locker.id,
    recipient: {
      contactName: addr?.fullName || order.user?.name || "",
      contactNumber: phone,
      contactEmail: order.user?.email || "",
    },
    items: [
      {
        id: `${order.id}-1`,
        name: `Order ${idShort}`,
        value: Number(order.totalPrice).toFixed(2),
        weight: 0,
      },
    ],
  });

  const t = await getTranslations("Actions");
  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: {
        boxnowReferenceNumber: result.referenceNumber,
        boxnowParcelIds: result.parcelIds,
        boxnowStatus: "created",
      },
    });
    await tx.orderStatusHistory.create({
      data: {
        orderId,
        status: order.status,
        note: t("boxnowVoucherCreated"),
      },
    });
  });

  revalidatePath(`/order/${orderId}`);
  return { created: true, referenceNumber: result.referenceNumber };
}
