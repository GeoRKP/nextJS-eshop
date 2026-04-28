import { getTranslations } from "next-intl/server";
import { APP_NAME } from "@/lib/constants";

export async function generateMetadata() {
  const t = await getTranslations("Legal.privacy");
  return { title: t("title") };
}

export default async function PrivacyPage() {
  const t = await getTranslations("Legal.privacy");
  return (
    <div className="wrapper max-w-3xl prose prose-neutral dark:prose-invert">
      <span className="text-stamp text-accent block mb-2 hazard-mark">
        ▲ LEGAL / PRIVACY
      </span>
      <h1 className="h1-bold mb-6">{t("title")}</h1>
      <p className="text-sm text-muted-foreground mb-8">
        {t("lastUpdated", { date: "2026-04-28" })}
      </p>

      <div className="space-y-6 text-foreground/90 leading-relaxed">
        <section>
          <h2 className="h3-bold mt-8 mb-3">{t("introTitle")}</h2>
          <p>{t("introBody", { app: APP_NAME })}</p>
        </section>

        <section>
          <h2 className="h3-bold mt-8 mb-3">{t("dataCollectedTitle")}</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>{t("dataAccount")}</li>
            <li>{t("dataOrder")}</li>
            <li>{t("dataPayment")}</li>
            <li>{t("dataAnalytics")}</li>
          </ul>
        </section>

        <section>
          <h2 className="h3-bold mt-8 mb-3">{t("rightsTitle")}</h2>
          <p>{t("rightsBody")}</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>{t("rightAccess")}</li>
            <li>{t("rightRectification")}</li>
            <li>{t("rightErasure")}</li>
            <li>{t("rightPortability")}</li>
            <li>{t("rightObject")}</li>
          </ul>
        </section>

        <section>
          <h2 className="h3-bold mt-8 mb-3">{t("contactTitle")}</h2>
          <p>{t("contactBody")}</p>
        </section>
      </div>

      <div className="mt-12 p-4 border-l-4 border-accent bg-muted/30">
        <p className="text-xs text-muted-foreground italic">{t("disclaimer")}</p>
      </div>
    </div>
  );
}
