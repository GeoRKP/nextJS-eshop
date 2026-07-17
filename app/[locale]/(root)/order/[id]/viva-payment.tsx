"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useTransition } from "react";
import { createVivaPaymentOrder } from "@/lib/actions/order.actions";
import { useTranslations } from "next-intl";
import { Loader2, Lock } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function VivaPayment({
  orderId,
  totalPrice,
}: {
  orderId: string;
  totalPrice: number | string;
}) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const tOrder = useTranslations("Order");
  const tCommon = useTranslations("Common");

  const handleClick = () => {
    startTransition(async () => {
      const res = await createVivaPaymentOrder(orderId);
      if (!res.success || !res.data?.checkoutUrl) {
        toast({
          variant: "destructive",
          description: res.error || tCommon("unknownError"),
        });
        return;
      }
      window.location.href = res.data.checkoutUrl;
    });
  };

  return (
    <div className="space-y-3">
      <div className="text-lg font-semibold">{tOrder("vivaCheckout")}</div>
      <Button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="w-full h-12 rounded-lg bg-brand-accent hover:bg-brand-accent-dark text-accent-foreground font-semibold text-sm sm:text-base uppercase tracking-wide active:scale-[0.98] transition-all"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Lock className="w-4 h-4 mr-2" />
        )}
        {isPending
          ? tOrder("purchasing")
          : tOrder("purchaseAmount", { amount: formatCurrency(totalPrice) })}
      </Button>
    </div>
  );
}
