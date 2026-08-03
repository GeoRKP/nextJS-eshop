import { getTranslations, getLocale } from "next-intl/server";
import { getMyWishlist } from "@/lib/actions/wishlist.actions";
import { Link } from "@/i18n/navigation";
import WishlistCard from "./wishlist-card";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { localizedName } from "@/lib/i18n-helpers";

export async function generateMetadata() {
  const t = await getTranslations("Wishlist");
  return { title: t("wishlist") };
}

export default async function WishlistPage() {
  const t = await getTranslations("Wishlist");
  const tCommon = await getTranslations("Common");
  const locale = await getLocale();
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
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlist.items.map((item) => (
            <WishlistCard
              key={item.id}
              productId={item.productId}
              product={item.product}
              displayName={localizedName(item.product, locale)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
