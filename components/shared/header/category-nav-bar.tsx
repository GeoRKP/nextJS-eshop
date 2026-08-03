import { getCategoryTree } from "@/lib/actions/category.actions";
import { getTranslations } from "next-intl/server";
import CategoryNavClient from "./category-nav-client";

export default async function CategoryNavBar() {
  const t = await getTranslations("MegaMenu");
  let categories: Awaited<ReturnType<typeof getCategoryTree>> = [];

  try {
    categories = await getCategoryTree();
  } catch {
    // Tables might not exist yet
  }

  if (categories.length === 0) return null;

  return (
    <CategoryNavClient
      categories={categories}
      translations={{
        allCategories: t("allCategories"),
        viewAll: t("viewAll"),
        newArrivals: t("newArrivals"),
        featured: t("featured"),
        popularBrands: t("popularBrands"),
        allBrands: t("allBrands"),
      }}
    />
  );
}
