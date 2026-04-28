import { Link } from "@/i18n/navigation";
import { Button } from "./ui/button";
import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";

export default async function ViewAllProductsButton() {
  const t = await getTranslations("Product");

  return (
    <div className="flex justify-center items-center my-12">
      <Button
        size="lg"
        variant="outline"
        className="px-10 py-6 text-base font-bold gap-3 uppercase tracking-[0.16em] rounded-none border-2 border-foreground bg-background hover:bg-foreground hover:text-background transition-all group btn-stamp font-heading"
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
