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
            className="bg-primary text-primary-foreground hover:bg-primary/90"
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
            className="bg-primary text-primary-foreground hover:bg-primary/90"
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
    <div className="flex items-center gap-3 w-full">
      <div className="flex items-center border-2 border-border rounded-lg overflow-hidden">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-none h-12 w-12 hover:bg-brand-accent/10"
          onClick={handleRemoveFromCart}
        >
          {isPending ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : (
            <Minus className="h-4 w-4" />
          )}
        </Button>
        <span className="w-14 text-center font-semibold text-lg tabular-nums select-none">{existItem.qty}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-none h-12 w-12 hover:bg-brand-accent/10"
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
        className="flex-1 h-12 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold uppercase tracking-wide active:scale-[0.98] transition-all"
        type="button"
        onClick={() => router.push("/cart")}
      >
        <ShoppingCart className="h-4 w-4 mr-2" />
        {t("goToCart")}
      </Button>
    </div>
  ) : (
    <Button
      className="w-full h-13 rounded-lg bg-brand-accent hover:bg-brand-accent-dark text-accent-foreground font-semibold text-base uppercase tracking-wide shadow-card hover:shadow-card-hover active:scale-[0.98] transition-all"
      type="button"
      onClick={handleAddToCart}
    >
      {isPending ? (
        <Loader className="h-5 w-5 animate-spin mr-2" />
      ) : (
        <ShoppingCart className="h-5 w-5 mr-2" />
      )}
      {t("addToCart")}
    </Button>
  );
}
