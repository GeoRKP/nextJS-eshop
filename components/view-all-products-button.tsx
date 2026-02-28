import { Link } from "@/i18n/navigation";
import { Button } from "./ui/button";
import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";

export default async function ViewAllProductsButton() {
  const t = await getTranslations("Product");

  return (
    <div className="flex justify-center items-center my-8">
      <Button
        size="lg"
        variant="outline"
        className="px-10 py-5 text-lg font-bold gap-2 uppercase tracking-wide rounded-md border-2 border-border hover:border-brand-accent hover:bg-brand-accent hover:text-white transition-all group"
        asChild
      >
        <Link href="/search">
          {t("viewAllProducts")}
          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </Button>
    </div>
  );
}
