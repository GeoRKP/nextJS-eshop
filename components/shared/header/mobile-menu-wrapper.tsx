import { getCategoryTree } from "@/lib/actions/category.actions";
import { getAllBrands } from "@/lib/actions/brand.actions";
import { getAuthSession } from "@/lib/auth-session";
import MobileMenu from "./mobile-menu";
import { Category } from "@/types";

export default async function MobileMenuWrapper() {
  let categories: Category[] = [];
  let brands: { brand: string; _count: number }[] = [];

  try {
    [categories, brands] = await Promise.all([
      getCategoryTree(),
      getAllBrands(),
    ]);
  } catch {
    // Tables might not exist yet
  }

  const session = await getAuthSession();

  return (
    <MobileMenu
      categories={categories}
      brands={brands.slice(0, 15)}
      userName={session?.user?.name}
    />
  );
}
