"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { removeFromWishlist } from "@/lib/actions/wishlist.actions";
import { addItemToCart } from "@/lib/actions/cart.actions";
import { Product } from "@/types";
import { ShoppingCart, Trash2 } from "lucide-react";

export default function WishlistActions({
  productId,
  product,
}: {
  productId: string;
  product: Product;
}) {
  const { toast } = useToast();
  const t = useTranslations("Wishlist");
  const [isPending, startTransition] = useTransition();

  const handleRemove = () => {
    startTransition(async () => {
      const res = await removeFromWishlist(productId);
      toast({
        description: res.message,
        variant: res.success ? "default" : "destructive",
      });
    });
  };

  const handleAddToCart = () => {
    startTransition(async () => {
      const res = await addItemToCart({
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        qty: 1,
        image: product.images[0],
      });
      toast({
        description: res.message,
        variant: res.success ? "default" : "destructive",
      });
    });
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="default"
        size="sm"
        className="flex-1"
        onClick={handleAddToCart}
        disabled={isPending || product.stock < 1}
      >
        <ShoppingCart className="w-4 h-4 mr-1" />
        {t("addToCart")}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleRemove}
        disabled={isPending}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}
