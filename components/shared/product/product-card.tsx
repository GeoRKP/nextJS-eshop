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
import { isInWishlist } from "@/lib/actions/wishlist.actions";

export default async function ProductCard({
  product,
  searchQuery,
  isInWishlist: isInWishlistProp,
}: {
  product: Product;
  searchQuery?: string;
  isInWishlist?: boolean;
}) {
  const t = await getTranslations("Product");
  const tBadge = await getTranslations("ProductCard");
  const inWishlist = isInWishlistProp ?? (await isInWishlist(product.id));

  const isNew =
    new Date().getTime() - new Date(product.createdAt).getTime() <
    14 * 24 * 60 * 60 * 1000;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <AnimatedCard>
      <Card className="w-full max-w-sm group overflow-hidden rounded-2xl border-0 bg-card shadow-card hover:shadow-card-glow transition-all duration-300 relative">
        <CardHeader className="p-0 items-center">
          <Link href={`/product/${product.slug}`}>
            <div className="aspect-square overflow-hidden bg-muted/30 relative">
              <Image
                src={product.images[0]}
                alt={product.name}
                width={300}
                height={300}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
              />
              {/* Subtle gradient overlay at bottom */}
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </Link>
          {/* Wishlist button */}
          <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="bg-white/90 dark:bg-card/90 backdrop-blur-sm rounded-full p-1.5 shadow-sm">
              <WishlistButton productId={product.id} isInWishlist={inWishlist} />
            </div>
          </div>
          {/* Always show if in wishlist */}
          {inWishlist && (
            <div className="absolute top-3 right-3 z-10 group-hover:opacity-0 transition-opacity duration-200">
              <div className="bg-white/90 dark:bg-card/90 backdrop-blur-sm rounded-full p-1.5 shadow-sm">
                <WishlistButton productId={product.id} isInWishlist={inWishlist} />
              </div>
            </div>
          )}
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {isNew && (
              <Badge className="bg-brand-orange hover:bg-brand-orange-dark text-white text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                {tBadge("new")}
              </Badge>
            )}
            {product.isFeatured && (
              <Badge className="bg-primary hover:bg-primary/90 text-primary-foreground text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                {tBadge("featured")}
              </Badge>
            )}
            {isLowStock && (
              <Badge className="bg-orange-500 hover:bg-orange-600 text-white text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                {tBadge("lowStock")}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 grid gap-2">
          <div className="text-brand-orange text-[10px] font-bold uppercase tracking-[0.15em]">
            <HighlightText text={product.brand} query={searchQuery} />
          </div>
          <Link href={`/product/${product.slug}`}>
            <h2 className="text-sm font-semibold line-clamp-2 group-hover:text-brand-orange transition-colors duration-200">
              <HighlightText text={product.name} query={searchQuery} />
            </h2>
          </Link>
          <div className="flex-between gap-4">
            <div className="flex items-center gap-1">
              <Rating value={Number(product.rating)} />
              <span className="text-xs text-muted-foreground">
                ({product.numReviews})
              </span>
            </div>
            {product.stock > 0 ? (
              <div className="text-lg font-black tracking-tight">
                <ProductPrice value={Number(product.price)} />
              </div>
            ) : (
              <p className="text-destructive text-sm font-medium">{t("outOfStock")}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </AnimatedCard>
  );
}
