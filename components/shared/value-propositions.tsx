import { Truck, ShieldCheck, RotateCcw, Headphones } from "lucide-react";
import { getTranslations } from "next-intl/server";

const icons = [Truck, ShieldCheck, RotateCcw, Headphones];
const keys = ["freeShipping", "securePayment", "easyReturns", "support"] as const;

export default async function ValuePropositions() {
  const t = await getTranslations("ValueProps");

  return (
    <section className="bg-primary text-primary-foreground">
      <div className="wrapper">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-primary-foreground/10">
          {keys.map((key, i) => {
            const Icon = icons[i];
            return (
              <div
                key={key}
                className="flex flex-col items-center text-center py-6 px-3 hover:bg-white/5 transition-colors"
              >
                <Icon className="h-8 w-8 text-brand-orange mb-3" />
                <p className="font-bold text-sm uppercase tracking-wide">
                  {t(key)}
                </p>
                <p className="text-xs text-primary-foreground/60 mt-1">
                  {t(`${key}Desc`)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
