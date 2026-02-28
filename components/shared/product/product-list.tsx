import { Product } from "@/types";
import ProductCard from "./product-card";
import { getTranslations } from "next-intl/server";
import { AnimatedGrid, AnimatedGridItem } from "./animated-grid";
import { getWishlistProductIds } from "@/lib/actions/wishlist.actions";

export default async function ProductList({
  data,
  title,
  limit,
}: {
  data: Product[];
  title?: string;
  limit?: number;
}) {
  const limitedData = limit ? data.slice(0, limit) : data;
  const [t, wishlistIds] = await Promise.all([
    getTranslations("Product"),
    getWishlistProductIds(),
  ]);

  return (
    <div className="my-10">
      <h2 className="h2-bold mb-4">{title}</h2>
      {data.length > 0 ? (
        <AnimatedGrid className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {limitedData.map((product: Product) => (
            <AnimatedGridItem key={product.slug}>
              <ProductCard product={product} isInWishlist={wishlistIds.has(product.id)} />
            </AnimatedGridItem>
          ))}
        </AnimatedGrid>
      ) : (
        <div>
          <p>{t("noProductsFound")}</p>
        </div>
      )}
    </div>
  );
}
