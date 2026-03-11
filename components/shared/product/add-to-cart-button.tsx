"use client";

import { Button } from "@/components/ui/button";
import { ShoppingCart, Loader, Check } from "lucide-react";
import { addItemToCart } from "@/lib/actions/cart.actions";
import { useTransition, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { CartItem } from "@/types";

export default function AddToCartButton({ item }: { item: CartItem }) {
  const [isPending, startTransition] = useTransition();
  const [added, setAdded] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const t = useTranslations("Product");

  const handleAdd = () => {
    startTransition(async () => {
      const res = await addItemToCart(item);
      if (!res.success) {
        toast({ variant: "destructive", description: res.message });
        return;
      }
      setAdded(true);
      toast({
        description: res.message,
        action: (
          <ToastAction
            altText={t("goToCart")}
            className="bg-primary text-white hover:bg-gray-800"
            onClick={() => router.push("/cart")}
          >
            {t("goToCart")}
          </ToastAction>
        ),
      });
      setTimeout(() => setAdded(false), 2000);
    });
  };

  return (
    <Button
      size="icon"
      variant="ghost"
      className={`h-9 w-9 rounded-full transition-all ${
        added
          ? "bg-green-500/15 text-green-600"
          : "hover:bg-brand-accent/15 text-muted-foreground hover:text-brand-accent"
      }`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleAdd();
      }}
      disabled={isPending}
    >
      {isPending ? (
        <Loader className="h-4 w-4 animate-spin" />
      ) : added ? (
        <Check className="h-4 w-4" />
      ) : (
        <ShoppingCart className="h-4 w-4" />
      )}
    </Button>
  );
}
