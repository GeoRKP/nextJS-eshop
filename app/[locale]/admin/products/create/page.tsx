import ProductForm from "@/components/admin/product-form";
import { getTranslations } from "next-intl/server";
import { getAllCategoriesFlat } from "@/lib/actions/category.actions";
import { requireAdmin } from "@/lib/auth-guard";

export async function generateMetadata() {
  const t = await getTranslations("Metadata");
  return {
    title: t("createProduct"),
  };
}

export default async function CreateProductPage() {
  await requireAdmin();

  const t = await getTranslations("AdminProducts");
  const categories = await getAllCategoriesFlat();

  return <>
    <h2 className="h2-bold">{t("createProduct")}</h2>
    <div className="my-8">
      <ProductForm categories={categories} />
    </div>
  </>;
}
