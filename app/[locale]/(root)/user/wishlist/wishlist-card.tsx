"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import ProductPrice from "@/components/shared/product/product-price";
import WishlistActions from "./wishlist-actions";
import { useState } from "react";

type WishlistProduct = {
  id: string;
  name: string;
  slug: string;
  price: string;
  images: string[];
  stock: number;
};

/**
 * Owns the card so removal can be optimistic — the whole tile disappears on
 * click instead of lingering until the server round-trip finishes, matching
 * the heart toggle on the product page.
 */
export default function WishlistCard({
  productId,
  product,
  displayName,
}: {
  productId: string;
  product: WishlistProduct;
  displayName: string;
}) {
  const [removed, setRemoved] = useState(false);

  if (removed) return null;

  return (
    <div className="card-premium overflow-hidden group">
      <Link href={`/product/${product.slug}`}>
        <div className="aspect-square overflow-hidden image-zoom-container">
          <Image
            src={product.images[0]}
            alt={displayName}
            width={300}
            height={300}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </div>
      </Link>
      <div className="p-4 space-y-2">
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-heading font-bold text-sm uppercase line-clamp-2 hover:text-accent transition-colors">
            {displayName}
          </h3>
        </Link>
        <ProductPrice value={Number(product.price)} />
        <WishlistActions
          productId={productId}
          product={product}
          displayName={displayName}
          onRemoved={setRemoved}
        />
      </div>
    </div>
  );
}
