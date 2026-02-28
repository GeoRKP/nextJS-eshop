import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";
import { Settings } from "lucide-react";

export default async function PromoBanner() {
  const t = await getTranslations("HomePage");

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-primary via-primary/90 to-brand-orange">
      {/* Decorative gear icon */}
      <div className="absolute right-10 top-1/2 -translate-y-1/2 opacity-10">
        <Settings className="h-40 w-40 md:h-56 md:w-56" />
      </div>

      <div className="wrapper relative py-12 md:py-16">
        <div className="max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white mb-3">
            {t("promoTitle")}
          </h2>
          <p className="text-white/70 mb-6 text-sm md:text-base max-w-lg">
            {t("promoSubtitle")}
          </p>
          <Button
            asChild
            size="lg"
            className="bg-white text-primary hover:bg-white/90 font-bold text-lg px-8 rounded-md"
          >
            <Link href="/search?price=1-50">{t("shopDeals")}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
