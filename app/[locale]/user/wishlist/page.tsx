import { getTranslations } from "next-intl/server";
import { getMyWishlist } from "@/lib/actions/wishlist.actions";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import ProductPrice from "@/components/shared/product/product-price";
import WishlistActions from "./wishlist-actions";

export async function generateMetadata() {
  const t = await getTranslations("Wishlist");
  return { title: t("wishlist") };
}

export default async function WishlistPage() {
  const t = await getTranslations("Wishlist");
  const wishlist = await getMyWishlist();

  if (!wishlist || wishlist.items.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="h2-bold">{t("wishlist")}</h1>
        <p className="text-muted-foreground">{t("emptyWishlist")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="h2-bold">{t("wishlist")}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {wishlist.items.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <CardContent className="p-0">
              <Link href={`/product/${item.product.slug}`}>
                <div className="aspect-square overflow-hidden">
                  <Image
                    src={item.product.images[0]}
                    alt={item.product.name}
                    width={300}
                    height={300}
                    className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </Link>
              <div className="p-4 space-y-2">
                <Link href={`/product/${item.product.slug}`}>
                  <h3 className="font-semibold line-clamp-2 hover:text-primary transition-colors">
                    {item.product.name}
                  </h3>
                </Link>
                <ProductPrice value={Number(item.product.price)} />
                <WishlistActions productId={item.productId} product={item.product} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
