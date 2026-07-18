"use client";
import { CartItem, Cart } from "@/types";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { Plus, Minus, Loader, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { addItemToCart, removeItemFromCart } from "@/lib/actions/cart.actions";
import { useTransition } from "react";
import { useTranslations } from "next-intl";

export default function AddToCart({
  item,
  cart,
}: {
  item: CartItem;
  cart: Cart;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations("Product");

  const [isPending, startTransition] = useTransition();

  const handleAddToCart = async () => {
    startTransition(async () => {
      const res = await addItemToCart(item);
      if (!res.success) {
        toast({
          variant: "destructive",
          description: res?.message || "",
        });
        return;
      }

      toast({
        description: res.message,
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
    });
  };

  const handleRemoveFromCart = async () => {
    startTransition(async () => {
      const res = await removeItemFromCart(item.productId);

      toast({
        description: res.message,
        variant: res.success ? "default" : "destructive",
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

      return;
    });
  };

  // Check if item is in cart
  const existItem =
    cart && cart.items.find((x) => x.productId === item.productId);

  return existItem ? (
    <div className="flex items-stretch gap-2 w-full">
      <div className="flex items-stretch border-2 border-foreground bg-card">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={isPending}
          className="rounded-none h-13 w-13 hover:bg-accent hover:text-accent-foreground btn-stamp"
          onClick={handleRemoveFromCart}
        >
          {isPending ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : (
            <Minus className="h-4 w-4" />
          )}
        </Button>
        <span className="w-14 flex items-center justify-center font-mono font-bold text-lg tabular-nums select-none border-x border-border bg-muted/40">
          {String(existItem.qty).padStart(2, "0")}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={isPending}
          className="rounded-none h-13 w-13 hover:bg-accent hover:text-accent-foreground btn-stamp"
          onClick={handleAddToCart}
        >
          {isPending ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
        </Button>
      </div>
      <Button
        className="flex-1 h-13 rounded-none bg-foreground hover:bg-accent text-background hover:text-accent-foreground font-heading font-bold uppercase tracking-[0.16em] text-sm btn-stamp transition-colors"
        type="button"
        onClick={() => router.push("/cart")}
      >
        <ShoppingCart className="h-4 w-4 mr-2" />
        {t("goToCart")} →
      </Button>
    </div>
  ) : (
    <Button
      className="w-full h-14 rounded-none bg-accent hover:bg-foreground text-accent-foreground hover:text-background font-heading font-extrabold text-base uppercase tracking-[0.16em] btn-stamp transition-colors border-2 border-accent hover:border-foreground"
      type="button"
      disabled={isPending}
      onClick={handleAddToCart}
    >
      {isPending ? (
        <Loader className="h-5 w-5 animate-spin mr-2" />
      ) : (
        <ShoppingCart className="h-5 w-5 mr-2" />
      )}
      {t("addToCart")} →
    </Button>
  );
}
