"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { toggleWishlist } from "@/lib/actions/wishlist.actions";
import { addItemToCart } from "@/lib/actions/cart.actions";
import { ShoppingCart, Trash2 } from "lucide-react";

type WishlistProduct = {
  id: string;
  name: string;
  slug: string;
  price: string;
  images: string[];
  stock: number;
};

export default function WishlistActions({
  productId,
  product,
  displayName,
  onRemoved,
}: {
  productId: string;
  product: WishlistProduct;
  displayName?: string;
  onRemoved?: (removed: boolean) => void;
}) {
  const { toast } = useToast();
  const t = useTranslations("Wishlist");
  const [isPending, startTransition] = useTransition();

  const handleRemove = () => {
    // Optimistic: hide the tile now, restore it if the server refuses.
    onRemoved?.(true);
    startTransition(async () => {
      const res = await toggleWishlist(productId);
      if (!res.success) onRemoved?.(false);
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
        name: displayName ?? product.name,
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
        variant="accent"
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
        className="border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
        onClick={handleRemove}
        disabled={isPending}
      >
        <Trash2 className="w-4 h-4" />
        <span className="sr-only">{t("remove")}</span>
      </Button>
    </div>
  );
}
