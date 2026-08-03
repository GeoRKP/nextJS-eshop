// Order fulfillment helpers — plain server-only module (NOT "use server").
//
// updateOrderToPaid marks an order paid, decrements stock, and records coupon
// usage purely from its arguments. It MUST NOT be a callable Server Action:
// exporting it from a "use server" module would make it a public, unauthenticated
// endpoint that any client could invoke to mark orders paid for free. Keeping it
// here (imported only by server code: the checkout actions and the Stripe webhook)
// guarantees it can never be reached over the wire.

import { prisma } from "@/db/prisma";
import { PaymentResult, ShippingAddress } from "@/types";
import { formatCurrency } from "./utils";
import { sendOrderConfirmationEmail, sendLowStockAlertEmail } from "@/lib/email";
import { createBoxNowDeliveryForOrder } from "./boxnow-fulfillment";
import { revalidatePath, revalidateTag } from "next/cache";
import { getTranslations } from "next-intl/server";

export async function sendOrderConfirmationForOrder(orderId: string) {
  try {
    const fullOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { name: true, email: true } },
        orderitems: true,
      },
    });

    if (fullOrder?.user?.email) {
      const shippingAddr = fullOrder.shippingAddress as ShippingAddress;
      const sent = await sendOrderConfirmationEmail(fullOrder.user.email, {
        orderId: fullOrder.id,
        orderIdFormatted: fullOrder.id.slice(0, 8).toUpperCase(),
        customerName: fullOrder.user.name || shippingAddr.fullName,
        items: fullOrder.orderitems.map((item) => ({
          name: item.name,
          qty: item.qty,
          price: formatCurrency(Number(item.price)),
        })),
        itemsPrice: formatCurrency(Number(fullOrder.itemsPrice)),
        shippingPrice: formatCurrency(Number(fullOrder.shippingPrice)),
        taxPrice: formatCurrency(Number(fullOrder.taxPrice)),
        totalPrice: formatCurrency(Number(fullOrder.totalPrice)),
        discountAmount: formatCurrency(Number(fullOrder.discountAmount)),
        discountValue: Number(fullOrder.discountAmount),
        couponCode: fullOrder.couponCode,
        shippingAddress: {
          fullName: shippingAddr.fullName,
          address: shippingAddr.address,
          city: shippingAddr.city,
          postalCode: shippingAddr.postalCode,
          country: shippingAddr.country,
        },
        paymentMethod: fullOrder.paymentMethod,
      });

      // Put the failure where an admin will see it, same as the Box Now voucher
      // errors — otherwise a bounced confirmation lives only in the container log.
      if (!sent) {
        const t = await getTranslations("Actions");
        await prisma.orderStatusHistory.create({
          data: {
            orderId,
            status: fullOrder.status,
            note: `${t("confirmationEmailFailed")}: ${fullOrder.user.email}`,
          },
        });
      }
    }
  } catch (emailError) {
    console.error("Order confirmation email failed:", emailError);
  }
}

export async function updateOrderToPaid({
  orderId,
  paymentResult,
  changedBy,
}: {
  orderId: string;
  paymentResult?: PaymentResult;
  /** Admin who triggered this, when it wasn't a payment webhook. Leaving it
   *  null on gateway callbacks is correct — those are system events. */
  changedBy?: string;
}) {
  const t = await getTranslations("Actions");
  const order = await prisma.order.findFirst({
    where: { id: orderId },
    include: {
      orderitems: true,
    },
  });

  if (!order) throw new Error(t("orderNotFound"));

  if (order.isPaid) throw new Error(t("orderAlreadyPaid"));

  const oversoldItems: string[] = [];
  const lowStockItems: { name: string; stock: number; threshold: number }[] =
    [];
  const claimed = await prisma.$transaction(async (tx) => {
    // Atomic claim: exactly one concurrent caller (Viva webhook vs return URL)
    // flips isPaid; the losers see count 0 and skip stock/coupons/emails.
    const claim = await tx.order.updateMany({
      where: { id: orderId, isPaid: false },
      data: {
        isPaid: true,
        paidAt: new Date(),
        status: "confirmed",
        paymentResult,
      },
    });
    if (claim.count === 0) return false;

    // Product flags/thresholds for backorder handling + low-stock alerting.
    const products = await tx.product.findMany({
      where: { id: { in: order.orderitems.map((i) => i.productId) } },
      select: {
        id: true,
        stock: true,
        allowBackorder: true,
        lowStockThreshold: true,
      },
    });
    const productById = new Map(products.map((p) => [p.id, p]));

    // ATOMIC stock decrement — only succeeds if stock is sufficient.
    // Prevents overselling when 2 users simultaneously buy the last item.
    // Backorder products decrement unconditionally (negative stock = pending
    // procurement, delivery arranged individually) and are never "oversold".
    //
    // Only for orders that did NOT reserve at placement. Reserved orders already
    // took their items out of stock (and already raised any low-stock alert);
    // running this again would double-count. Orders created before reservation
    // existed have stockReserved = false and still come through here.
    if (!order.stockReserved) {
      for (const item of order.orderitems) {
        const flags = productById.get(item.productId);
        const isBackorder = flags?.allowBackorder === true;

        if (isBackorder) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.qty } },
          });
        } else {
          const result = await tx.product.updateMany({
            where: { id: item.productId, stock: { gte: item.qty } },
            data: { stock: { decrement: item.qty } },
          });
          if (result.count === 0) {
            // Without a captured payment (admin/COD marking) it's safe to refuse.
            if (!paymentResult) throw new Error(t("notEnoughStock"));
            // Money already captured — stranding a charged customer is worse than
            // overselling. Let stock go negative and flag the order for review.
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { decrement: item.qty } },
            });
            oversoldItems.push(item.name);
          }
        }

        // Low-stock alert only when THIS order crosses the threshold, so the
        // admin gets one email per crossing instead of one per subsequent sale.
        if (flags && flags.lowStockThreshold > 0) {
          const prevStock = flags.stock;
          const newStock = prevStock - item.qty;
          if (prevStock > flags.lowStockThreshold && newStock <= flags.lowStockThreshold) {
            lowStockItems.push({
              name: item.name,
              stock: newStock,
              threshold: flags.lowStockThreshold,
            });
          }
        }
      }
    }

    // Record status change
    await tx.orderStatusHistory.create({
      data: {
        orderId,
        status: "confirmed",
        note: t("orderHasBeenPaid"),
        changedBy: changedBy ?? null,
      },
    });

    if (oversoldItems.length > 0) {
      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: "confirmed",
          note: `${t("paidWithInsufficientStock")}: ${oversoldItems.join(", ")}`,
        },
      });
    }

    // Re-validate and record coupon usage atomically with order payment.
    // The apply-time check (applyCouponToCart) can be bypassed by placing
    // several unpaid orders before paying, so the real cap must be enforced
    // here, at payment, under the transaction.
    if (order.couponCode && order.userId) {
      const coupon = await tx.coupon.findUnique({
        where: { code: order.couponCode },
      });
      if (coupon) {
        const now = new Date();
        const validNow =
          coupon.isActive &&
          coupon.validFrom <= now &&
          (!coupon.validUntil || coupon.validUntil >= now);

        const userUses = await tx.couponUsage.count({
          where: { couponId: coupon.id, userId: order.userId },
        });
        const perUserOk = userUses < coupon.maxUsesPerUser;

        // Atomically claim a global usage slot — the `usedCount < maxUses`
        // guard makes concurrent payments race-safe (only one wins the slot).
        let globalOk = true;
        if (validNow && perUserOk) {
          if (coupon.maxUses) {
            const claimSlot = await tx.coupon.updateMany({
              where: { id: coupon.id, usedCount: { lt: coupon.maxUses } },
              data: { usedCount: { increment: 1 } },
            });
            globalOk = claimSlot.count > 0;
          } else {
            await tx.coupon.update({
              where: { id: coupon.id },
              data: { usedCount: { increment: 1 } },
            });
          }
        }

        if (validNow && perUserOk && globalOk) {
          await tx.couponUsage.create({
            data: {
              couponId: coupon.id,
              userId: order.userId,
              orderId: order.id,
            },
          });
        } else {
          // Payment is already captured with the checkout discount applied, but
          // the coupon is no longer redeemable. Don't strand a paid customer —
          // mark paid, skip usage recording, and flag the order for admin review.
          await tx.orderStatusHistory.create({
            data: {
              orderId,
              status: "confirmed",
              note: `${t("couponNotRedeemableAtPayment")}: ${order.couponCode}`,
            },
          });
        }
      }
    }
    return true;
  });

  // A concurrent caller completed the payment first — everything below already ran.
  if (!claimed) return;

  // Send order confirmation email (best-effort — won't break order flow).
  // COD orders already got theirs when the order was placed.
  if (order.paymentMethod !== "CashOnDelivery") {
    await sendOrderConfirmationForOrder(orderId);
  }

  // Notify the admin about products this order pushed to/below their
  // low-stock threshold (best-effort, errors swallowed inside).
  if (lowStockItems.length > 0) {
    await sendLowStockAlertEmail({
      orderIdFormatted: orderId.slice(0, 8).toUpperCase(),
      items: lowStockItems,
    });
  }

  // Best-effort: create the Box Now voucher for locker orders once paid. No-op for
  // home delivery or if already created / credentials missing.
  try {
    await createBoxNowDeliveryForOrder(orderId);
  } catch (boxnowError) {
    console.error("Box Now delivery request failed:", boxnowError);
    // Surface the failure to the admin (order history + boxnowStatus) instead of
    // leaving a paid locker order with a silently missing voucher.
    try {
      const msg =
        boxnowError instanceof Error ? boxnowError.message : String(boxnowError);
      await prisma.order.update({
        where: { id: orderId },
        data: { boxnowStatus: "failed" },
      });
      await prisma.orderStatusHistory.create({
        data: {
          orderId,
          status: "confirmed",
          note: `${t("boxnowVoucherFailed")}: ${msg.slice(0, 300)}`,
        },
      });
    } catch (persistError) {
      console.error("Failed to record Box Now failure:", persistError);
    }
  }

  revalidatePath(`/order/${orderId}`);
  revalidatePath(`/en/order/${orderId}`);
  revalidateTag("orders", "max");
}
