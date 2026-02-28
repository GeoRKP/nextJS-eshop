import { getCategoryTree } from "@/lib/actions/category.actions";
import { getTranslations } from "next-intl/server";
import MobileCategoryChipsClient from "./mobile-category-chips-client";

export default async function MobileCategoryChips() {
  const t = await getTranslations("Common");
  let categories: Awaited<ReturnType<typeof getCategoryTree>> = [];

  try {
    categories = await getCategoryTree();
  } catch {
    // Category table might not exist yet
  }

  if (categories.length === 0) return null;

  return (
    <MobileCategoryChipsClient
      categories={categories}
      allLabel={t("all")}
    />
  );
}
