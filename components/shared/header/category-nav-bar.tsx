import { getCategoryTree } from "@/lib/actions/category.actions";
import { getAllBrands } from "@/lib/actions/brand.actions";
import { getTranslations } from "next-intl/server";
import CategoryNavClient from "./category-nav-client";

export default async function CategoryNavBar() {
  const t = await getTranslations("MegaMenu");
  let categories: Awaited<ReturnType<typeof getCategoryTree>> = [];
  let brands: Awaited<ReturnType<typeof getAllBrands>> = [];

  try {
    [categories, brands] = await Promise.all([
      getCategoryTree(),
      getAllBrands(),
    ]);
  } catch {
    // Tables might not exist yet
  }

  if (categories.length === 0) return null;

  return (
    <CategoryNavClient
      categories={categories}
      brands={brands.slice(0, 15)}
      translations={{
        allCategories: t("allCategories"),
        viewAll: t("viewAll"),
        deals: t("deals"),
        newArrivals: t("newArrivals"),
        featured: t("featured"),
        shopByBrand: t("shopByBrand"),
        popularBrands: t("popularBrands"),
        allBrands: t("allBrands"),
        viewAllIn: t("viewAllIn"),
        products: t("products"),
        subcategories: t("subcategories"),
      }}
    />
  );
}
