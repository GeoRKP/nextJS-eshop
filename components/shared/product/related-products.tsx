import { getRelatedProducts } from "@/lib/actions/product.actions";
import ProductCard from "./product-card";
import {
  AnimatedGrid,
  AnimatedGridItem,
} from "./animated-grid";
import ScrollFadeIn from "@/components/shared/scroll-fade-in";
import { getTranslations } from "next-intl/server";
import { getWishlistProductIds } from "@/lib/actions/wishlist.actions";

export default async function RelatedProducts({
  category,
  excludeId,
}: {
  category: string;
  excludeId: string;
}) {
  const [products, wishlistIds] = await Promise.all([
    getRelatedProducts(category, excludeId, 4),
    getWishlistProductIds(),
  ]);
  const t = await getTranslations("Product");

  if (!products || products.length === 0) return null;

  return (
    <ScrollFadeIn>
      <section>
        <h2 className="h2-bold mb-6">{t("relatedProducts")}</h2>
        <AnimatedGrid className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map((product) => (
            <AnimatedGridItem key={product.id}>
              <ProductCard product={product} isInWishlist={wishlistIds.has(product.id)} />
            </AnimatedGridItem>
          ))}
        </AnimatedGrid>
      </section>
    </ScrollFadeIn>
  );
}
