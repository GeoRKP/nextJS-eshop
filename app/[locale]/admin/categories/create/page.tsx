import { getTranslations } from "next-intl/server";
import { requireAdmin } from "@/lib/auth-guard";
import CategoryForm from "@/components/admin/category-form";
import { getAllCategoriesFlat } from "@/lib/actions/category.actions";

export async function generateMetadata() {
  const t = await getTranslations("AdminCategories");
  return { title: t("createCategory") };
}

export default async function CreateCategoryPage() {
  await requireAdmin();
  const categories = await getAllCategoriesFlat();

  return (
    <div className="space-y-8 max-w-lg mx-auto">
      <CategoryForm type="Create" categories={categories} />
    </div>
  );
}
