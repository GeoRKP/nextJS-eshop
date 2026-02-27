import { getAllCategories } from "@/lib/actions/product.actions";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import {
  Shirt,
  Laptop,
  Footprints,
  Watch,
  Gem,
  Home,
  Dumbbell,
  BookOpen,
  ShoppingBag,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Shirts: Shirt,
  Clothing: Shirt,
  Electronics: Laptop,
  Shoes: Footprints,
  Watches: Watch,
  Jewelry: Gem,
  Home: Home,
  Sports: Dumbbell,
  Books: BookOpen,
};

const gradients = [
  "from-blue-500/20 to-blue-600/5",
  "from-emerald-500/20 to-emerald-600/5",
  "from-purple-500/20 to-purple-600/5",
  "from-orange-500/20 to-orange-600/5",
  "from-pink-500/20 to-pink-600/5",
  "from-cyan-500/20 to-cyan-600/5",
  "from-amber-500/20 to-amber-600/5",
  "from-rose-500/20 to-rose-600/5",
];

export default async function CategoryCards() {
  const categories = await getAllCategories();
  const t = await getTranslations("Categories");

  if (categories.length === 0) return null;

  return (
    <div className="my-10">
      <h2 className="h2-bold mb-6">{t("shopByCategory")}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((cat, i) => {
          const Icon = iconMap[cat.category] || ShoppingBag;
          const gradient = gradients[i % gradients.length];

          return (
            <Link
              key={cat.category}
              href={`/search?category=${encodeURIComponent(cat.category)}`}
              className={`group flex flex-col items-center justify-center gap-3 p-6 rounded-lg bg-gradient-to-br ${gradient} border border-border/50 hover:border-primary/30 transition-colors`}
            >
              <Icon className="h-8 w-8 text-foreground/70 group-hover:text-primary transition-colors" />
              <div className="text-center">
                <p className="font-semibold text-sm">{cat.category}</p>
                <p className="text-xs text-muted-foreground">
                  {t("productCount", { count: cat._count })}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
