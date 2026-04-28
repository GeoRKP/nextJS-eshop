import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("Legal.cookies");
  return { title: t("title") };
}

export default async function CookiesPage() {
  const t = await getTranslations("Legal.cookies");
  return (
    <div className="wrapper max-w-3xl prose prose-neutral dark:prose-invert">
      <span className="text-stamp text-accent block mb-2 hazard-mark">
        ▲ LEGAL / COOKIES
      </span>
      <h1 className="h1-bold mb-6">{t("title")}</h1>
      <p className="text-sm text-muted-foreground mb-8">
        {t("lastUpdated", { date: "2026-04-28" })}
      </p>

      <div className="space-y-6 text-foreground/90 leading-relaxed">
        <section>
          <h2 className="h3-bold mt-8 mb-3">{t("whatTitle")}</h2>
          <p>{t("whatBody")}</p>
        </section>

        <section>
          <h2 className="h3-bold mt-8 mb-3">{t("typesTitle")}</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>{t("essentialName")}:</strong> {t("essentialBody")}</li>
            <li><strong>{t("analyticsName")}:</strong> {t("analyticsBody")}</li>
            <li><strong>{t("marketingName")}:</strong> {t("marketingBody")}</li>
          </ul>
        </section>

        <section>
          <h2 className="h3-bold mt-8 mb-3">{t("manageTitle")}</h2>
          <p>{t("manageBody")}</p>
        </section>
      </div>
    </div>
  );
}
