import { Table, TableCell, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deleteOrder, getAllOrders } from "@/lib/actions/order.actions";
import { formatDateTime } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import { requireAdmin } from "@/lib/auth-guard";
import { formatId } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import Pagination from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import DeleteDialog from "@/components/shared/delete-dialog";
import { getTranslations } from "next-intl/server";
import OrderStatusBadge from "@/components/shared/order-status-badge";
import { ORDER_STATUSES } from "@/lib/validators";

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
    title: t("adminOrders"),
  };
}

export default async function AdminOrdersPage(props: {
  searchParams: Promise<{ page: string; query: string; status: string }>;
}) {
  const { page = "1", query = "", status = "" } = await props.searchParams;

  await requireAdmin();

  const orders = await getAllOrders({
    page: parseInt(page),
    query,
    status: status || undefined,
  });

  const t = await getTranslations("AdminOrders");
  const tCommon = await getTranslations("Common");
  const tOrder = await getTranslations("Order");

  return (
    <div className="space-y-2 ">
      <div className="flex items-center gap-3 flex-wrap">
          <h1 className="h2-bold">{t("orders")}</h1>
          {query && (
            <div>
              {tCommon("filteredBy")} <i>&quot;{query}&quot;</i>
              <Link href="/admin/orders">
                <Button variant="outline" size="sm" className="ml-2">
                  {tCommon("removeFilter")}
                </Button>
              </Link>
            </div>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href="/admin/orders">
            <Button variant={!status ? "default" : "outline"} size="sm">
              {tCommon("all")}
            </Button>
          </Link>
          {ORDER_STATUSES.map((s) => (
            <Link key={s} href={`/admin/orders?status=${s}`}>
              <Button variant={status === s ? "default" : "outline"} size="sm">
                {tOrder(statusTranslationKey[s] as Parameters<typeof tOrder>[0]) || s}
              </Button>
            </Link>
          ))}
        </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("id")}</TableHead>
              <TableHead>{t("date")}</TableHead>
              <TableHead>{t("buyer")}</TableHead>
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
                <TableCell>
                  {order.user.name}
                </TableCell>
                <TableCell>{formatCurrency(order.totalPrice)}</TableCell>
                <TableCell>
                  <OrderStatusBadge
                    status={(order as { status?: string }).status || "pending"}
                    label={tOrder(statusTranslationKey[(order as { status?: string }).status || "pending"] as Parameters<typeof tOrder>[0]) || (order as { status?: string }).status || "pending"}
                  />
                </TableCell>
                <TableCell>
                  {order.isPaid && order.paidAt
                    ? formatDateTime(order.paidAt).dateTime
                    : tCommon("notPaid")}
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/order/${order.id}`}>
                      {tCommon("details")}
                    </Link>
                    </Button>

                    <DeleteDialog id={order.id} action={deleteOrder} />
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
