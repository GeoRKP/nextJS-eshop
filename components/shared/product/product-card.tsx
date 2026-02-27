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
}: {
  product: Product;
  searchQuery?: string;
}) {
  const t = await getTranslations("Product");
  const tBadge = await getTranslations("ProductCard");
  const inWishlist = await isInWishlist(product.id);

  const isNew =
    new Date().getTime() - new Date(product.createdAt).getTime() <
    14 * 24 * 60 * 60 * 1000;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <AnimatedCard>
      <Card className="w-full max-w-sm group overflow-hidden hover:shadow-card-hover transition-shadow duration-200">
        <CardHeader className="p-0 items-center">
          <Link href={`/product/${product.slug}`}>
            <div className="aspect-square overflow-hidden">
              <Image
                src={product.images[0]}
                alt={product.name}
                width={300}
                height={300}
                priority={true}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </Link>
          {/* Wishlist button */}
          <div className="absolute top-2 right-2 z-10">
            <WishlistButton productId={product.id} isInWishlist={inWishlist} />
          </div>
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {isNew && (
              <Badge className="bg-green-600 hover:bg-green-700 text-white">
                {tBadge("new")}
              </Badge>
            )}
            {product.isFeatured && (
              <Badge className="bg-blue-600 hover:bg-blue-700 text-white">
                {tBadge("featured")}
              </Badge>
            )}
            {isLowStock && (
              <Badge className="bg-orange-500 hover:bg-orange-600 text-white">
                {tBadge("lowStock")}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 grid gap-2">
          <div className="text-xs uppercase text-muted-foreground tracking-wide">
            <HighlightText text={product.brand} query={searchQuery} />
          </div>
          <Link href={`/product/${product.slug}`}>
            <h2 className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors">
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
              <ProductPrice value={Number(product.price)} />
            ) : (
              <p className="text-destructive font-medium">{t("outOfStock")}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </AnimatedCard>
  );
}
