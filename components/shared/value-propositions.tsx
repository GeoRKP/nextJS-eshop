import { Truck, ShieldCheck, RotateCcw, Headphones } from "lucide-react";
import { getTranslations } from "next-intl/server";

const icons = [Truck, ShieldCheck, RotateCcw, Headphones];
const keys = ["freeShipping", "securePayment", "easyReturns", "support"] as const;

export default async function ValuePropositions() {
  const t = await getTranslations("ValueProps");

  return (
    <div className="border-y py-8 my-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {keys.map((key, i) => {
          const Icon = icons[i];
          return (
            <div key={key} className="flex items-center gap-3">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">{t(key)}</p>
                <p className="text-xs text-muted-foreground">
                  {t(`${key}Desc`)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
