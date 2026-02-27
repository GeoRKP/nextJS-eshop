import { getTranslations } from "next-intl/server";
import { requireAdmin } from "@/lib/auth-guard";
import CouponForm from "@/components/admin/coupon-form";

export async function generateMetadata() {
  const t = await getTranslations("AdminCoupons");
  return { title: t("createCoupon") };
}

export default async function CreateCouponPage() {
  await requireAdmin();

  return (
    <div className="space-y-8 max-w-lg mx-auto">
      <CouponForm type="Create" />
    </div>
  );
}
