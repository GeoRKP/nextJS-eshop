"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { formatError, toPlainObject, formatCurrency } from "../utils";
import { getAuthSession } from "@/lib/auth-session";
import { getMyCart } from "./cart.actions";
import { getUserById } from "./user.actions";
import { createInsertOrderSchema } from "../validators";
import { prisma } from "@/db/prisma";
import { CartItem, PaymentResult, ShippingAddress } from "@/types";
import { paypal } from "../paypal";
import {
  createPaymentOrder as createVivaApiOrder,
  retrieveTransaction as retrieveVivaTransaction,
  vivaCheckoutUrl,
  VIVA_STATUS_FINAL,
} from "../viva";
import { revalidatePath, revalidateTag } from "next/cache";
import { createBoxNowDeliveryForOrder } from "./boxnow.actions";
import { cancelParcel } from "../boxnow";
import { PAGE_SIZE, PAYMENT_METHODS } from "../constants";
import { Prisma } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { assertAdmin } from "@/lib/auth-guard";
import {
  sendOrderConfirmationEmail,
  sendOrderStatusEmail,
} from "@/lib/email";
import { logAuditEvent } from "@/lib/audit-log";

export async function createOrder() {
  try {
    const t = await getTranslations("Actions");
    const session = await getAuthSession();
    if (!session?.user) {
      throw new Error(t("userNotAuthenticated"));
    }

    const cart = await getMyCart();
    const userId = session?.user?.id;

    if (!userId) throw new Error(t("userNotFound"));

    const user = await getUserById(userId);

    if (!cart || cart.items.length === 0) {
      return {
        success: false,
        message: t("cartIsEmpty"),
        redirectTo: "/cart",
      };
    }

    // Also bounce methods that are no longer offered (e.g. a saved "PayPal"
    // preference from before the switch to Viva-only) back to re-selection.
    if (!user.paymentMethod || !PAYMENT_METHODS.includes(user.paymentMethod)) {
      return {
        success: false,
        message: t("noPaymentMethod"),
        redirectTo: "/payment-method",
      };
    }

    if (!user.address) {
      return {
        success: false,
        message: t("noShippingAddress"),
        redirectTo: "/shipping-address",
      };
    }

    // Create order object

    const tV = await getTranslations("Validation");
    const addr = (user.address ?? {}) as Record<string, unknown>;

    // Box Now lockers have no POS/cash — reject COD for locker orders unless the
    // account is explicitly COD-eligible (BOX NOW PAY ON THE GO).
    if (
      addr.shippingMethod === "boxnow_locker" &&
      user.paymentMethod === "CashOnDelivery" &&
      process.env.BOXNOW_COD_ENABLED !== "true"
    ) {
      return {
        success: false,
        message: t("codNotAllowedForLocker"),
        redirectTo: "/payment-method",
      };
    }
    const order = createInsertOrderSchema(tV).parse({
      userId: userId,
      shippingAddress: user.address,
      shippingMethod: addr.shippingMethod ?? "home",
      paymentMethod: user.paymentMethod,
      itemsPrice: cart.itemsPrice,
      shippingPrice: cart.shippingPrice,
      taxPrice: cart.taxPrice,
      totalPrice: cart.totalPrice,
      couponCode: cart.couponCode,
      discountAmount: cart.discountAmount,
    });

    // Create a transaction to create order and order items

    // Snapshot the locker only for locker orders — a stale locker left over on the
    // saved address must not ride into a home-delivery order.
    const boxnowLocker = (
      order.shippingMethod === "boxnow_locker" ? (addr.boxnowLocker ?? null) : null
    ) as Prisma.InputJsonValue | null;
    const insertedOrderId = await prisma.$transaction(async (tx) => {
      const insertedOrder = await tx.order.create({
        data: {
          ...order,
          status: "pending",
          // Json column: only set when present (avoids Prisma JsonNull handling).
          ...(boxnowLocker ? { boxnowLocker } : {}),
        },
      });

      await tx.orderItem.createMany({
        data: (cart.items as CartItem[]).map((item) => ({
          ...item,
          price: item.price,
          orderId: insertedOrder.id,
        })),
      });

      // Create initial status history entry
      await tx.orderStatusHistory.create({
        data: {
          orderId: insertedOrder.id,
          status: "pending",
          note: t("orderCreatedSuccessfully"),
        },
      });

      await tx.cart.update({
        where: {
          id: cart.id,
        },
        data: {
          items: [],
          totalPrice: 0,
          shippingPrice: 0,
          taxPrice: 0,
          itemsPrice: 0,
          couponCode: null,
          discountAmount: 0,
        },
      });

      return insertedOrder.id;
    });

    if (!insertedOrderId) throw new Error(t("orderNotCreated"));

    // COD orders never hit updateOrderToPaid at checkout, so their confirmation
    // email goes out at placement time (best-effort).
    if (user.paymentMethod === "CashOnDelivery") {
      await sendOrderConfirmationForOrder(insertedOrderId);
    }

    return {
      success: true,
      message: t("orderCreatedSuccessfully"),
      redirectTo: `/order/${insertedOrderId}`,
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      success: false,
      message: formatError(error),
    };
  }
}

// Get order by id (with ownership check — non-admin can only see own orders)

export async function getOrderById(orderId: string) {
  const session = await getAuthSession();
  if (!session?.user?.id) return null;

  const where: Prisma.OrderWhereInput =
    session.user.role === "admin"
      ? { id: orderId }
      : { id: orderId, userId: session.user.id };

  const data = await prisma.order.findFirst({
    where,
    include: {
      orderitems: true,
      user: { select: { name: true, email: true } },
      statusHistory: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return toPlainObject(data);
}

// Create paypal order

export async function createPaypalOrder(orderId: string) {
  try {
    const t = await getTranslations("Actions");
    const session = await getAuthSession();
    if (!session?.user?.id) throw new Error(t("userNotAuthenticated"));

    const where: Prisma.OrderWhereInput =
      session.user.role === "admin"
        ? { id: orderId }
        : { id: orderId, userId: session.user.id };

    const order = await prisma.order.findFirst({ where });

    if (order) {
      const paypalOrder = await paypal.createOrder(Number(order.totalPrice));

      //Update order with paypal order id

      await prisma.order.update({
        where: {
          id: orderId,
        },
        data: {
          paymentResult: {
            id: paypalOrder.id,
            email_address: "",
            status: "",
            pricePaid: 0,
          },
        },
      });

      return {
        success: true,
        message: t("itemOrderCreatedSuccessfully"),
        data: paypalOrder.id,
      };
    } else {
      throw new Error(t("orderNotFound"));
    }
  } catch (error) {
    return { success: false, error: formatError(error) };
  }
}

// Approve paypal order and update order to paid

export async function approvePaypalOrder(
  orderId: string,
  data: { orderID: string }
) {
  try {
    const t = await getTranslations("Actions");
    const session = await getAuthSession();
    if (!session?.user?.id) throw new Error(t("userNotAuthenticated"));

    const where: Prisma.OrderWhereInput =
      session.user.role === "admin"
        ? { id: orderId }
        : { id: orderId, userId: session.user.id };

    const order = await prisma.order.findFirst({ where });

    if (!order) throw new Error(t("orderNotFound"));

    const captureData = await paypal.capturePayment(data.orderID);

    if (
      !captureData ||
      captureData.id !== (order.paymentResult as PaymentResult)?.id ||
      captureData.status !== "COMPLETED"
    ) {
      throw new Error(t("errorInPaypalPayment"));
    }

    // Verify PayPal capture amount matches order total before marking paid
    const capturedAmount = Number(
      captureData.purchase_units[0]?.payments?.captures[0]?.amount?.value
    );
    if (
      Number.isNaN(capturedAmount) ||
      capturedAmount + 0.01 < Number(order.totalPrice)
    ) {
      throw new Error(t("errorInPaypalPayment"));
    }

    //Update order to paid
    await updateOrderToPaid({
      orderId,
      paymentResult: {
        id: captureData.id,
        status: captureData.status,
        email_address: captureData.payer.email_address,
        pricePaid:
          captureData.purchase_units[0]?.payments?.captures[0]?.amount?.value,
      },
    });

    revalidatePath(`/order/${orderId}`);
    revalidatePath(`/en/order/${orderId}`);
    revalidateTag("orders", "max");

    return {
      success: true,
      message: t("orderHasBeenPaid"),
    };
  } catch (error) {
    return { success: false, error: formatError(error) };
  }
}

// ── Viva.com (Smart Checkout) ──

/**
 * Create a Viva payment order for the given Order id and return the hosted-checkout URL.
 * We store the returned orderCode in `paymentResult.id` so webhook/return handlers can
 * find the order via Viva's `MerchantTrns` (which we set to our internal orderId).
 */
export async function createVivaPaymentOrder(orderId: string) {
  try {
    const t = await getTranslations("Actions");
    const session = await getAuthSession();
    if (!session?.user?.id) throw new Error(t("userNotAuthenticated"));

    const where: Prisma.OrderWhereInput =
      session.user.role === "admin"
        ? { id: orderId }
        : { id: orderId, userId: session.user.id };

    const order = await prisma.order.findFirst({
      where,
      include: { user: { select: { name: true, email: true } } },
    });
    if (!order) throw new Error(t("orderNotFound"));
    if (order.isPaid) throw new Error(t("orderAlreadyPaid"));

    const sourceCode = process.env.VIVA_SOURCE_CODE;
    if (!sourceCode) {
      throw new Error(
        "Viva source code is not configured. Set VIVA_SOURCE_CODE."
      );
    }

    // Amount must be an integer number of cents.
    const amountCents = Math.round(Number(order.totalPrice) * 100);
    const idShort = order.id.slice(0, 8).toUpperCase();

    const { orderCode } = await createVivaApiOrder({
      amount: amountCents,
      customerTrns: `Order #${idShort}`,
      // MerchantTrns is the field Viva echoes back in webhooks — we put our orderId here.
      merchantTrns: order.id,
      sourceCode,
      customer: {
        email: order.user?.email,
        fullName: order.user?.name,
        countryCode: (order.shippingAddress as ShippingAddress)?.country,
        requestLang: process.env.VIVA_REQUEST_LANG || "el-GR",
      },
      tags: [order.id],
    });

    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentResult: {
          id: orderCode,
          status: "pending",
          email_address: order.user?.email || "",
          pricePaid: "0",
        },
      },
    });

    return {
      success: true,
      message: t("itemOrderCreatedSuccessfully"),
      data: { orderCode, checkoutUrl: vivaCheckoutUrl(orderCode) },
    };
  } catch (error) {
    return { success: false, error: formatError(error) };
  }
}

/**
 * Verify a Viva payment server-side by transactionId and mark the order as paid.
 * Called from both the return-URL handler (synchronous redirect-back from Viva)
 * and the webhook handler (async server-to-server notification). Idempotent.
 */
export async function verifyVivaTransaction({
  orderId,
  transactionId,
}: {
  orderId: string;
  transactionId: string;
}) {
  const t = await getTranslations("Actions");

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error(t("orderNotFound"));
  if (order.isPaid) {
    // Idempotent — already paid by an earlier webhook/return-URL call.
    return { success: true, message: t("orderAlreadyPaid") };
  }

  const tx = await retrieveVivaTransaction(transactionId);

  // 1) Transaction must point back to this order via merchantTrns.
  if (tx.merchantTrns && tx.merchantTrns !== orderId) {
    throw new Error("Viva transaction does not belong to this order");
  }

  // 2) Transaction must be in a final/captured state.
  if (tx.statusId !== VIVA_STATUS_FINAL) {
    throw new Error(`Viva transaction is not final (StatusId=${tx.statusId})`);
  }

  // 3) Amount must match the order total. Viva returns the amount in main currency units (euros).
  const expected = Number(order.totalPrice);
  const received = Number(tx.amount);
  if (Number.isNaN(received) || received + 0.01 < expected) {
    throw new Error(
      `Viva amount mismatch: expected ${expected}, received ${received}`
    );
  }

  await updateOrderToPaid({
    orderId,
    paymentResult: {
      id: tx.transactionId,
      status: "COMPLETED",
      email_address: tx.email || "",
      pricePaid: received.toFixed(2),
    },
  });

  return { success: true, message: t("orderHasBeenPaid") };
}

// Not exported — helper, not a server action.
async function sendOrderConfirmationForOrder(orderId: string) {
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
      await sendOrderConfirmationEmail(fullOrder.user.email, {
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
    }
  } catch (emailError) {
    console.error("Order confirmation email failed:", emailError);
  }
}

export async function updateOrderToPaid({
  orderId,
  paymentResult,
}: {
  orderId: string;
  paymentResult?: PaymentResult;
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

    // ATOMIC stock decrement — only succeeds if stock is sufficient.
    // Prevents overselling when 2 users simultaneously buy the last item.
    for (const item of order.orderitems) {
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

    // Record status change
    await tx.orderStatusHistory.create({
      data: {
        orderId,
        status: "confirmed",
        note: t("orderHasBeenPaid"),
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

    // Record coupon usage atomically with order payment.
    // Prevents users from re-using single-use coupons across multiple orders.
    if (order.couponCode && order.userId) {
      const coupon = await tx.coupon.findUnique({
        where: { code: order.couponCode },
      });
      if (coupon) {
        await tx.couponUsage.create({
          data: {
            couponId: coupon.id,
            userId: order.userId,
            orderId: order.id,
          },
        });
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } },
        });
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

// Get the users orders

export async function getMyOrders({
  limit = PAGE_SIZE,
  page,
}: {
  limit?: number;
  page: number;
}) {
  const session = await getAuthSession();
  if (!session?.user) {
    const t = await getTranslations("Actions");
    throw new Error(t("userNotAuthenticated"));
  }

  const data = await prisma.order.findMany({
    where: {
      userId: session?.user?.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
    skip: (page - 1) * limit,
  });

  const dataCount = await prisma.order.count({
    where: {
      userId: session?.user?.id,
    },
  });

  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
  };
}

type SalesDataType = {
  month: string;
  totalSales: number;
}[];

// Get sales data and order summary

export async function getOrderSummary() {
  await assertAdmin();
  // Get counts for each resource
  const ordersCount = await prisma.order.count();
  const productsCount = await prisma.product.count();
  const usersCount = await prisma.user.count();

  // Calculate the total sales
  const totalSales = await prisma.order.aggregate({
    _sum: {
      totalPrice: true,
    },
  });

  // Get monthly sales
  const salesDataRaw = await prisma.$queryRaw<
    Array<{ month: string; totalSales: Prisma.Decimal }>
  >`SELECT to_char("createdAt", 'MM/YY') as "month", sum("totalPrice") as "totalSales" FROM "Order" GROUP BY to_char("createdAt", 'MM/YY')`;

  const salesData: SalesDataType = salesDataRaw.map((item) => ({
    month: item.month,
    totalSales: Number(item.totalSales),
  }));

  // Get latest sales
  const latestSales = await prisma.order.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: { select: { name: true } },
    },
    take: 6,
  });

  return {
    ordersCount,
    productsCount,
    usersCount,
    totalSales,
    latestSales,
    salesData,
  };
}

// Get all orders

export async function getAllOrders({
  limit = PAGE_SIZE,
  page,
  query,
  status,
}: {
  limit?: number;
  page: number;
  query: string;
  status?: string;
}) {
  await assertAdmin();

  const queryFilter: Prisma.OrderWhereInput = query && query !== "all" ? {
    user: {
      name: {
        contains: query,
        mode: "insensitive",
      } as Prisma.StringFilter,
    },
  } : {};

  const statusFilter: Prisma.OrderWhereInput = status && status !== "all"
    ? { status }
    : {};

  const data = await prisma.order.findMany({
    where: {
      ...queryFilter,
      ...statusFilter,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
    skip: (page - 1) * limit,
    include: {
      user: { select: { name: true } },
    },
  });

  const dataCount = await prisma.order.count({
    where: {
      ...queryFilter,
      ...statusFilter,
    },
  });

  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
  };
}

// Delete order

export async function deleteOrder(id: string) {
  try {
    await assertAdmin();
    const t = await getTranslations("Actions");
    await prisma.order.delete({ where: { id } });

    await logAuditEvent({
      action: "order.delete",
      entity: "Order",
      entityId: id,
    });

    revalidatePath("/admin/orders");
    revalidateTag("orders", "max");

    return { success: true, message: t("orderDeletedSuccessfully") };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Update COD order to paid

export async function updateOrderToPaidCOD(orderId: string) {
  try {
    await assertAdmin();
    const t = await getTranslations("Actions");
    await updateOrderToPaid({ orderId });

    revalidatePath(`/order/${orderId}`);
    revalidatePath(`/en/order/${orderId}`);
    revalidateTag("orders", "max");

    return { success: true, message: t("orderMarkedAsPaid") };

  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

//Update COD order to delivered

export async function deliverOrder(orderId: string) {
  try {
    await assertAdmin();
    const t = await getTranslations("Actions");
    const order = await prisma.order.findFirst({
      where: { id: orderId },
    });

    if (!order) throw new Error(t("orderNotFound"));

    if (!order.isPaid) throw new Error(t("orderNotPaid"));

    if (order.isDelivered) throw new Error(t("orderAlreadyDelivered"));

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          isDelivered: true,
          deliveredAt: new Date(),
          status: "delivered",
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: "delivered",
          note: t("orderMarkedAsDelivered"),
        },
      });
    });

    revalidatePath(`/order/${orderId}`);
    revalidatePath(`/en/order/${orderId}`);
    revalidateTag("orders", "max");

    return { success: true, message: t("orderMarkedAsDelivered") };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Update order status (admin)

export async function updateOrderStatus({
  orderId,
  status,
  note,
}: {
  orderId: string;
  status: string;
  note?: string | null;
}) {
  try {
    const session = await assertAdmin();
    const t = await getTranslations("Actions");

    const order = await prisma.order.findFirst({
      where: { id: orderId },
      include: { orderitems: true },
    });

    if (!order) throw new Error(t("orderNotFound"));

    const cancelling = status === "cancelled" && order.status !== "cancelled";

    await prisma.$transaction(async (tx) => {
      // Sync booleans with status. NOTE: moving to "confirmed" no longer implies
      // "paid" — payment marking goes through updateOrderToPaid (stock + coupons).
      const updateData: Record<string, unknown> = { status };

      if (status === "delivered") {
        updateData.isDelivered = true;
        updateData.deliveredAt = new Date();
      }

      // Cancelling a paid order returns its stock (it was decremented on payment).
      if (cancelling && order.isPaid) {
        for (const item of order.orderitems) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.qty } },
          });
        }
      }

      await tx.order.update({
        where: { id: orderId },
        data: updateData,
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status,
          note,
          changedBy: session?.user?.id,
        },
      });
    });

    // Best-effort: cancel any Box Now parcels so the shipment doesn't go out.
    if (cancelling && order.boxnowParcelIds.length > 0) {
      try {
        for (const parcelId of order.boxnowParcelIds) {
          await cancelParcel(parcelId);
        }
        await prisma.order.update({
          where: { id: orderId },
          data: { boxnowStatus: "cancelled" },
        });
        await prisma.orderStatusHistory.create({
          data: { orderId, status, note: "Box Now: parcels cancelled" },
        });
      } catch (boxnowError) {
        console.error("Box Now parcel cancel failed:", boxnowError);
        await prisma.orderStatusHistory
          .create({
            data: {
              orderId,
              status,
              note: `Box Now: parcel cancel FAILED — cancel manually (${
                boxnowError instanceof Error ? boxnowError.message.slice(0, 200) : ""
              })`,
            },
          })
          .catch(() => {});
      }
    }

    // Send status update email to customer (best-effort)
    try {
      const fullOrder = await prisma.order.findUnique({
        where: { id: orderId },
        include: { user: { select: { name: true, email: true } } },
      });
      if (fullOrder?.user?.email) {
        await sendOrderStatusEmail(fullOrder.user.email, {
          customerName: fullOrder.user.name || "",
          orderId: fullOrder.id,
          orderIdFormatted: fullOrder.id.slice(0, 8).toUpperCase(),
          status,
          note: note || null,
        });
      }
    } catch (emailError) {
      console.error("Order status email failed:", emailError);
    }

    await logAuditEvent({
      action: "order.statusUpdate",
      entity: "Order",
      entityId: orderId,
      details: { status, note: note || undefined },
    });

    revalidatePath(`/order/${orderId}`);
    revalidatePath(`/en/order/${orderId}`);
    revalidatePath("/admin/orders");
    revalidateTag("orders", "max");

    return { success: true, message: t("orderStatusUpdatedSuccessfully") };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Get order status history (with ownership check)
export async function getOrderStatusHistory(orderId: string) {
  const session = await getAuthSession();
  if (!session?.user?.id) return [];

  // Verify order ownership before exposing history
  const order = await prisma.order.findFirst({
    where: { id: orderId },
    select: { userId: true },
  });
  if (!order) return [];
  if (session.user.role !== "admin" && order.userId !== session.user.id) {
    return [];
  }

  const data = await prisma.orderStatusHistory.findMany({
    where: { orderId },
    orderBy: { createdAt: "asc" },
  });

  return toPlainObject(data);
}
