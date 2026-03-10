"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { formatError, toPlainObject } from "../utils";
import { getAuthSession } from "@/lib/auth-session";
import { getMyCart } from "./cart.actions";
import { getUserById } from "./user.actions";
import { createInsertOrderSchema } from "../validators";
import { prisma } from "@/db/prisma";
import { CartItem, PaymentResult } from "@/types";
import { paypal } from "../paypal";
import { revalidatePath, revalidateTag } from "next/cache";
import { PAGE_SIZE } from "../constants";
import { Prisma } from "@prisma/client";
import { getTranslations } from "next-intl/server";

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

    if (!user.paymentMethod) {
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
    const order = createInsertOrderSchema(tV).parse({
      userId: userId,
      shippingAddress: user.address,
      paymentMethod: user.paymentMethod,
      itemsPrice: cart.itemsPrice,
      shippingPrice: cart.shippingPrice,
      taxPrice: cart.taxPrice,
      totalPrice: cart.totalPrice,
      couponCode: cart.couponCode,
      discountAmount: cart.discountAmount,
    });

    // Create a transaction to create order and order items

    const insertedOrderId = await prisma.$transaction(async (tx) => {
      const insertedOrder = await tx.order.create({
        data: {
          ...order,
          status: "pending",
        },
      });

      for (const item of cart.items as CartItem[]) {
        await tx.orderItem.create({
          data: {
            ...item,
            price: item.price,
            orderId: insertedOrder.id,
          },
        });
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

    return {
      success: true,
      message: t("orderCreatedSuccessfully"),
      redirectTo: `/order/${insertedOrderId}`,
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      success: false,
      error: formatError(error),
    };
  }
}

// Get order by id

export async function getOrderById(orderId: string) {
  const data = await prisma.order.findFirst({
    where: {
      id: orderId,
    },
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
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
      },
    });

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
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
      },
    });

    if (!order) throw new Error(t("orderNotFound"));

    const captureData = await paypal.capturePayment(data.orderID);

    if (
      !captureData ||
      captureData.id !== (order.paymentResult as PaymentResult)?.id ||
      captureData.status !== "COMPLETED"
    ) {
      throw new Error(t("errorInPaypalPayment"));
    }

    //Update order to paid
    updateOrderToPaid({
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
    revalidateTag("orders");

    return {
      success: true,
      message: t("orderHasBeenPaid"),
    };
  } catch (error) {
    return { success: false, error: formatError(error) };
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

  await prisma.$transaction(async (tx) => {
    // Batch update stock for all order items
    await Promise.all(
      order.orderitems.map((item) =>
        tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: -item.qty } },
        })
      )
    );

    await tx.order.update({
      where: { id: orderId },
      data: {
        isPaid: true,
        paidAt: new Date(),
        status: "confirmed",
        paymentResult,
      },
    });

    // Record status change
    await tx.orderStatusHistory.create({
      data: {
        orderId,
        status: "confirmed",
        note: t("orderHasBeenPaid"),
      },
    });
  });

  revalidatePath(`/order/${orderId}`);
  revalidatePath(`/en/order/${orderId}`);
  revalidateTag("orders");
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
    const t = await getTranslations("Actions");
    await prisma.order.delete({ where: { id } });

    revalidatePath("/admin/orders");
    revalidateTag("orders");

    return { success: true, message: t("orderDeletedSuccessfully") };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Update COD order to paid

export async function updateOrderToPaidCOD(orderId: string) {
  try {
    const t = await getTranslations("Actions");
    await updateOrderToPaid({ orderId });

    revalidatePath(`/order/${orderId}`);
    revalidatePath(`/en/order/${orderId}`);
    revalidateTag("orders");

    return { success: true, message: t("orderMarkedAsPaid") };

  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

//Update COD order to delivered

export async function deliverOrder(orderId: string) {
  try {
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
    revalidateTag("orders");

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
    const t = await getTranslations("Actions");
    const session = await getAuthSession();

    const order = await prisma.order.findFirst({
      where: { id: orderId },
    });

    if (!order) throw new Error(t("orderNotFound"));

    await prisma.$transaction(async (tx) => {
      // Sync booleans with status
      const updateData: Record<string, unknown> = { status };

      if (status === "delivered") {
        updateData.isDelivered = true;
        updateData.deliveredAt = new Date();
      }
      if (status === "confirmed" && !order.isPaid) {
        updateData.isPaid = true;
        updateData.paidAt = new Date();
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

    revalidatePath(`/order/${orderId}`);
    revalidatePath(`/en/order/${orderId}`);
    revalidatePath("/admin/orders");
    revalidateTag("orders");

    return { success: true, message: t("orderStatusUpdatedSuccessfully") };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Get order status history
export async function getOrderStatusHistory(orderId: string) {
  const data = await prisma.orderStatusHistory.findMany({
    where: { orderId },
    orderBy: { createdAt: "asc" },
  });

  return toPlainObject(data);
}
