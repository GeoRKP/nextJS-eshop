import { requireAdmin } from "@/lib/auth-guard";
import {
  getDashboardData,
  type DashboardFilters as DashboardFiltersType,
} from "@/lib/actions/dashboard.actions";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import DashboardFilters from "./dashboard-filters";
import KpiCards from "./kpi-cards";
import Charts from "./charts-wrapper";

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
import { Eye, AlertTriangle } from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import OrderStatusBadge from "@/components/shared/order-status-badge";
import { ORDER_STATUS_TRANSLATION_KEY } from "@/lib/order-status";

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
    paidStatus: searchParams.paidStatus,
    paymentMethod: searchParams.paymentMethod,
    category: searchParams.category,
  };

  const data = await getDashboardData(filters);
  const t = await getTranslations("AdminDashboard");
  const tOrder = await getTranslations("Order");

  const statusLabel = (status: string) => {
    const key = ORDER_STATUS_TRANSLATION_KEY[status];
    return key ? tOrder(key as Parameters<typeof tOrder>[0]) : status;
  };

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
        ordersByStatus={data.ordersByStatus.map((s) => ({
          ...s,
          status: statusLabel(s.status),
        }))}
        revenueByPaymentMethod={data.revenueByPaymentMethod}
        topProducts={data.topProducts}
        salesByCategory={data.salesByCategory}
        labels={{
          revenue: t("revenue"),
          sales: t("sales"),
          unitsSold: t("unitsSold"),
          revenueOverTime: t("revenueOverTime"),
          ordersByStatus: t("ordersByStatus"),
          topProducts: t("topProducts"),
          revenueByPayment: t("revenueByPayment"),
          salesByCategory: t("salesByCategory"),
          noData: t("noData"),
        }}
      />

      {/* Recent Orders */}
      <div className="card-premium">
        <div className="px-5 py-3 border-b border-border/40">
          <h3 className="font-heading font-bold text-sm uppercase">
            {t("recentSales")}
          </h3>
        </div>
        <div className="p-5">
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
                  <TableCell className="text-sm">{order.userName}</TableCell>
                  <TableCell className="text-sm">
                    {formatDateTime(order.createdAt).dateOnly}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatCurrency(order.totalPrice)}
                  </TableCell>
                  <TableCell>
                    <OrderStatusBadge
                      status={order.status}
                      label={statusLabel(order.status)}
                    />
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
        </div>
      </div>

      {/* Low Stock Alerts */}
      {data.lowStockProducts.length > 0 && (
        <div className="card-premium">
          <div className="px-5 py-3 border-b border-border/40 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <h3 className="font-heading font-bold text-sm uppercase">
              {t("lowStockAlerts")}
            </h3>
          </div>
          <div className="p-5">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("productName")}</TableHead>
                  <TableHead>{t("stock")}</TableHead>
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
                    <TableCell>
                      {p.stock === 0 ? (
                        <Badge variant="destructive">{t("outOfStock")}</Badge>
                      ) : (
                        <Badge variant="warning">{t("lowStock")}</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}

