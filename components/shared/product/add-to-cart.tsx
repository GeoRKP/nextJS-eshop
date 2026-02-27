"use client";
import { CartItem, Cart } from "@/types";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { Plus, Minus, Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { addItemToCart, removeItemFromCart } from "@/lib/actions/cart.actions";
import { useTransition } from "react";
import { useTranslations } from "next-intl";
import AnimatedButton from "@/components/shared/animated-button";

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
            className="bg-primary text-white hover:bg-gray-800"
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
            className="bg-primary text-white hover:bg-gray-800"
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
    <div>
      <Button type="button" variant="outline" onClick={handleRemoveFromCart}>
        {isPending ? (
          <Loader className="h-4 w-4 animate-spin" />
        ) : (
          <Minus className="h-4 w-4" />
        )}
      </Button>
      <span className="px-2">{existItem.qty}</span>
      <Button type="button" variant="outline" onClick={handleAddToCart}>
        {isPending ? (
          <Loader className="h-4 w-4 animate-spin" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
      </Button>
    </div>
  ) : (
    <AnimatedButton>
      <Button className="w-full" type="button" onClick={handleAddToCart}>
        {isPending ? (
          <Loader className="h-4 w-4 animate-spin" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
        {t("addToCart")}
      </Button>
    </AnimatedButton>
  );
}
