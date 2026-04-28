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
  "oklch(var(--brand-accent))", // brand accent (signal yellow)
  "oklch(var(--primary))", // primary (graphite)
  "oklch(0.65 0.15 150)", // green
  "oklch(0.58 0.20 28)",  // red
  "oklch(0.55 0.18 295)", // purple
  "oklch(0.68 0.12 210)", // cyan
  "oklch(0.62 0.18 350)", // pink
  "oklch(0.68 0.16 135)", // lime
];

const AXIS_STROKE = "oklch(var(--muted-foreground))";

// -- Types --

type ChartLabels = {
  revenue: string;
  sales: string;
  unitsSold: string;
  revenueOverTime: string;
  ordersByStatus: string;
  topProducts: string;
  revenueByPayment: string;
  salesByCategory: string;
  noData: string;
};

type ChartsProps = {
  salesTimeSeries: { date: string; revenue: number; orders: number }[];
  ordersByStatus: { status: string; count: number }[];
  revenueByPaymentMethod: { method: string; revenue: number }[];
  topProducts: { name: string; unitsSold: number; revenue: number }[];
  salesByCategory: { category: string; revenue: number }[];
  labels: ChartLabels;
};

// -- Main component --

export default function Charts({
  salesTimeSeries,
  ordersByStatus,
  revenueByPaymentMethod,
  topProducts,
  salesByCategory,
  labels,
}: ChartsProps) {
  return (
    <>
      {/* Row 1: Revenue chart + Order status donut */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="card-premium col-span-4">
          <div className="px-5 py-3 border-b border-border/40">
            <h3 className="font-heading font-bold text-sm uppercase">
              {labels.revenueOverTime}
            </h3>
          </div>
          <div className="p-5">
            <RevenueChart data={salesTimeSeries} labels={labels} />
          </div>
        </div>
        <div className="card-premium col-span-3">
          <div className="px-5 py-3 border-b border-border/40">
            <h3 className="font-heading font-bold text-sm uppercase">
              {labels.ordersByStatus}
            </h3>
          </div>
          <div className="p-5">
            <StatusDonut data={ordersByStatus} noDataLabel={labels.noData} />
          </div>
        </div>
      </div>

      {/* Row 2: Top products + Revenue by payment */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="card-premium col-span-4">
          <div className="px-5 py-3 border-b border-border/40">
            <h3 className="font-heading font-bold text-sm uppercase">
              {labels.topProducts}
            </h3>
          </div>
          <div className="p-5">
            <TopProductsChart data={topProducts} labels={labels} />
          </div>
        </div>
        <div className="card-premium col-span-3">
          <div className="px-5 py-3 border-b border-border/40">
            <h3 className="font-heading font-bold text-sm uppercase">
              {labels.revenueByPayment}
            </h3>
          </div>
          <div className="p-5">
            <PaymentDonut data={revenueByPaymentMethod} labels={labels} />
          </div>
        </div>
      </div>

      {/* Row 3: Sales by category */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="card-premium col-span-4">
          <div className="px-5 py-3 border-b border-border/40">
            <h3 className="font-heading font-bold text-sm uppercase">
              {labels.salesByCategory}
            </h3>
          </div>
          <div className="p-5">
            <CategoryPie data={salesByCategory} labels={labels} />
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
  border: "1px solid oklch(var(--border))",
  background: "oklch(var(--background))",
};

// -- 1. Revenue & Orders Over Time (ComposedChart) --

function RevenueChart({
  data,
  labels,
}: {
  data: ChartsProps["salesTimeSeries"];
  labels: ChartLabels;
}) {
  if (data.length === 0) return <NoData label={labels.noData} />;

  return (
    <ResponsiveContainer width="100%" height={280} className="sm:!h-[350px]">
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
            `${v >= 1000 ? formatCurrency((v / 1000).toFixed(1)) + "k" : formatCurrency(v)}`
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
            name === "revenue" ? labels.revenue : labels.sales,
          ]}
          labelFormatter={(label) => label}
          contentStyle={tooltipStyle}
        />
        <Legend />
        <Area
          yAxisId="revenue"
          type="monotone"
          dataKey="revenue"
          name={labels.revenue}
          stroke={CHART_COLORS[0]}
          fill="url(#revenueGradient)"
          strokeWidth={2}
        />
        <Line
          yAxisId="orders"
          type="monotone"
          dataKey="orders"
          name={labels.sales}
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
    <ResponsiveContainer width="100%" height={240} className="sm:!h-[300px]">
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
  labels,
}: {
  data: ChartsProps["revenueByPaymentMethod"];
  labels: ChartLabels;
}) {
  if (data.length === 0) return <NoData label={labels.noData} />;

  return (
    <ResponsiveContainer width="100%" height={240} className="sm:!h-[300px]">
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
          formatter={(value: number) => [formatCurrency(value), labels.revenue]}
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
  labels,
}: {
  data: ChartsProps["topProducts"];
  labels: ChartLabels;
}) {
  if (data.length === 0) return <NoData label={labels.noData} />;

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
            `${v >= 1000 ? formatCurrency((v / 1000).toFixed(1)) + "k" : formatCurrency(v)}`
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
            name === "revenue" ? labels.revenue : labels.unitsSold,
          ]}
          contentStyle={tooltipStyle}
        />
        <Bar
          dataKey="revenue"
          name={labels.revenue}
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
  labels,
}: {
  data: ChartsProps["salesByCategory"];
  labels: ChartLabels;
}) {
  if (data.length === 0) return <NoData label={labels.noData} />;

  const total = data.reduce((sum, d) => sum + d.revenue, 0);

  return (
    <ResponsiveContainer width="100%" height={240} className="sm:!h-[300px]">
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
          formatter={(value: number) => [formatCurrency(value), labels.revenue]}
          contentStyle={tooltipStyle}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
