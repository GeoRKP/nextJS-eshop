import { getTranslations } from "next-intl/server";
import { localeAlternates } from "@/lib/seo";
import { APP_NAME } from "@/lib/constants";

export async function generateMetadata() {
  const t = await getTranslations("Legal.terms");
  return { title: t("title"), alternates: localeAlternates("/terms") };
}

export default async function TermsPage() {
  const t = await getTranslations("Legal.terms");
  return (
    <div className="wrapper max-w-3xl prose prose-neutral dark:prose-invert">
      <span className="text-stamp text-accent block mb-2 hazard-mark">
        ▲ LEGAL / TERMS
      </span>
      <h1 className="h1-bold mb-6">{t("title")}</h1>
      <p className="text-sm text-muted-foreground mb-8">
        {t("lastUpdated", { date: "2026-04-28" })}
      </p>

      <div className="space-y-6 text-foreground/90 leading-relaxed">
        <section>
          <h2 className="h3-bold mt-8 mb-3">{t("acceptanceTitle")}</h2>
          <p>{t("acceptanceBody", { app: APP_NAME })}</p>
        </section>

        <section>
          <h2 className="h3-bold mt-8 mb-3">{t("ordersTitle")}</h2>
          <p>{t("ordersBody")}</p>
        </section>

        <section>
          <h2 className="h3-bold mt-8 mb-3">{t("pricingTitle")}</h2>
          <p>{t("pricingBody")}</p>
        </section>

        <section>
          <h2 className="h3-bold mt-8 mb-3">{t("returnsTitle")}</h2>
          <p>{t("returnsBody")}</p>
        </section>

        <section>
          <h2 className="h3-bold mt-8 mb-3">{t("liabilityTitle")}</h2>
          <p>{t("liabilityBody")}</p>
        </section>

        <section>
          <h2 className="h3-bold mt-8 mb-3">{t("governingLawTitle")}</h2>
          <p>{t("governingLawBody")}</p>
        </section>
      </div>

      <div className="mt-12 p-4 border-l-4 border-accent bg-muted/30">
        <p className="text-xs text-muted-foreground italic">{t("disclaimer")}</p>
      </div>
    </div>
  );
}
