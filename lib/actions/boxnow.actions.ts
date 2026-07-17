"use server";

import { prisma } from "@/db/prisma";
import { formatError } from "../utils";
import { getTranslations } from "next-intl/server";
import { assertAdmin } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";
import { ShippingAddress } from "@/types";
import {
  listDestinations,
  createDeliveryRequest,
  type BoxNowLocker,
} from "../boxnow";

/**
 * Search Box Now lockers for the checkout picker. Requires Box Now credentials to be set;
 * returns a friendly error otherwise so the UI can degrade gracefully.
 */
export async function getBoxNowLockers(params?: {
  latlng?: string;
  radius?: number;
}): Promise<{ success: boolean; data?: BoxNowLocker[]; error?: string }> {
  try {
    const lockers = await listDestinations({
      latlng: params?.latlng,
      radius: params?.radius ?? 25000,
    });
    return { success: true, data: lockers };
  } catch (error) {
    return { success: false, error: formatError(error) };
  }
}

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
 * Safe to call from server-side flows (e.g. after payment).
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

/** Admin action: manually (re)create the Box Now voucher for an order. */
export async function createBoxNowDeliveryRequest(orderId: string) {
  try {
    await assertAdmin();
    const res = await createBoxNowDeliveryForOrder(orderId);
    const t = await getTranslations("Actions");
    if (!res.created && res.reason === "already created") {
      return { success: true, message: t("boxnowVoucherExists"), data: res };
    }
    if (!res.created) {
      return { success: false, error: res.reason || "could not create voucher" };
    }
    return { success: true, message: t("boxnowVoucherCreated"), data: res };
  } catch (error) {
    return { success: false, error: formatError(error) };
  }
}
