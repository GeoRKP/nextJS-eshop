"use client";

import { useRouter } from "@/i18n/navigation";
import { createOrder } from "@/lib/actions/order.actions";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

export default function PlaceOrderForm() {
  const router = useRouter();
  const t = useTranslations("Checkout");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = await createOrder();
    if (result.redirectTo) {
      router.push(result.redirectTo);
    }
  };

  const PlaceOrderButton = () => {
    const { pending } = useFormStatus();
    return (
      <Button
        disabled={pending}
        className="w-full h-12 rounded-lg bg-brand-accent hover:bg-brand-accent-dark text-white font-semibold text-base uppercase tracking-wide active:scale-[0.98] transition-all shadow-md hover:shadow-lg"
      >
        {pending ? (
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
        ) : (
          <ShoppingBag className="w-5 h-5 mr-2" />
        )}
        {pending ? t("orderProcessing") : t("confirmOrder")}
      </Button>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <PlaceOrderButton />
    </form>
  );
}
