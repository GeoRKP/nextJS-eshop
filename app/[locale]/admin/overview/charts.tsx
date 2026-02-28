"use client";

import {
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  ComposedChart,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

// -- Color palette --

const CHART_COLORS = [
  "hsl(var(--brand-accent))", // brand accent (amber gold)
  "hsl(var(--primary))", // primary (deep navy)
  "hsl(150, 60%, 45%)", // green
  "hsl(0, 70%, 55%)", // red
  "hsl(270, 60%, 55%)", // purple
  "hsl(190, 70%, 50%)", // cyan
  "hsl(330, 60%, 55%)", // pink
  "hsl(90, 60%, 45%)", // lime
];

const AXIS_STROKE = "hsl(var(--muted-foreground))";

// -- Types --

type ChartsProps = {
  salesTimeSeries: { date: string; revenue: number; orders: number }[];
  ordersByStatus: { status: string; count: number }[];
  revenueByPaymentMethod: { method: string; revenue: number }[];
  topProducts: { name: string; unitsSold: number; revenue: number }[];
  salesByCategory: { category: string; revenue: number }[];
  noDataLabel: string;
  t: (key: string) => string;
};

// -- Main component --

export default function Charts({
  salesTimeSeries,
  ordersByStatus,
  revenueByPaymentMethod,
  topProducts,
  salesByCategory,
  noDataLabel,
  t,
}: ChartsProps) {
  return (
    <>
      {/* Row 1: Revenue chart + Order status donut */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="card-premium col-span-4">
          <div className="px-5 py-3 border-b border-border/40">
            <h3 className="font-heading font-bold text-sm uppercase">
              {t("revenueOverTime")}
            </h3>
          </div>
          <div className="p-5">
            <RevenueChart data={salesTimeSeries} noDataLabel={noDataLabel} t={t} />
          </div>
        </div>
        <div className="card-premium col-span-3">
          <div className="px-5 py-3 border-b border-border/40">
            <h3 className="font-heading font-bold text-sm uppercase">
              {t("ordersByStatus")}
            </h3>
          </div>
          <div className="p-5">
            <StatusDonut data={ordersByStatus} noDataLabel={noDataLabel} />
          </div>
        </div>
      </div>

      {/* Row 2: Top products + Revenue by payment */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="card-premium col-span-4">
          <div className="px-5 py-3 border-b border-border/40">
            <h3 className="font-heading font-bold text-sm uppercase">
              {t("topProducts")}
            </h3>
          </div>
          <div className="p-5">
            <TopProductsChart data={topProducts} noDataLabel={noDataLabel} t={t} />
          </div>
        </div>
        <div className="card-premium col-span-3">
          <div className="px-5 py-3 border-b border-border/40">
            <h3 className="font-heading font-bold text-sm uppercase">
              {t("revenueByPayment")}
            </h3>
          </div>
          <div className="p-5">
            <PaymentDonut data={revenueByPaymentMethod} noDataLabel={noDataLabel} t={t} />
          </div>
        </div>
      </div>

      {/* Row 3: Sales by category */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="card-premium col-span-4">
          <div className="px-5 py-3 border-b border-border/40">
            <h3 className="font-heading font-bold text-sm uppercase">
              {t("salesByCategory")}
            </h3>
          </div>
          <div className="p-5">
            <CategoryPie data={salesByCategory} noDataLabel={noDataLabel} t={t} />
          </div>
        </div>
      </div>
    </>
  );
}

// -- Empty state --

function NoData({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
      {label}
    </div>
  );
}

// -- Shared tooltip style --

const tooltipStyle = {
  borderRadius: "8px",
  border: "1px solid hsl(var(--border))",
  background: "hsl(var(--background))",
};

// -- 1. Revenue & Orders Over Time (ComposedChart) --

function RevenueChart({
  data,
  noDataLabel,
  t,
}: {
  data: ChartsProps["salesTimeSeries"];
  noDataLabel: string;
  t: (key: string) => string;
}) {
  if (data.length === 0) return <NoData label={noDataLabel} />;

  return (
    <ResponsiveContainer width="100%" height={350}>
      <ComposedChart data={data}>
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={CHART_COLORS[0]} stopOpacity={0.3} />
            <stop offset="95%" stopColor={CHART_COLORS[0]} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="date"
          stroke={AXIS_STROKE}
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          yAxisId="revenue"
          stroke={AXIS_STROKE}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) =>
            `\u20AC${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`
          }
        />
        <YAxis
          yAxisId="orders"
          orientation="right"
          stroke={AXIS_STROKE}
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          formatter={(value: number, name: string) => [
            name === "revenue" ? formatCurrency(value) : value,
            name === "revenue" ? t("revenue") : t("sales"),
          ]}
          labelFormatter={(label) => label}
          contentStyle={tooltipStyle}
        />
        <Legend />
        <Area
          yAxisId="revenue"
          type="monotone"
          dataKey="revenue"
          name={t("revenue")}
          stroke={CHART_COLORS[0]}
          fill="url(#revenueGradient)"
          strokeWidth={2}
        />
        <Line
          yAxisId="orders"
          type="monotone"
          dataKey="orders"
          name={t("sales")}
          stroke={CHART_COLORS[1]}
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// -- 2. Orders by Status (Donut) --

function StatusDonut({
  data,
  noDataLabel,
}: {
  data: ChartsProps["ordersByStatus"];
  noDataLabel: string;
}) {
  if (data.length === 0) return <NoData label={noDataLabel} />;

  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="status"
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={95}
          paddingAngle={2}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number, name: string) => [
            `${value} (${((value / total) * 100).toFixed(1)}%)`,
            name,
          ]}
          contentStyle={tooltipStyle}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

// -- 3. Revenue by Payment Method (Donut) --

function PaymentDonut({
  data,
  noDataLabel,
  t,
}: {
  data: ChartsProps["revenueByPaymentMethod"];
  noDataLabel: string;
  t: (key: string) => string;
}) {
  if (data.length === 0) return <NoData label={noDataLabel} />;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="revenue"
          nameKey="method"
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={95}
          paddingAngle={2}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => [formatCurrency(value), t("revenue")]}
          contentStyle={tooltipStyle}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

// -- 4. Top Products (Horizontal Bar) --

function TopProductsChart({
  data,
  noDataLabel,
  t,
}: {
  data: ChartsProps["topProducts"];
  noDataLabel: string;
  t: (key: string) => string;
}) {
  if (data.length === 0) return <NoData label={noDataLabel} />;

  const chartData = data.map((d) => ({
    ...d,
    shortName: d.name.length > 25 ? d.name.slice(0, 22) + "..." : d.name,
  }));

  return (
    <ResponsiveContainer width="100%" height={Math.max(250, data.length * 45)}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          type="number"
          tickFormatter={(v) =>
            `\u20AC${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`
          }
          stroke={AXIS_STROKE}
          fontSize={12}
        />
        <YAxis
          type="category"
          dataKey="shortName"
          width={150}
          fontSize={12}
          stroke={AXIS_STROKE}
          tickLine={false}
        />
        <Tooltip
          formatter={(value: number, name: string) => [
            name === "revenue" ? formatCurrency(value) : value,
            name === "revenue" ? t("revenue") : t("unitsSold"),
          ]}
          contentStyle={tooltipStyle}
        />
        <Bar
          dataKey="revenue"
          name={t("revenue")}
          fill={CHART_COLORS[0]}
          radius={[0, 4, 4, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

// -- 5. Sales by Category (Pie) --

function CategoryPie({
  data,
  noDataLabel,
  t,
}: {
  data: ChartsProps["salesByCategory"];
  noDataLabel: string;
  t: (key: string) => string;
}) {
  if (data.length === 0) return <NoData label={noDataLabel} />;

  const total = data.reduce((sum, d) => sum + d.revenue, 0);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="revenue"
          nameKey="category"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label={({ category, revenue }) =>
            `${category} (${((revenue / total) * 100).toFixed(0)}%)`
          }
        >
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => [formatCurrency(value), t("revenue")]}
          contentStyle={tooltipStyle}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
