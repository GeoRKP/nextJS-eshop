import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerTitle,
  DrawerContent,
  DrawerHeader,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";
import { getCategoryTree } from "@/lib/actions/category.actions";
import { getAllCategories } from "@/lib/actions/product.actions";
import { MenuIcon, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { Category } from "@/types";

function CategoryItem({ category }: { category: Category }) {
  return (
    <div>
      <Button
        className="w-full justify-between"
        variant="ghost"
        asChild
      >
        <DrawerClose asChild>
          <Link href={`/search?category=${category.name}`}>
            <span>
              {category.name}
              {category._count?.products ? ` (${category._count.products})` : ""}
            </span>
            {category.children && category.children.length > 0 && (
              <ChevronRight className="w-4 h-4" />
            )}
          </Link>
        </DrawerClose>
      </Button>
      {category.children && category.children.length > 0 && (
        <div className="ml-4 border-l pl-2 space-y-0.5">
          {category.children.map((child) => (
            <CategoryItem key={child.id} category={child} />
          ))}
        </div>
      )}
    </div>
  );
}

export default async function CategoryDraw() {
  const t = await getTranslations("CategoryDrawer");

  // Try to use hierarchical categories first, fall back to legacy flat list
  let treeCategories: Category[] = [];
  try {
    treeCategories = await getCategoryTree();
  } catch {
    // Category table might not exist yet (migration pending)
  }

  if (treeCategories.length > 0) {
    return (
      <Drawer direction="left">
        <DrawerTrigger asChild>
          <Button variant="outline">
            <MenuIcon />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="h-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>{t("selectCategory")}</DrawerTitle>
            <div className="space-y-1 mt-4">
              {treeCategories.map((category) => (
                <CategoryItem key={category.id} category={category} />
              ))}
            </div>
          </DrawerHeader>
        </DrawerContent>
      </Drawer>
    );
  }

  // Fallback to legacy categories from product groupBy
  const categories = await getAllCategories();

  return (
    <Drawer direction="left">
      <DrawerTrigger asChild>
        <Button variant="outline">
          <MenuIcon />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-full max-w-sm">
        <DrawerHeader>
          <DrawerTitle>{t("selectCategory")}</DrawerTitle>
          <div className="space-y-1 mt-4">
            {categories.map((x) => (
              <Button
                key={x.name}
                className="w-full justify-start"
                variant="ghost"
                asChild
              >
                <DrawerClose asChild>
                  <Link href={`/search?category=${x.name}`}>
                    {x.name} ({x.productCount})
                  </Link>
                </DrawerClose>
              </Button>
            ))}
          </div>
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  );
}
