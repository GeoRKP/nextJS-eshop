import { Button } from "@/components/ui/button";
import { getOrderById } from "@/lib/actions/order.actions";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import Stripe from "stripe";
import { getTranslations } from "next-intl/server";
import { CheckCircle2 } from "lucide-react";
import { formatId } from "@/lib/utils";

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
    <div className="wrapper max-w-2xl mx-auto py-12">
      <div className="card-premium p-8 md:p-12 flex flex-col items-center text-center gap-6">
        {/* Success icon */}
        <div className="w-20 h-20 rounded-full bg-brand-accent/10 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-brand-accent" />
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="h1-bold">{t("thanksForOrder")}</h1>
          <p className="text-muted-foreground font-mono text-sm">
            {t("orderNumber", { id: formatId(id) })}
          </p>
        </div>

        {/* Subtitle */}
        <p className="text-muted-foreground">
          {t("orderPlacedProcessing")}
        </p>

        {/* CTA */}
        <Button
          asChild
          className="h-12 px-8 rounded-lg bg-brand-accent hover:bg-brand-accent-dark text-white font-semibold uppercase tracking-wide active:scale-[0.98] transition-all"
        >
          <Link href={`/order/${id}`}>{t("viewOrder")}</Link>
        </Button>
      </div>
    </div>
  );
}
