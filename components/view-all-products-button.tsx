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
        <Button size="lg" className="px-8 py-4 text-lg font-semibold gap-2" asChild>
          <Link href="/search">
            {t("viewAllProducts")}
            <ArrowRight className="h-5 w-5" />
          </Link>
        </Button>
      </AnimatedButton>
    </div>
  );
}
