import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  LinkAuthenticationElement,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useTheme } from "next-themes";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { SERVER_URL } from "@/lib/constants";
import { useTranslations } from "next-intl";
import { Lock } from "lucide-react";

// Module-level stripePromise — only loaded once
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY! as string
);

export default function StripePayment({
  priceInCents,
  orderId,
  clientSecret,
}: {
  priceInCents: number;
  orderId: string;
  clientSecret: string | null;
}) {
  const { theme, systemTheme } = useTheme();

  const StripeForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const t = useTranslations("Order");

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [email, setEmail] = useState("");

    const handleSubmit = async (e: FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      if (!stripe || !elements || !email) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      stripe
        .confirmPayment({
          elements,
          confirmParams: {
            return_url: `${SERVER_URL}/order/${orderId}/stripe-payment-success`,
          },
        })
        .then(({ error }) => {
          if (
            error?.type === "card_error" ||
            error?.type === "validation_error"
          ) {
            setErrorMessage(error?.message ?? "An unknown error occurred");
          } else if (error) {
            setErrorMessage("An unknown error occurred");
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    };

    return (
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="text-lg font-semibold">{t("stripeCheckout")}</div>
        {errorMessage && <div className="text-destructive text-sm">{errorMessage}</div>}
        <PaymentElement />
        <div>
          <LinkAuthenticationElement
            onChange={(e) => {
              setEmail(e.value.email);
            }}
          />
        </div>
        <Button
          className="w-full h-12 rounded-lg bg-brand-accent hover:bg-brand-accent-dark text-white font-semibold text-base uppercase tracking-wide active:scale-[0.98] transition-all"
          type="submit"
          disabled={isLoading || !stripe || !elements}
        >
          <Lock className="w-4 h-4 mr-2" />
          {isLoading
            ? t("purchasing")
            : t("purchaseAmount", { amount: formatCurrency(priceInCents / 100) })}
        </Button>
      </form>
    );
  };

  return (
    <Elements
      options={{
        clientSecret: clientSecret ?? undefined,
        appearance: {
          theme:
            theme === "dark"
              ? "night"
              : theme === "light"
              ? "stripe"
              : systemTheme === "light"
              ? "stripe"
              : "night",
        },
      }}
      stripe={stripePromise}
    >
      <StripeForm />
    </Elements>
  );
}
