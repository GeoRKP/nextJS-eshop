import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function KpiCards({ kpi }: { kpi: KpiData }) {
  const cards = [
    {
      title: "Total Revenue",
      value: formatCurrency(kpi.revenue),
      change: percentChange(kpi.revenue, kpi.revenuePrev),
      icon: BadgeDollarSign,
    },
    {
      title: "Sales",
      value: formatNumber(kpi.ordersCount),
      change: percentChange(kpi.ordersCount, kpi.ordersCountPrev),
      icon: CreditCard,
    },
    {
      title: "New Customers",
      value: formatNumber(kpi.newCustomers),
      change: percentChange(kpi.newCustomers, kpi.newCustomersPrev),
      icon: UserPlus,
    },
    {
      title: "Avg Order Value",
      value: formatCurrency(kpi.avgOrderValue),
      change: percentChange(kpi.avgOrderValue, kpi.avgOrderValuePrev),
      icon: ShoppingCart,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <ChangeIndicator change={card.change} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ChangeIndicator({ change }: { change: number | null }) {
  if (change === null) {
    return <p className="text-xs text-muted-foreground mt-1">—</p>;
  }

  const isPositive = change >= 0;

  return (
    <p
      className={cn(
        "text-xs mt-1 flex items-center gap-1",
        isPositive ? "text-green-600" : "text-red-600"
      )}
    >
      {isPositive ? (
        <TrendingUp className="h-3 w-3" />
      ) : (
        <TrendingDown className="h-3 w-3" />
      )}
      {isPositive ? "+" : ""}
      {change.toFixed(1)}% from previous period
    </p>
  );
}
