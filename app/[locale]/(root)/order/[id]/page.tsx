import { getOrderById } from "@/lib/actions/order.actions";
import { notFound } from "next/navigation";
import OrderDetailsTable from "./order-details-table";
import { ShippingAddress } from "@/types";
import { auth } from "@/auth";
import Stripe from "stripe";
import { getTranslations } from "next-intl/server";
import OrderStatusTimeline from "@/components/shared/order-status-timeline";
import OrderStatusUpdate from "@/components/shared/order-status-update";

export async function generateMetadata() {
  const t = await getTranslations("Metadata");
  return {
    title: t("orderDetails"),
  };
}

export default async function OrderDetailPage(props: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await props.params;

  const order = await getOrderById(id);

  if (!order) notFound();

  const session = await auth();

  let client_secret = null;

  if (order.paymentMethod === "Stripe" && !order.isPaid) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(order.totalPrice) * 100),
      currency: "EUR",
      metadata: {
        orderId: order.id,
      },
    });

    client_secret = paymentIntent.client_secret;
  }

  const isAdmin = session?.user?.role === "admin" || false;

  return (
    <div className="wrapper">
      <OrderDetailsTable
        order={{
          ...order,
          shippingAddress: order.shippingAddress as ShippingAddress,
        }}
        stripeClientSecret={client_secret}
        paypalClientId={process.env.PAYPAL_CLIENT_ID || "sb"}
        isAdmin={isAdmin}
      />
      <div className="mt-6 grid md:grid-cols-3 md:gap-5">
        <div className="col-span-2">
          {order.statusHistory && order.statusHistory.length > 0 && (
            <OrderStatusTimeline history={order.statusHistory} />
          )}
        </div>
        {isAdmin && (
          <div>
            <OrderStatusUpdate orderId={order.id} currentStatus={order.status || "pending"} />
          </div>
        )}
      </div>
    </div>
  );
}
