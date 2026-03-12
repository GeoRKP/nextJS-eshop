"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { applyCouponToCart, removeCouponFromCart } from "@/lib/actions/cart.actions";
import { Tag, X } from "lucide-react";

export default function CouponInput({
  appliedCode,
}: {
  appliedCode?: string | null;
}) {
  const { toast } = useToast();
  const t = useTranslations("Cart");
  const [isPending, startTransition] = useTransition();
  const [code, setCode] = useState("");

  const handleApply = async () => {
    if (!code.trim()) return;
    let res: { success: boolean; message: string };
    await new Promise<void>((resolve) => {
      startTransition(async () => {
        res = await applyCouponToCart(code);
        resolve();
      });
    });
    toast({
      description: res!.message,
      variant: res!.success ? "default" : "destructive",
    });
    if (res!.success) {
      setCode("");
    }
  };

  const handleRemove = () => {
    startTransition(async () => {
      const res = await removeCouponFromCart();
      toast({
        description: res.message,
        variant: res.success ? "default" : "destructive",
      });
    });
  };

  if (appliedCode) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <div className="flex items-center gap-1.5 bg-brand-accent/10 text-brand-accent rounded-full px-3 py-1">
          <Tag className="w-3.5 h-3.5" />
          <span className="font-mono font-medium">
            {appliedCode}
          </span>
        </div>
        <button
          onClick={handleRemove}
          disabled={isPending}
          className="text-muted-foreground hover:text-destructive transition-colors p-1"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Input
        placeholder={t("enterCouponCode")}
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        className="font-mono uppercase rounded-lg"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleApply();
          }
        }}
      />
      <Button
        variant="outline"
        onClick={handleApply}
        disabled={isPending || !code.trim()}
        className="rounded-lg"
      >
        {t("applyCoupon")}
      </Button>
    </div>
  );
}
