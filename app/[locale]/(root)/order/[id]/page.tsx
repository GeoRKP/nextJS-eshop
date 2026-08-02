import { getOrderById } from "@/lib/actions/order.actions";
import { notFound } from "next/navigation";
import OrderDetailsTable from "./order-details-table";
import { ShippingAddress } from "@/types";
import { getAuthSession } from "@/lib/auth-session";
import Stripe from "stripe";
import { prisma } from "@/db/prisma";
import { getTranslations } from "next-intl/server";
import OrderStatusTimeline from "@/components/shared/order-status-timeline";
import OrderStatusUpdate from "@/components/shared/order-status-update";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

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

  const [order, session] = await Promise.all([getOrderById(id), getAuthSession()]);

  if (!order) notFound();

  let client_secret = null;

  // Stripe is no longer an offered method; guard on the key so viewing a historical
  // unpaid Stripe order doesn't crash the page if the env var is removed.
  if (
    order.paymentMethod === "Stripe" &&
    !order.isPaid &&
    process.env.STRIPE_SECRET_KEY
  ) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Reuse existing PaymentIntent if one was already created for this order
    const existingPaymentResult = order.paymentResult as { id?: string } | null;
    if (existingPaymentResult?.id?.startsWith("pi_")) {
      const existingIntent = await stripe.paymentIntents.retrieve(
        existingPaymentResult.id
      );
      if (
        existingIntent.status !== "succeeded" &&
        existingIntent.status !== "canceled"
      ) {
        client_secret = existingIntent.client_secret;
      }
    }

    // Create a new PaymentIntent only if we don't have a reusable one
    if (!client_secret) {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(Number(order.totalPrice) * 100),
        currency: "EUR",
        metadata: { orderId: order.id },
      });

      // Store the PaymentIntent ID for reuse on subsequent visits
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentResult: {
            id: paymentIntent.id,
            email_address: "",
            status: "",
            pricePaid: 0,
          },
        },
      });

      client_secret = paymentIntent.client_secret;
    }
  }

  const isAdmin = session?.user?.role === "admin" || false;
  const isGuestOwner =
    Boolean(session?.user?.isGuest) && session?.user?.id === order.userId;
  const tAuth = isGuestOwner ? await getTranslations("Auth") : null;

  return (
    <div className="wrapper">
      <OrderDetailsTable
        order={{
          ...order,
          shippingAddress: order.shippingAddress as ShippingAddress,
        }}
        stripeClientSecret={client_secret}
        paypalClientId={process.env.PAYPAL_CLIENT_ID ?? ""}
        isAdmin={isAdmin}
      />
      {isGuestOwner && tAuth && (
        <div className="mt-6 card-premium p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <p className="font-semibold">{tAuth("claimAccountTitle")}</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {tAuth("claimAccountText")}
            </p>
          </div>
          <Button asChild variant="accent" className="shrink-0">
            <Link href="/forgot-password">
              <UserPlus className="w-4 h-4 mr-2" aria-hidden="true" />
              {tAuth("claimAccountCta")}
            </Link>
          </Button>
        </div>
      )}
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
