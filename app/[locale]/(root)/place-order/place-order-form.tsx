"use client";

import { useRouter } from "@/i18n/navigation";
import { useToast } from "@/hooks/use-toast";
import { createOrder } from "@/lib/actions/order.actions";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

export default function PlaceOrderForm() {
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations("Checkout");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Guard against double-submit: a second click while the first createOrder()
    // is in flight would create a duplicate order (no idempotency key server-side).
    if (isPending) return;
    startTransition(async () => {
      const result = await createOrder();
      if (!result.success && result.message) {
        toast({ variant: "destructive", description: result.message });
      }
      if (result.redirectTo) {
        router.push(result.redirectTo);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <Button
        type="submit"
        disabled={isPending}
        className="w-full h-12 rounded-lg bg-brand-accent hover:bg-brand-accent-dark text-accent-foreground font-semibold text-base uppercase tracking-wide active:scale-[0.98] transition-all shadow-md hover:shadow-lg"
      >
        {isPending ? (
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
        ) : (
          <ShoppingBag className="w-5 h-5 mr-2" />
        )}
        {isPending ? t("orderProcessing") : t("confirmOrder")}
      </Button>
    </form>
  );
}
