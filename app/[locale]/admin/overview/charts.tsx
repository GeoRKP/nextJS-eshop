"use client";

import {
  AreaChart,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ── Color palette ──

const CHART_COLORS = [
  "hsl(210, 70%, 55%)", // blue
  "hsl(150, 60%, 45%)", // green
  "hsl(45, 90%, 55%)", // amber
  "hsl(0, 70%, 55%)", // red
  "hsl(270, 60%, 55%)", // purple
  "hsl(190, 70%, 50%)", // cyan
  "hsl(330, 60%, 55%)", // pink
  "hsl(90, 60%, 45%)", // lime
];

// ── Types ──

type ChartsProps = {
  salesTimeSeries: { date: string; revenue: number; orders: number }[];
  ordersByStatus: { status: string; count: number }[];
  revenueByPaymentMethod: { method: string; revenue: number }[];
  topProducts: { name: string; unitsSold: number; revenue: number }[];
  salesByCategory: { category: string; revenue: number }[];
  noDataLabel: string;
};

// ── Main component ──

export default function Charts({
  salesTimeSeries,
  ordersByStatus,
  revenueByPaymentMethod,
  topProducts,
  salesByCategory,
  noDataLabel,
}: ChartsProps) {
  return (
    <>
      {/* Row 1: Revenue chart + Order status donut */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="text-base">Revenue & Orders Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={salesTimeSeries} noDataLabel={noDataLabel} />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusDonut data={ordersByStatus} noDataLabel={noDataLabel} />
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Top products + Revenue by payment */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="text-base">Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <TopProductsChart data={topProducts} noDataLabel={noDataLabel} />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Revenue by Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <PaymentDonut data={revenueByPaymentMethod} noDataLabel={noDataLabel} />
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Sales by category */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="text-base">Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryPie data={salesByCategory} noDataLabel={noDataLabel} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

// ── Empty state ──

function NoData({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
      {label}
    </div>
  );
}

// ── 1. Revenue & Orders Over Time (ComposedChart) ──

function RevenueChart({
  data,
  noDataLabel,
}: {
  data: ChartsProps["salesTimeSeries"];
  noDataLabel: string;
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
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          yAxisId="revenue"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `€${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
        />
        <YAxis
          yAxisId="orders"
          orientation="right"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          formatter={(value: number, name: string) => [
            name === "revenue" ? formatCurrency(value) : value,
            name === "revenue" ? "Revenue" : "Orders",
          ]}
          labelFormatter={(label) => label}
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid hsl(var(--border))",
            background: "hsl(var(--background))",
          }}
        />
        <Legend />
        <Area
          yAxisId="revenue"
          type="monotone"
          dataKey="revenue"
          name="Revenue"
          stroke={CHART_COLORS[0]}
          fill="url(#revenueGradient)"
          strokeWidth={2}
        />
        <Line
          yAxisId="orders"
          type="monotone"
          dataKey="orders"
          name="Orders"
          stroke={CHART_COLORS[1]}
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// ── 2. Orders by Status (Donut) ──

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
          label={({ status, count }) =>
            `${status} (${((count / total) * 100).toFixed(0)}%)`
          }
          labelLine={false}
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
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid hsl(var(--border))",
            background: "hsl(var(--background))",
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ── 3. Revenue by Payment Method (Donut) ──

function PaymentDonut({
  data,
  noDataLabel,
}: {
  data: ChartsProps["revenueByPaymentMethod"];
  noDataLabel: string;
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
          formatter={(value: number) => [formatCurrency(value), "Revenue"]}
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid hsl(var(--border))",
            background: "hsl(var(--background))",
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ── 4. Top Products (Horizontal Bar) ──

function TopProductsChart({
  data,
  noDataLabel,
}: {
  data: ChartsProps["topProducts"];
  noDataLabel: string;
}) {
  if (data.length === 0) return <NoData label={noDataLabel} />;

  // Truncate long product names for the axis
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
          tickFormatter={(v) => `€${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
          stroke="#888888"
          fontSize={12}
        />
        <YAxis
          type="category"
          dataKey="shortName"
          width={150}
          fontSize={12}
          stroke="#888888"
          tickLine={false}
        />
        <Tooltip
          formatter={(value: number, name: string) => [
            name === "revenue" ? formatCurrency(value) : value,
            name === "revenue" ? "Revenue" : "Units Sold",
          ]}
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid hsl(var(--border))",
            background: "hsl(var(--background))",
          }}
        />
        <Bar
          dataKey="revenue"
          name="Revenue"
          fill={CHART_COLORS[0]}
          radius={[0, 4, 4, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── 5. Sales by Category (Pie) ──

function CategoryPie({
  data,
  noDataLabel,
}: {
  data: ChartsProps["salesByCategory"];
  noDataLabel: string;
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
          formatter={(value: number) => [formatCurrency(value), "Revenue"]}
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid hsl(var(--border))",
            background: "hsl(var(--background))",
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
