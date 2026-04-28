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

  const handleAdd = async () => {
    let res: { success: boolean; message: string };
    await new Promise<void>((resolve) => {
      startTransition(async () => {
        res = await addItemToCart(item);
        resolve();
      });
    });
    if (!res!.success) {
      toast({ variant: "destructive", description: res!.message });
      return;
    }
    setAdded(true);
    toast({
      description: res!.message,
      action: (
        <ToastAction
          altText={t("goToCart")}
          className="bg-primary text-background hover:bg-primary/90"
          onClick={() => router.push("/cart")}
        >
          {t("goToCart")}
        </ToastAction>
      ),
    });
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <Button
      size="icon"
      variant="ghost"
      aria-label={t("addToCart")}
      className={`h-10 w-10 rounded-none border transition-all btn-stamp ${
        added
          ? "border-success bg-success/10 text-success"
          : "border-foreground bg-background text-foreground hover:bg-accent hover:text-accent-foreground hover:border-accent"
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
