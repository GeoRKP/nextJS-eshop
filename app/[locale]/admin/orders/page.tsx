import {
  Table,
  TableCell,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteOrder, getAllOrders } from "@/lib/actions/order.actions";
import { formatDateTime, formatCurrency, formatId } from "@/lib/utils";
import { requireAdmin } from "@/lib/auth-guard";
import { Link } from "@/i18n/navigation";
import Pagination from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import DeleteDialog from "@/components/shared/delete-dialog";
import { getTranslations } from "next-intl/server";
import OrderStatusBadge from "@/components/shared/order-status-badge";
import { ORDER_STATUSES } from "@/lib/validators";
import { ShoppingCart } from "lucide-react";

import { ORDER_STATUS_TRANSLATION_KEY as statusTranslationKey } from "@/lib/order-status";

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
    <div className="space-y-4">
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
          <Button variant={!status ? "accent" : "outline"} size="sm">
            {tCommon("all")}
          </Button>
        </Link>
        {ORDER_STATUSES.map((s) => (
          <Link key={s} href={`/admin/orders?status=${s}`}>
            <Button variant={status === s ? "accent" : "outline"} size="sm">
              {tOrder(
                statusTranslationKey[s] as Parameters<typeof tOrder>[0]
              ) || s}
            </Button>
          </Link>
        ))}
      </div>

      <div className="card-premium overflow-hidden">
        <div className="overflow-x-auto">
          {orders.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <ShoppingCart className="h-10 w-10 mb-3 opacity-50" />
              <p className="text-sm">{tCommon("noItems")}</p>
            </div>
          ) : (
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
                    <TableCell>{order.user.name}</TableCell>
                    <TableCell>{formatCurrency(order.totalPrice)}</TableCell>
                    <TableCell>
                      <OrderStatusBadge
                        status={
                          (order as { status?: string }).status || "pending"
                        }
                        label={
                          tOrder(
                            statusTranslationKey[
                              (order as { status?: string }).status || "pending"
                            ] as Parameters<typeof tOrder>[0]
                          ) ||
                          (order as { status?: string }).status ||
                          "pending"
                        }
                      />
                    </TableCell>
                    <TableCell>
                      {order.isPaid && order.paidAt
                        ? formatDateTime(order.paidAt).dateTime
                        : tCommon("notPaid")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/order/${order.id}`}>
                            {tCommon("details")}
                          </Link>
                        </Button>
                        <DeleteDialog id={order.id} action={deleteOrder} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {orders.totalPages > 1 && (
        <Pagination
          page={Number(page) || 1}
          totalPages={orders?.totalPages}
        />
      )}
    </div>
  );
}
