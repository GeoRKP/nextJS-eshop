import { getTranslations } from "next-intl/server";
import { requireAdmin } from "@/lib/auth-guard";
import CouponForm from "@/components/admin/coupon-form";
import { getCouponById } from "@/lib/actions/coupon.actions";
import { notFound } from "next/navigation";

export async function generateMetadata() {
  const t = await getTranslations("AdminCoupons");
  return { title: t("updateCoupon") };
}

export default async function UpdateCouponPage(props: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await props.params;
  const coupon = await getCouponById(id);
  if (!coupon) notFound();

  return (
    <div className="space-y-8 max-w-lg mx-auto">
      <CouponForm type="Update" coupon={coupon} couponId={id} />
    </div>
  );
}
