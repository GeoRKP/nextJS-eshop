import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";
import { Settings } from "lucide-react";

export default async function PromoBanner() {
  const t = await getTranslations("HomePage");

  return (
    <section className="bg-primary text-primary-foreground overflow-hidden">
      <div className="wrapper">
        <div className="grid md:grid-cols-2 gap-8 py-12 md:py-16">
          {/* Left: Content */}
          <div className="flex flex-col justify-center">
            <span className="text-label text-brand-accent mb-3">
              {t("promoLabel")}
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white mb-3 leading-tight">
              {t("promoTitle")}
            </h2>
            <p className="text-white/60 mb-8 text-sm md:text-base max-w-lg">
              {t("promoSubtitle")}
            </p>

            {/* Stats row */}
            <div className="flex gap-8 mb-8">
              {(["statParts", "statBrands", "statSupport"] as const).map((key) => {
                const value = t(key);
                // Split "10K+ Parts" into number and label
                const parts = value.split(" ");
                const number = parts[0];
                const label = parts.slice(1).join(" ");
                return (
                  <div key={key}>
                    <p className="text-2xl md:text-3xl font-black text-brand-accent">
                      {number}
                    </p>
                    <p className="text-xs text-white/50 uppercase tracking-wide mt-0.5">
                      {label}
                    </p>
                  </div>
                );
              })}
            </div>

            <div>
              <Button
                asChild
                size="lg"
                className="bg-brand-accent hover:bg-brand-accent-dark text-white font-bold text-base px-8 rounded-md uppercase tracking-wide border-0"
              >
                <Link href="/search?price=1-50">{t("shopDeals")}</Link>
              </Button>
            </div>
          </div>

          {/* Right: Decorative panel (desktop only) */}
          <div className="hidden md:flex items-center justify-center relative">
            <div className="absolute inset-0 rounded-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
              <div className="absolute inset-0 industrial-stripe" />
            </div>
            {/* Spinning gear icon */}
            <div className="relative">
              <Settings className="h-40 w-40 lg:h-56 lg:w-56 text-brand-accent/20 animate-spin-slow" />
            </div>
            {/* Amber accent bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-accent/40 rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
