import { getMyOrders } from "@/lib/actions/order.actions";
import { formatCurrency, formatDateTime, formatId } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import {
  Table,
  TableRow,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import Pagination from "@/components/shared/pagination";
import { getTranslations } from "next-intl/server";
import OrderStatusBadge from "@/components/shared/order-status-badge";
import { Package, Eye } from "lucide-react";

const statusTranslationKey: Record<string, string> = {
  pending: "statusPending",
  confirmed: "statusConfirmed",
  processing: "statusProcessing",
  shipped: "statusShipped",
  delivered: "statusDelivered",
  cancelled: "statusCancelled",
  refund_requested: "statusRefundRequested",
  refunded: "statusRefunded",
};

export async function generateMetadata() {
  const t = await getTranslations("Metadata");
  return {
    title: t("myOrders"),
  };
}

export default async function OrdersPage(props: {
  searchParams: Promise<{ page: string }>;
}) {
  const { page } = await props.searchParams;
  const orders = await getMyOrders({
    page: Number(page) || 1,
  });

  const t = await getTranslations("Order");
  const tCommon = await getTranslations("Common");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Package className="w-6 h-6" />
        <h2 className="h2-bold">{t("orderHistory")}</h2>
      </div>

      {orders.data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
            <Package className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <p className="text-muted-foreground">{t("noOrders")}</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block card-premium overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="font-semibold">{t("orderId")}</TableHead>
                  <TableHead className="font-semibold">{t("date")}</TableHead>
                  <TableHead className="font-semibold">{t("total")}</TableHead>
                  <TableHead className="font-semibold">{t("status")}</TableHead>
                  <TableHead className="font-semibold">{t("paid")}</TableHead>
                  <TableHead className="font-semibold">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.data.map((order) => (
                  <TableRow key={order.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="font-mono text-xs">{formatId(order.id)}</TableCell>
                    <TableCell className="text-sm">
                      {formatDateTime(order.createdAt).dateTime}
                    </TableCell>
                    <TableCell className="font-semibold">{formatCurrency(order.totalPrice)}</TableCell>
                    <TableCell>
                      <OrderStatusBadge
                        status={(order as { status?: string }).status || "pending"}
                        label={t(statusTranslationKey[(order as { status?: string }).status || "pending"] as Parameters<typeof t>[0]) || (order as { status?: string }).status || "pending"}
                      />
                    </TableCell>
                    <TableCell className="text-sm">
                      {order.isPaid && order.paidAt
                        ? formatDateTime(order.paidAt).dateTime
                        : <span className="text-muted-foreground">{tCommon("notPaid")}</span>}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/order/${order.id}`}
                        className="inline-flex items-center gap-1 text-xs text-brand-accent hover:text-brand-accent-dark transition-colors font-medium"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        {tCommon("details")}
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {orders.data.map((order) => (
              <Link key={order.id} href={`/order/${order.id}`} className="block">
                <div className="card-premium p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm text-muted-foreground">{formatId(order.id)}</span>
                    <OrderStatusBadge
                      status={(order as { status?: string }).status || "pending"}
                      label={t(statusTranslationKey[(order as { status?: string }).status || "pending"] as Parameters<typeof t>[0]) || (order as { status?: string }).status || "pending"}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {formatDateTime(order.createdAt).dateTime}
                    </span>
                    <span className="font-bold">{formatCurrency(order.totalPrice)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {orders.totalPages > 1 && (
            <div className="flex justify-center pt-4">
              <Pagination
                page={Number(page) || 1}
                totalPages={orders?.totalPages}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
