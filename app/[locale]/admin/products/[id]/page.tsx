import ProductForm from "@/components/admin/product-form";
import { getProductById } from "@/lib/actions/product.actions";
import { getAllCategoriesFlat } from "@/lib/actions/category.actions";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { requireAdmin } from "@/lib/auth-guard";

export async function generateMetadata() {
  const t = await getTranslations("Metadata");
  return {
    title: t("updateProduct"),
  };
}

export default async function AdminProductUpdatePage(props: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await props.params;

  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const categories = await getAllCategoriesFlat();
  const t = await getTranslations("ProductForm");

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <h1 className="h2-bold">{t("updateProduct")}</h1>
      <ProductForm type="Update" product={product} productId={product.id} categories={categories} />
    </div>
  );
}
