import {
  BadgeDollarSign,
  CreditCard,
  TrendingDown,
  TrendingUp,
  UserPlus,
  ShoppingCart,
} from "lucide-react";
import { formatCurrency, formatNumber, cn } from "@/lib/utils";
import { percentChange } from "@/lib/dashboard-utils";

type KpiData = {
  revenue: number;
  revenuePrev: number;
  ordersCount: number;
  ordersCountPrev: number;
  newCustomers: number;
  newCustomersPrev: number;
  avgOrderValue: number;
  avgOrderValuePrev: number;
};

export default function KpiCards({
  kpi,
  t,
}: {
  kpi: KpiData;
  t: (key: string) => string;
}) {
  const cards = [
    {
      title: t("totalRevenue"),
      value: formatCurrency(kpi.revenue),
      change: percentChange(kpi.revenue, kpi.revenuePrev),
      icon: BadgeDollarSign,
    },
    {
      title: t("sales"),
      value: formatNumber(kpi.ordersCount),
      change: percentChange(kpi.ordersCount, kpi.ordersCountPrev),
      icon: CreditCard,
    },
    {
      title: t("newCustomers"),
      value: formatNumber(kpi.newCustomers),
      change: percentChange(kpi.newCustomers, kpi.newCustomersPrev),
      icon: UserPlus,
    },
    {
      title: t("avgOrderValue"),
      value: formatCurrency(kpi.avgOrderValue),
      change: percentChange(kpi.avgOrderValue, kpi.avgOrderValuePrev),
      icon: ShoppingCart,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div key={card.title} className="card-premium p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-muted-foreground">
              {card.title}
            </p>
            <div className="h-10 w-10 rounded-lg bg-brand-accent/10 flex items-center justify-center">
              <card.icon className="h-5 w-5 text-brand-accent" />
            </div>
          </div>
          <div className="text-2xl font-heading font-bold">{card.value}</div>
          <ChangeIndicator
            change={card.change}
            label={t("fromPreviousPeriod")}
          />
        </div>
      ))}
    </div>
  );
}

function ChangeIndicator({
  change,
  label,
}: {
  change: number | null;
  label: string;
}) {
  if (change === null) {
    return <p className="text-xs text-muted-foreground mt-1">—</p>;
  }

  const isPositive = change >= 0;

  return (
    <p
      className={cn(
        "text-xs mt-1 flex items-center gap-1",
        isPositive ? "text-success" : "text-destructive"
      )}
    >
      {isPositive ? (
        <TrendingUp className="h-3 w-3" />
      ) : (
        <TrendingDown className="h-3 w-3" />
      )}
      {isPositive ? "+" : ""}
      {change.toFixed(1)}% {label}
    </p>
  );
}
