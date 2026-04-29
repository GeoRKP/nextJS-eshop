import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import ProductPrice from "./product-price";
import { Product } from "@/types";
import Rating from "@/components/shared/product/rating";
import HighlightText from "@/lib/highlight-text";
import { getLocale, getTranslations } from "next-intl/server";
import { localizedName, localizedDescription } from "@/lib/i18n-helpers";
import AnimatedCard from "./animated-card";
import WishlistButton from "./wishlist-button";
import AddToCartButton from "./add-to-cart-button";
import ProductCardWishlist from "./product-card-wishlist";

// Synthetic SKU display — first 8 chars of UUID, formatted as workshop part code
function formatSku(id: string): string {
  const clean = id.replace(/-/g, "").toUpperCase();
  return `${clean.slice(0, 4)}-${clean.slice(4, 8)}`;
}

export default async function ProductCard({
  product,
  searchQuery,
  variant = "grid",
}: {
  product: Product;
  searchQuery?: string;
  variant?: "grid" | "list";
}) {
  const t = await getTranslations("Product");
  const locale = await getLocale();
  const displayName = localizedName(product, locale);
  const displayDescription = localizedDescription(product, locale);
  const sku = formatSku(product.id ?? product.slug);
  const lowStock = product.stock > 0 && product.stock <= 5;

  if (variant === "list") {
    return (
      <Card className="w-full group overflow-hidden bg-card border border-border hover:border-foreground transition-all duration-200 relative rounded-none">
        <div className="flex flex-row">
          {/* Image */}
          <Link href={`/product/${product.slug}`} className="flex-shrink-0">
            <div className="w-24 sm:w-28 md:w-44 lg:w-60 h-full image-zoom-container bg-muted relative bg-blueprint-grid-sm">
              <Image
                src={product.images[0]}
                alt={displayName}
                width={240}
                height={240}
                className="object-cover w-full h-full"
                sizes="(max-width: 768px) 144px, 240px"
              />
              {lowStock && (
                <span className="corner-tag">LOW</span>
              )}
            </div>
          </Link>

          {/* Content */}
          <div className="flex flex-col flex-1 p-4 md:p-5 min-w-0">
            {/* Brand · SKU */}
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-accent">
                <HighlightText text={product.brand} query={searchQuery} />
              </span>
              <span className="font-mono text-[10px] tracking-[0.05em] text-muted-foreground">
                SKU {sku}
              </span>
            </div>

            {/* Name */}
            <Link href={`/product/${product.slug}`}>
              <h2 className="font-heading text-base md:text-lg font-bold leading-snug line-clamp-2 group-hover:text-accent transition-colors duration-200">
                <HighlightText text={displayName} query={searchQuery} />
              </h2>
            </Link>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-2">
              <Rating value={Number(product.rating)} />
              <span className="font-mono text-[11px] text-muted-foreground">
                ({product.numReviews})
              </span>
            </div>

            {/* Description */}
            <p className="hidden md:block text-xs text-muted-foreground line-clamp-2 mt-3 leading-relaxed">
              {displayDescription}
            </p>

            {/* Price + Actions */}
            <div className="mt-auto pt-4 border-t border-dashed border-border flex items-center justify-between">
              {product.stock > 0 ? (
                <>
                  <div className="font-heading text-xl md:text-2xl font-extrabold tabular-nums leading-none">
                    <ProductPrice value={Number(product.price)} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <AddToCartButton
                      item={{
                        productId: product.id,
                        name: product.name,
                        slug: product.slug,
                        qty: 1,
                        image: product.images[0],
                        price: product.price,
                      }}
                    />
                    <div className="border border-border bg-background p-1.5">
                      <WishlistButton productId={product.id} />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-destructive">
                    ▲ {t("outOfStock")}
                  </p>
                  <div className="border border-border bg-background p-1.5">
                    <WishlistButton productId={product.id} />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Grid variant (default)
  return (
    <AnimatedCard>
      <Card className="w-full group overflow-hidden card-premium relative rounded-none">
        <CardHeader className="p-0 items-center">
          <Link href={`/product/${product.slug}`}>
            <div className="aspect-square md:aspect-[4/3] image-zoom-container bg-card relative bg-blueprint-grid-sm border-b border-border">
              <Image
                src={product.images[0]}
                alt={displayName}
                width={400}
                height={300}
                className="object-cover w-full h-full"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              {/* Subtle hover overlay */}
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-foreground/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              {/* Top-right corner notch tag */}
              {lowStock && <span className="corner-tag">LOW</span>}
            </div>
          </Link>
          {/* Wishlist button */}
          <ProductCardWishlist productId={product.id} />
        </CardHeader>
        <CardContent className="p-3.5 grid gap-2">
          {/* Brand · SKU row */}
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-accent truncate">
              <HighlightText text={product.brand} query={searchQuery} />
            </span>
            <span className="font-mono text-[10px] tracking-[0.05em] text-muted-foreground shrink-0">
              {sku}
            </span>
          </div>

          {/* Name */}
          <Link href={`/product/${product.slug}`}>
            <h2 className="h5-bold line-clamp-2 min-h-[2.6em] group-hover:text-accent transition-colors duration-200">
              <HighlightText text={product.name} query={searchQuery} />
            </h2>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1.5">
            <Rating value={Number(product.rating)} />
            <span className="font-mono text-[10px] text-muted-foreground">
              ({product.numReviews})
            </span>
          </div>

          {/* Price + Add to Cart */}
          <div className="border-t border-dashed border-border pt-3 mt-1 flex items-center justify-between gap-2">
            {product.stock > 0 ? (
              <>
                <div className="font-heading text-lg sm:text-xl font-extrabold tabular-nums leading-none">
                  <ProductPrice value={Number(product.price)} />
                </div>
                <AddToCartButton
                  item={{
                    productId: product.id,
                    name: product.name,
                    slug: product.slug,
                    qty: 1,
                    image: product.images[0],
                    price: product.price,
                  }}
                />
              </>
            ) : (
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-destructive">
                ▲ {t("outOfStock")}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </AnimatedCard>
  );
}
