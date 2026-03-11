"use client";

import { cn } from "@/lib/utils";
import WishlistButton from "./wishlist-button";
import { useWishlist } from "./wishlist-provider";

export default function ProductCardWishlist({
  productId,
}: {
  productId: string;
}) {
  const { wishlistIds } = useWishlist();
  const inWishlist = wishlistIds.has(productId);

  return (
    <div
      className={cn(
        "absolute top-3 right-3 z-10 transition-opacity duration-200",
        inWishlist
          ? "opacity-100"
          : "md:opacity-0 md:group-hover:opacity-100"
      )}
    >
      <div className="bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-sm">
        <WishlistButton productId={productId} />
      </div>
    </div>
  );
}
