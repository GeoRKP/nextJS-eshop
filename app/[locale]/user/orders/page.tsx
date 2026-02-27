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
    <div className="space-y-2 ">
      <h2 className="h2-bold">{t("orderHistory")}</h2>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("orderId")}</TableHead>
              <TableHead>{t("date")}</TableHead>
              <TableHead>{t("total")}</TableHead>
              <TableHead>{t("status")}</TableHead>
              <TableHead>{t("paid")}</TableHead>
              <TableHead>{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.data.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{formatId(order.id)}</TableCell>
                <TableCell>
                  {formatDateTime(order.createdAt).dateTime}
                </TableCell>
                <TableCell>{formatCurrency(order.totalPrice)}</TableCell>
                <TableCell>
                  <OrderStatusBadge
                    status={(order as { status?: string }).status || "pending"}
                    label={t(statusTranslationKey[(order as { status?: string }).status || "pending"] as Parameters<typeof t>[0]) || (order as { status?: string }).status || "pending"}
                  />
                </TableCell>
                <TableCell>
                  {order.isPaid && order.paidAt
                    ? formatDateTime(order.paidAt).dateTime
                    : tCommon("notPaid")}
                </TableCell>
                <TableCell>
                  <Link href={`/order/${order.id}`}>
                    <span className="px-2">{tCommon("details")}</span>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {orders.totalPages > 1 && (
          <Pagination
            page={Number(page) || 1}
            totalPages={orders?.totalPages}
          />
        )}
      </div>
    </div>
  );
}
