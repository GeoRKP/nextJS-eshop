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

  const handleApply = () => {
    if (!code.trim()) return;
    startTransition(async () => {
      const res = await applyCouponToCart(code);
      toast({
        description: res.message,
        variant: res.success ? "default" : "destructive",
      });
      if (res.success) {
        setCode("");
      }
    });
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
        <Tag className="w-4 h-4 text-green-600" />
        <span className="font-mono font-medium text-green-600">
          {appliedCode}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRemove}
          disabled={isPending}
          className="h-6 px-2"
        >
          <X className="w-3 h-3" />
          {t("removeCoupon")}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Input
        placeholder={t("enterCouponCode")}
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        className="font-mono uppercase"
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
      >
        {t("applyCoupon")}
      </Button>
    </div>
  );
}
