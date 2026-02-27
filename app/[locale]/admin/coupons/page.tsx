import { getTranslations } from "next-intl/server";
import { getAllCoupons, deleteCoupon } from "@/lib/actions/coupon.actions";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "@/i18n/navigation";
import { formatId, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import DeleteDialog from "@/components/shared/delete-dialog";
import Pagination from "@/components/shared/pagination";
import { requireAdmin } from "@/lib/auth-guard";

export async function generateMetadata() {
  const t = await getTranslations("AdminCoupons");
  return { title: t("coupons") };
}

export default async function AdminCouponsPage(props: {
  searchParams: Promise<{ page?: string; query?: string }>;
}) {
  await requireAdmin();
  const t = await getTranslations("AdminCoupons");
  const tCommon = await getTranslations("Common");
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const query = searchParams.query || "";

  const { data: coupons, totalPages } = await getAllCoupons({
    page,
    query,
  });

  const getStatusBadge = (coupon: typeof coupons[0]) => {
    if (!coupon.isActive)
      return <Badge variant="secondary">{t("inactive")}</Badge>;
    if (coupon.validUntil && new Date(coupon.validUntil) < new Date())
      return <Badge variant="destructive">{t("expired")}</Badge>;
    return <Badge className="bg-green-600">{t("active")}</Badge>;
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "percentage":
        return t("percentage");
      case "fixed_amount":
        return t("fixedAmount");
      case "free_shipping":
        return t("freeShipping");
      default:
        return type;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex-between">
        <h1 className="h2-bold">{t("coupons")}</h1>
        <Button asChild variant="default">
          <Link href="/admin/coupons/create">{t("createCoupon")}</Link>
        </Button>
      </div>
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>{t("code")}</TableHead>
              <TableHead>{t("type")}</TableHead>
              <TableHead>{t("value")}</TableHead>
              <TableHead>{t("usedCount")}</TableHead>
              <TableHead>{t("validUntil")}</TableHead>
              <TableHead>{t("status")}</TableHead>
              <TableHead className="w-[100px]">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.map((coupon) => (
              <TableRow key={coupon.id}>
                <TableCell>{formatId(coupon.id)}</TableCell>
                <TableCell className="font-mono font-bold">
                  {coupon.code}
                </TableCell>
                <TableCell>{getTypeLabel(coupon.discountType)}</TableCell>
                <TableCell>
                  {coupon.discountType === "percentage"
                    ? `${coupon.discountValue}%`
                    : formatCurrency(coupon.discountValue)}
                </TableCell>
                <TableCell>
                  {coupon.usedCount}
                  {coupon.maxUses ? ` / ${coupon.maxUses}` : ""}
                </TableCell>
                <TableCell>
                  {coupon.validUntil
                    ? new Date(coupon.validUntil).toLocaleDateString()
                    : "-"}
                </TableCell>
                <TableCell>{getStatusBadge(coupon)}</TableCell>
                <TableCell className="flex gap-1">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/coupons/${coupon.id}`}>
                      {tCommon("edit")}
                    </Link>
                  </Button>
                  <DeleteDialog id={coupon.id} action={deleteCoupon} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {totalPages > 1 && <Pagination page={page} totalPages={totalPages} />}
      </div>
    </div>
  );
}
