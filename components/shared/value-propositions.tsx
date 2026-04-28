import { Truck, ShieldCheck, RotateCcw, Headphones } from "lucide-react";
import { getTranslations } from "next-intl/server";

const icons = [Truck, ShieldCheck, RotateCcw, Headphones];
const keys = ["freeShipping", "securePayment", "easyReturns", "support"] as const;

export default async function ValuePropositions() {
  const t = await getTranslations("ValueProps");

  return (
    <section className="relative z-10 mt-8 md:mt-10">
      <div className="wrapper">
        <div className="bg-card border border-foreground/15">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-foreground/15">
            {keys.map((key, i) => {
              const Icon = icons[i];
              const num = String(i + 1).padStart(2, "0");
              return (
                <div
                  key={key}
                  className="flex items-start gap-4 p-5 md:p-6 relative group transition-colors hover:bg-muted/30"
                >
                  <div className="shrink-0 flex items-center justify-center w-12 h-12 bg-foreground border border-accent/30 group-hover:bg-accent transition-colors">
                    <Icon className="h-5 w-5 text-accent group-hover:text-accent-foreground transition-colors stroke-[1.75]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-mono text-[10px] text-accent tracking-[0.12em]">
                        0{num}
                      </span>
                      <p className="font-heading font-bold text-sm uppercase tracking-[0.06em]">
                        {t(key)}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
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
