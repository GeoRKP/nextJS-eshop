import { getTranslations } from "next-intl/server";
import { getMyWishlist } from "@/lib/actions/wishlist.actions";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import ProductPrice from "@/components/shared/product/product-price";
import WishlistActions from "./wishlist-actions";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export async function generateMetadata() {
  const t = await getTranslations("Wishlist");
  return { title: t("wishlist") };
}

export default async function WishlistPage() {
  const t = await getTranslations("Wishlist");
  const tCommon = await getTranslations("Common");
  const wishlist = await getMyWishlist();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Heart className="w-6 h-6 text-brand-accent" />
        <h1 className="h2-bold">{t("wishlist")}</h1>
      </div>

      {!wishlist || wishlist.items.length === 0 ? (
        <div className="card-premium p-12 text-center">
          <Heart className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-muted-foreground mb-6">{t("emptyWishlist")}</p>
          <Button asChild variant="accent" size="lg">
            <Link href="/search">{tCommon("goShopping")}</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlist.items.map((item) => (
            <div key={item.id} className="card-premium overflow-hidden group">
              <Link href={`/product/${item.product.slug}`}>
                <div className="aspect-square overflow-hidden image-zoom-container">
                  <Image
                    src={item.product.images[0]}
                    alt={item.product.name}
                    width={300}
                    height={300}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </Link>
              <div className="p-4 space-y-2">
                <Link href={`/product/${item.product.slug}`}>
                  <h3 className="font-heading font-bold text-sm uppercase line-clamp-2 hover:text-accent transition-colors">
                    {item.product.name}
                  </h3>
                </Link>
                <ProductPrice value={Number(item.product.price)} />
                <WishlistActions productId={item.productId} product={item.product} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
