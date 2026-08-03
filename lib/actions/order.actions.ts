"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { formatError, toPlainObject } from "../utils";
import { getAuthSession } from "@/lib/auth-session";
import { getMyCart } from "./cart.actions";
import { getUserById } from "./user.actions";
import { createInsertOrderSchema, updateOrderStatusSchema } from "../validators";
import { prisma } from "@/db/prisma";
import { CartItem, PaymentResult, ShippingAddress } from "@/types";
import { paypal } from "../paypal";
import {
  createPaymentOrder as createVivaApiOrder,
  retrieveTransaction as retrieveVivaTransaction,
  toVivaCountryCode,
  vivaCheckoutUrl,
  VIVA_STATUS_FINAL,
} from "../viva";
import { revalidatePath, revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { calcPrice, getCouponData } from "../pricing";
import { cancelParcel } from "../boxnow";
import { PAGE_SIZE, PAYMENT_METHODS } from "../constants";
import { Prisma } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { assertAdmin } from "@/lib/auth-guard";
import { sendOrderStatusEmail, sendLowStockAlertEmail } from "@/lib/email";
import { logAuditEvent } from "@/lib/audit-log";
import {
  updateOrderToPaid,
  sendOrderConfirmationForOrder,
} from "../order-fulfillment";

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
    // Recompute totals for the chosen shipping method (Box Now vs carrier have
    // different rates) — the cart totals may predate the method selection.
    const couponData = await getCouponData(cart.couponCode);
    const prices = calcPrice(
      cart.items as CartItem[],
      couponData,
      (addr.shippingMethod as string) ?? "home"
    );

    const order = createInsertOrderSchema(tV).parse({
      userId: userId,
      shippingAddress: user.address,
      shippingMethod: addr.shippingMethod ?? "home",
      paymentMethod: user.paymentMethod,
      itemsPrice: prices.itemsPrice,
      shippingPrice: prices.shippingPrice,
      taxPrice: prices.taxPrice,
      totalPrice: prices.totalPrice,
      couponCode: cart.couponCode,
      discountAmount: prices.discountAmount,
    });

    // Create a transaction to create order and order items

    // Snapshot the locker only for locker orders — a stale locker left over on the
    // saved address must not ride into a home-delivery order.
    const boxnowLocker = (
      order.shippingMethod === "boxnow_locker" ? (addr.boxnowLocker ?? null) : null
    ) as Prisma.InputJsonValue | null;
    // Guest sessions are keyed by email, so the same shadow User is handed to
    // whoever types that email next. Stamp the browser's cart session on the
    // order so only the visitor who placed it can open it later.
    const guestSessionId = session.user.isGuest
      ? ((await cookies()).get("sessionCartId")?.value ?? null)
      : null;

    const lowStockItems: { name: string; stock: number; threshold: number }[] = [];

    const insertedOrderId = await prisma.$transaction(async (tx) => {
      const insertedOrder = await tx.order.create({
        data: {
          ...order,
          status: "pending",
          guestSessionId,
          stockReserved: true,
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

      // Reserve stock at placement, not at payment. COD orders are only marked
      // paid by an admin hours or days later; until this reservation existed
      // nothing held the item, so two COD buyers could both take the last unit
      // and the second order became impossible to mark paid.
      const flags = await tx.product.findMany({
        where: { id: { in: (cart.items as CartItem[]).map((i) => i.productId) } },
        select: {
          id: true,
          stock: true,
          allowBackorder: true,
          lowStockThreshold: true,
        },
      });
      const flagsById = new Map(flags.map((p) => [p.id, p]));

      for (const item of cart.items as CartItem[]) {
        const productFlags = flagsById.get(item.productId);

        if (productFlags?.allowBackorder) {
          // Backorder items go negative on purpose: delivery is arranged individually.
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.qty } },
          });
        } else {
          const reserved = await tx.product.updateMany({
            where: { id: item.productId, stock: { gte: item.qty } },
            data: { stock: { decrement: item.qty } },
          });
          if (reserved.count === 0) {
            // Rolls the whole transaction back — no order, no partial reservation.
            throw new Error(t("notEnoughStock"));
          }
        }

        // Stock now drops here rather than at payment, so the threshold crossing
        // is detected here too — one alert per crossing, as before.
        if (productFlags && productFlags.lowStockThreshold > 0) {
          const newStock = productFlags.stock - item.qty;
          if (
            productFlags.stock > productFlags.lowStockThreshold &&
            newStock <= productFlags.lowStockThreshold
          ) {
            lowStockItems.push({
              name: item.name,
              stock: newStock,
              threshold: productFlags.lowStockThreshold,
            });
          }
        }
      }

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

    // Best-effort, outside the transaction: an email hiccup must not undo a
    // placed order.
    if (lowStockItems.length > 0) {
      await sendLowStockAlertEmail({
        orderIdFormatted: insertedOrderId.slice(0, 8).toUpperCase(),
        items: lowStockItems,
      });
    }

    // COD orders never hit updateOrderToPaid at checkout, so their confirmation
    // email goes out at placement time (best-effort).
    if (user.paymentMethod === "CashOnDelivery") {
      await sendOrderConfirmationForOrder(insertedOrderId);
    }

    // The cart was emptied inside the transaction — refresh its cache so the
    // header count and /cart don't show stale items after checkout.
    revalidatePath("/cart");
    revalidatePath("/en/cart");
    revalidateTag("cart", "max");

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

  // A guest session proves only "someone typed this email", and shadow accounts
  // are reused across visitors — so for guests, ownership of the User row is not
  // ownership of the order. Require the placing browser's cart session too.
  // Claiming the account (password reset) clears isGuest and lifts this.
  if (data && session.user.role !== "admin" && session.user.isGuest) {
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;
    if (!data.guestSessionId || data.guestSessionId !== sessionCartId) {
      return null;
    }
  }

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

    // Verify PayPal capture amount AND currency match the order before marking paid
    const capture = captureData.purchase_units[0]?.payments?.captures[0];
    const capturedAmount = Number(capture?.amount?.value);
    const capturedCurrency = capture?.amount?.currency_code;
    if (
      capturedCurrency !== "EUR" ||
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
        countryCode: toVivaCountryCode(
          (order.shippingAddress as ShippingAddress)?.country
        ),
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
  // Fail closed: a missing/empty merchantTrns must NOT bypass the ownership
  // binding — orderId is derived from the attacker-controllable webhook field.
  if (!tx.merchantTrns || tx.merchantTrns !== orderId) {
    throw new Error("Viva transaction does not belong to this order");
  }

  // 2) Transaction must be in a final/captured state.
  if (tx.statusId !== VIVA_STATUS_FINAL) {
    throw new Error(`Viva transaction is not final (StatusId=${tx.statusId})`);
  }

  // 3) Currency must be EUR. Viva may report either the ISO numeric code
  // ("978") or the alpha code ("EUR"); reject only a clearly-foreign currency
  // so a misconfigured payment source can't settle a non-EUR capture here.
  const currency = tx.currencyCode?.toString().toUpperCase();
  if (currency && currency !== "978" && currency !== "EUR") {
    throw new Error(`Viva currency mismatch: ${currency}`);
  }

  // 4) Amount must match the order total. Viva returns the amount in main currency units (euros).
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

    const order = await prisma.order.findFirst({
      where: { id },
      include: { orderitems: true },
    });
    if (!order) throw new Error(t("orderNotFound"));

    await prisma.$transaction(async (tx) => {
      // Deleting an order that still holds a reservation would lose that stock
      // for good — put it back unless it was already returned by a cancellation.
      if (order.stockReserved && order.status !== "cancelled") {
        for (const item of order.orderitems) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.qty } },
          });
        }
      }

      await tx.order.delete({ where: { id } });
    });

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
    const session = await assertAdmin();
    const t = await getTranslations("Actions");
    await updateOrderToPaid({ orderId, changedBy: session?.user?.id });

    await logAuditEvent({
      action: "order.markPaid",
      entity: "Order",
      entityId: orderId,
    });

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
    const session = await assertAdmin();
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
          changedBy: session?.user?.id,
        },
      });
    });

    await logAuditEvent({
      action: "order.deliver",
      entity: "Order",
      entityId: orderId,
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

    // The schema existed but was never called, so any string went straight into
    // the column — an order with a bogus status vanishes from every admin filter
    // and renders t(undefined) in the customer's order list.
    const parsed = updateOrderStatusSchema.parse({ orderId, status, note });

    const order = await prisma.order.findFirst({
      where: { id: parsed.orderId },
      include: { orderitems: true },
    });

    if (!order) throw new Error(t("orderNotFound"));

    const cancelling =
      parsed.status === "cancelled" && order.status !== "cancelled";

    await prisma.$transaction(async (tx) => {
      // Sync booleans with status. NOTE: moving to "confirmed" no longer implies
      // "paid" — payment marking goes through updateOrderToPaid (stock + coupons).
      const updateData: Record<string, unknown> = { status: parsed.status };

      if (parsed.status === "delivered") {
        updateData.isDelivered = true;
        updateData.deliveredAt = new Date();
      }

      // Return stock on cancellation — reserved at placement for new orders,
      // decremented at payment for orders predating the reservation.
      // "refunded" deliberately does NOT return stock: the goods come back
      // physically and the admin re-stocks them, which may never happen (damaged
      // returns), so an automatic increment would invent inventory.
      if (cancelling && (order.stockReserved || order.isPaid)) {
        for (const item of order.orderitems) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.qty } },
          });
        }
      }

      await tx.order.update({
        where: { id: parsed.orderId },
        data: updateData,
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: parsed.orderId,
          status: parsed.status,
          note: parsed.note,
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
