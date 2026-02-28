import { Link } from "@/i18n/navigation";
import { Button } from "./ui/button";
import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import AnimatedButton from "./shared/animated-button";

export default async function ViewAllProductsButton() {
  const t = await getTranslations("Product");

  return (
    <div className="flex justify-center items-center my-8">
      <AnimatedButton>
        <Button
          size="lg"
          className="px-10 py-5 text-lg font-bold gap-2 bg-brand-orange hover:bg-brand-orange-dark text-white uppercase tracking-wide rounded-md hover:translate-y-[-2px] hover:shadow-lg transition-all border-0 group"
          asChild
        >
          <Link href="/search">
            {t("viewAllProducts")}
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </AnimatedButton>
    </div>
  );
}
