"use client";

import { useRouter } from "@/i18n/navigation";
import { useToast } from "@/hooks/use-toast";
import { createOrder } from "@/lib/actions/order.actions";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

function PlaceOrderButton() {
  const { pending } = useFormStatus();
  const t = useTranslations("Checkout");
  return (
    <Button
      disabled={pending}
      className="w-full h-12 rounded-lg bg-brand-accent hover:bg-brand-accent-dark text-accent-foreground font-semibold text-base uppercase tracking-wide active:scale-[0.98] transition-all shadow-md hover:shadow-lg"
    >
      {pending ? (
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
      ) : (
        <ShoppingBag className="w-5 h-5 mr-2" />
      )}
      {pending ? t("orderProcessing") : t("confirmOrder")}
    </Button>
  );
}

export default function PlaceOrderForm() {
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = await createOrder();
    if (!result.success && result.message) {
      toast({ variant: "destructive", description: result.message });
    }
    if (result.redirectTo) {
      router.push(result.redirectTo);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <PlaceOrderButton />
    </form>
  );
}
