import { Truck, ShieldCheck, RotateCcw, Headphones } from "lucide-react";
import { getTranslations } from "next-intl/server";

const icons = [Truck, ShieldCheck, RotateCcw, Headphones];
const keys = ["freeShipping", "securePayment", "easyReturns", "support"] as const;

export default async function ValuePropositions() {
  const t = await getTranslations("ValueProps");

  return (
    <section className="relative z-10 mt-6 md:mt-8">
      <div className="wrapper">
        <div className="bg-card rounded-lg shadow-elevated border border-border/50">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-border/50">
            {keys.map((key, i) => {
              const Icon = icons[i];
              return (
                <div
                  key={key}
                  className="flex items-center gap-4 p-5 md:p-6"
                >
                  <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-lg bg-brand-accent/10">
                    <Icon className="h-6 w-6 text-brand-accent" />
                  </div>
                  <div>
                    <p className="font-bold text-sm uppercase tracking-wide">
                      {t(key)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t(`${key}Desc`)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
