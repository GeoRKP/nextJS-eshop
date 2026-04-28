import { getTranslations } from "next-intl/server";
import { Truck, Clock, Package, MapPin } from "lucide-react";

export async function generateMetadata() {
  const t = await getTranslations("Info.shipping");
  return { title: t("title") };
}

export default async function ShippingPage() {
  const t = await getTranslations("Info.shipping");
  return (
    <div className="wrapper max-w-3xl">
      <span className="text-stamp text-accent block mb-2 hazard-mark">
        ▲ INFO / SHIPPING
      </span>
      <h1 className="h1-bold mb-8">{t("title")}</h1>

      <div className="grid sm:grid-cols-2 gap-px bg-border mb-10">
        {[
          { icon: Truck, title: t("carrier"), body: t("carrierBody") },
          { icon: Clock, title: t("delivery"), body: t("deliveryBody") },
          { icon: Package, title: t("packaging"), body: t("packagingBody") },
          { icon: MapPin, title: t("areas"), body: t("areasBody") },
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
          <h2 className="h3-bold mb-3">{t("costsTitle")}</h2>
          <p>{t("costsBody")}</p>
        </section>

        <section>
          <h2 className="h3-bold mt-8 mb-3">{t("trackingTitle")}</h2>
          <p>{t("trackingBody")}</p>
        </section>
      </div>
    </div>
  );
}
