import { requireAdmin } from "@/lib/auth-guard";
import { getDashboardData, type DashboardFilters as DashboardFiltersType } from "@/lib/actions/dashboard.actions";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import DashboardFilters from "./dashboard-filters";
import KpiCards from "./kpi-cards";
import Charts from "./charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import { Eye, AlertTriangle, Ticket } from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export async function generateMetadata() {
  const t = await getTranslations("Metadata");
  return { title: t("adminDashboard") };
}

export default async function AdminOverviewPage(props: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireAdmin();

  const searchParams = await props.searchParams;
  const filters: DashboardFiltersType = {
    period: searchParams.period,
    from: searchParams.from,
    to: searchParams.to,
    status: searchParams.status,
    paymentMethod: searchParams.paymentMethod,
    category: searchParams.category,
  };

  const data = await getDashboardData(filters);
  const t = await getTranslations("AdminDashboard");
  const tCommon = await getTranslations("Common");

  return (
    <div className="space-y-4">
      {/* Header + Filters */}
      <div className="flex flex-col gap-4">
        <h1 className="h2-bold">{t("dashboard")}</h1>
        <Suspense>
          <DashboardFilters categories={data.categories} />
        </Suspense>
      </div>

      {/* KPI Cards */}
      <KpiCards kpi={data.kpi} t={(key) => t(key as Parameters<typeof t>[0])} />

      {/* Charts */}
      <Charts
        salesTimeSeries={data.salesTimeSeries}
        ordersByStatus={data.ordersByStatus}
        revenueByPaymentMethod={data.revenueByPaymentMethod}
        topProducts={data.topProducts}
        salesByCategory={data.salesByCategory}
        noDataLabel={t("noData")}
      />

      {/* Bottom row: Coupon Stats + Low Stock + Recent Orders */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Coupon Performance */}
        <Card className="col-span-4">
          <CardHeader className="flex flex-row items-center gap-2">
            <Ticket className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">{t("couponPerformance")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("totalDiscountGiven")}
                </p>
                <p className="text-xl font-bold">
                  {formatCurrency(data.couponStats.totalDiscountGiven)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("ordersWithCoupons")}
                </p>
                <p className="text-xl font-bold">
                  {data.couponStats.ordersWithCoupons}
                  {data.kpi.ordersCount > 0 && (
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                      (
                      {(
                        (data.couponStats.ordersWithCoupons /
                          data.kpi.ordersCount) *
                        100
                      ).toFixed(1)}
                      % {t("ofTotal")})
                    </span>
                  )}
                </p>
              </div>
            </div>

            {data.couponStats.topCoupons.length > 0 && (
              <>
                <p className="text-sm font-medium">{t("topCoupons")}</p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("couponCode")}</TableHead>
                      <TableHead>{t("uses")}</TableHead>
                      <TableHead>{t("discount")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.couponStats.topCoupons.map((c) => (
                      <TableRow key={c.code}>
                        <TableCell className="font-mono text-sm">
                          {c.code}
                        </TableCell>
                        <TableCell>{c.usageCount}</TableCell>
                        <TableCell>
                          {formatCurrency(c.totalDiscount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="text-base">{t("recentSales")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("buyer")}</TableHead>
                  <TableHead>{t("date")}</TableHead>
                  <TableHead>{t("total")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                  <TableHead>{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.latestOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="text-sm">
                      {order.userName}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDateTime(order.createdAt).dateOnly}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatCurrency(order.totalPrice)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={order.status} />
                    </TableCell>
                    <TableCell>
                      <Link href={`/order/${order.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alerts */}
      {data.lowStockProducts.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <CardTitle className="text-base">{t("lowStockAlerts")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("productName")}</TableHead>
                  <TableHead>{t("stock")}</TableHead>
                  <TableHead>{t("threshold")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.lowStockProducts.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <Link
                        href={`/product/${p.slug}`}
                        className="hover:underline"
                      >
                        {p.name}
                      </Link>
                    </TableCell>
                    <TableCell className="font-mono">{p.stock}</TableCell>
                    <TableCell className="font-mono">
                      {p.lowStockThreshold}
                    </TableCell>
                    <TableCell>
                      {p.stock === 0 ? (
                        <Badge variant="destructive">{t("outOfStock")}</Badge>
                      ) : (
                        <Badge variant="outline" className="text-amber-600 border-amber-600">
                          {t("lowStock")}
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    pending: "outline",
    confirmed: "secondary",
    processing: "secondary",
    shipped: "default",
    delivered: "default",
    cancelled: "destructive",
    refund_requested: "destructive",
    refunded: "destructive",
  };

  return (
    <Badge variant={variants[status] || "outline"} className="text-xs">
      {status}
    </Badge>
  );
}
