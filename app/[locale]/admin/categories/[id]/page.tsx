import { getTranslations } from "next-intl/server";
import { requireAdmin } from "@/lib/auth-guard";
import CategoryForm from "@/components/admin/category-form";
import { getCategoryById, getAllCategoriesFlat } from "@/lib/actions/category.actions";
import { notFound } from "next/navigation";

export async function generateMetadata() {
  const t = await getTranslations("AdminCategories");
  return { title: t("updateCategory") };
}

export default async function UpdateCategoryPage(props: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await props.params;
  const category = await getCategoryById(id);
  if (!category) notFound();

  const categories = await getAllCategoriesFlat();
  // Filter out self and children to prevent circular references
  const availableParents = categories.filter((c) => c.id !== id);

  return (
    <div className="space-y-8 max-w-lg mx-auto">
      <CategoryForm
        type="Update"
        category={category}
        categoryId={id}
        categories={availableParents}
      />
    </div>
  );
}
