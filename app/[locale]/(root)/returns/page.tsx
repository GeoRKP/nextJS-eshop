import { getTranslations } from "next-intl/server";
import { localeAlternates } from "@/lib/seo";
import { RotateCcw, ShieldCheck, Mail } from "lucide-react";

export async function generateMetadata() {
  const t = await getTranslations("Info.returns");
  return { title: t("title"), alternates: localeAlternates("/returns") };
}

export default async function ReturnsPage() {
  const t = await getTranslations("Info.returns");
  return (
    <div className="wrapper max-w-3xl">
      <span className="text-stamp text-accent block mb-2 hazard-mark">
        ▲ INFO / RETURNS
      </span>
      <h1 className="h1-bold mb-8">{t("title")}</h1>

      <div className="grid sm:grid-cols-3 gap-px bg-border mb-10">
        {[
          { icon: RotateCcw, title: t("rightTitle"), body: t("rightBody") },
          { icon: ShieldCheck, title: t("conditionTitle"), body: t("conditionBody") },
          { icon: Mail, title: t("howTitle"), body: t("howBody") },
        ].map((item) => (
          <div key={item.title} className="bg-card p-6">
            <item.icon className="h-7 w-7 text-accent mb-3 stroke-[1.75]" />
            <h3 className="font-heading font-bold uppercase tracking-wide mb-2">
              {item.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {item.body}
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-6 text-foreground/90 leading-relaxed">
        <section>
          <h2 className="h3-bold mb-3">{t("processTitle")}</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>{t("step1")}</li>
            <li>{t("step2")}</li>
            <li>{t("step3")}</li>
            <li>{t("step4")}</li>
          </ol>
        </section>

        <section>
          <h2 className="h3-bold mt-8 mb-3">{t("refundTitle")}</h2>
          <p>{t("refundBody")}</p>
        </section>
      </div>
    </div>
  );
}
