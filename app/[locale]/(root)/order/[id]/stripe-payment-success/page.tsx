import { Button } from "@/components/ui/button";
import { getOrderById } from "@/lib/actions/order.actions";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import Stripe from "stripe";
import { getTranslations } from "next-intl/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export default async function StripePaymentSuccess(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ payment_intent: string }>;
}) {
  const { id } = await props.params;
  const { payment_intent: paymentIntentId } = await props.searchParams;

  const order = await getOrderById(id);

  if (!order) notFound();

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (
    paymentIntent.metadata.orderId === null ||
    paymentIntent.metadata.orderId !== order.id.toString()
  ) {
    return notFound();
  }

  const isSuccess = paymentIntent.status === "succeeded";

  if (!isSuccess) return redirect(`/order/${id}`);

  const t = await getTranslations("Order");

  return (
    <div className="wrapper max-w-4xl w-full mx-auto space-y-8">
      <div className="flex flex-col gap-6 items-center">
        <h1 className="h1-bold">{t("thanksForOrder")}</h1>
        <div>{t("orderPlacedProcessing")}</div>
        <Button asChild>
          <Link href={`/order/${id}`}>{t("viewOrder")}</Link>
        </Button>
      </div>
    </div>
  );
}
