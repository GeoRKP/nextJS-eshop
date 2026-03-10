import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import ProductPrice from "./product-price";
import { Product } from "@/types";
import Rating from "@/components/shared/product/rating";
import HighlightText from "@/lib/highlight-text";
import { getTranslations } from "next-intl/server";
import AnimatedCard from "./animated-card";
import WishlistButton from "./wishlist-button";
import AddToCartButton from "./add-to-cart-button";
import { isInWishlist } from "@/lib/actions/wishlist.actions";

export default async function ProductCard({
  product,
  searchQuery,
  isInWishlist: isInWishlistProp,
  variant = "grid",
}: {
  product: Product;
  searchQuery?: string;
  isInWishlist?: boolean;
  variant?: "grid" | "list";
}) {
  const t = await getTranslations("Product");
  const tBadge = await getTranslations("ProductCard");
  const inWishlist = isInWishlistProp ?? (await isInWishlist(product.id));

  const isNew =
    new Date().getTime() - new Date(product.createdAt).getTime() <
    14 * 24 * 60 * 60 * 1000;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  if (variant === "list") {
    return (
      <Card className="w-full group overflow-hidden rounded-lg border border-border/60 bg-card shadow-card hover:shadow-card-hover transition-all duration-200 relative">
        <div className="flex flex-row">
          {/* Image - fixed width */}
          <Link href={`/product/${product.slug}`} className="flex-shrink-0">
            <div className="w-24 md:w-36 lg:w-56 h-full image-zoom-container bg-muted/30 relative">
              <Image
                src={product.images[0]}
                alt={product.name}
                width={224}
                height={224}
                className="object-cover w-full h-full"
                sizes="(max-width: 768px) 144px, 224px"
              />
            </div>
          </Link>

          {/* Content */}
          <div className="flex flex-col flex-1 p-4 min-w-0">
            {/* Brand */}
            <div className="text-brand-accent text-xs font-bold uppercase tracking-[0.15em] mb-1">
              <HighlightText text={product.brand} query={searchQuery} />
            </div>

            {/* Name */}
            <Link href={`/product/${product.slug}`}>
              <h2 className="text-sm font-semibold line-clamp-2 group-hover:text-brand-accent transition-colors duration-200">
                <HighlightText text={product.name} query={searchQuery} />
              </h2>
            </Link>

            {/* Rating */}
            <div className="flex items-center gap-1 mt-2">
              <Rating value={Number(product.rating)} />
              <span className="text-xs text-muted-foreground">
                ({product.numReviews})
              </span>
            </div>

            {/* Description (list only, hidden on mobile) */}
            <p className="hidden md:block text-xs text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
              {product.description}
            </p>

            {/* Badges */}
            <div className="flex gap-1.5 mt-2">
              {isNew && (
                <Badge className="bg-brand-accent hover:bg-brand-accent-dark text-white text-xs px-2 py-0 rounded-md font-bold">
                  {tBadge("new")}
                </Badge>
              )}
              {isLowStock && (
                <Badge className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-2 py-0 rounded-md font-bold">
                  {tBadge("lowStock")}
                </Badge>
              )}
            </div>

            {/* Price + Actions */}
            <div className="mt-auto pt-3 border-t border-border/30 flex items-center justify-between">
              {product.stock > 0 ? (
                <>
                  <div className="text-lg font-black tracking-tight">
                    <ProductPrice value={Number(product.price)} />
                  </div>
                  <div className="flex items-center gap-1">
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
                    <div className="bg-white/90 dark:bg-card/90 backdrop-blur-sm rounded-full p-1.5">
                      <WishlistButton productId={product.id} isInWishlist={inWishlist} />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-destructive text-sm font-medium">{t("outOfStock")}</p>
                  <div className="bg-white/90 dark:bg-card/90 backdrop-blur-sm rounded-full p-1.5">
                    <WishlistButton productId={product.id} isInWishlist={inWishlist} />
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
      <Card className="w-full group overflow-hidden card-premium relative">
        <CardHeader className="p-0 items-center">
          <Link href={`/product/${product.slug}`}>
            <div className="aspect-[4/3] image-zoom-container bg-muted/30 relative">
              <Image
                src={product.images[0]}
                alt={product.name}
                width={400}
                height={300}
                className="object-cover w-full h-full"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              {/* Subtle gradient overlay at bottom */}
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </Link>
          {/* Wishlist button - always visible on mobile, hover-reveal on desktop */}
          <div className="absolute top-3 right-3 z-10 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
            <div className="bg-white/90 dark:bg-card/90 backdrop-blur-sm rounded-full p-1.5 shadow-sm">
              <WishlistButton productId={product.id} isInWishlist={inWishlist} />
            </div>
          </div>
          {/* Always show if in wishlist on desktop */}
          {inWishlist && (
            <div className="absolute top-3 right-3 z-10 hidden md:block md:group-hover:opacity-0 transition-opacity duration-200">
              <div className="bg-white/90 dark:bg-card/90 backdrop-blur-sm rounded-full p-1.5 shadow-sm">
                <WishlistButton productId={product.id} isInWishlist={inWishlist} />
              </div>
            </div>
          )}
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {isNew && (
              <Badge className="bg-brand-accent hover:bg-brand-accent-dark text-white text-xs px-2.5 py-0.5 rounded-md font-bold">
                {tBadge("new")}
              </Badge>
            )}
            {product.isFeatured && (
              <Badge className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs px-2.5 py-0.5 rounded-md font-bold">
                {tBadge("featured")}
              </Badge>
            )}
            {isLowStock && (
              <Badge className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-2.5 py-0.5 rounded-md font-bold">
                {tBadge("lowStock")}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 grid gap-2">
          <div className="text-brand-accent text-xs font-bold uppercase tracking-[0.15em]">
            <HighlightText text={product.brand} query={searchQuery} />
          </div>
          <Link href={`/product/${product.slug}`}>
            <h2 className="text-sm font-semibold line-clamp-2 group-hover:text-brand-accent transition-colors duration-200">
              <HighlightText text={product.name} query={searchQuery} />
            </h2>
          </Link>
          <div className="flex items-center gap-1">
            <Rating value={Number(product.rating)} />
            <span className="text-xs text-muted-foreground">
              ({product.numReviews})
            </span>
          </div>
          {/* Price + Add to Cart */}
          <div className="border-t border-border/30 pt-2 mt-1 flex items-center justify-between">
            {product.stock > 0 ? (
              <>
                <div className="text-base sm:text-lg font-black tracking-tight">
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
              <p className="text-destructive text-sm font-medium">{t("outOfStock")}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </AnimatedCard>
  );
}
