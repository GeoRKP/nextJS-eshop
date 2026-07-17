import { getAuthSession } from "@/lib/auth-session";
import { getUserById } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import PaymentMethodForm from "./payment-method-form";
import CheckoutSteps from "@/components/shared/checkout-steps";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("Metadata");
  return {
    title: t("selectPaymentMethod"),
  };
}

export default async function PaymentMethodPage() {
  const session = await getAuthSession();
  const userId = session?.user?.id;

  if (!userId) redirect("/sign-in?callbackUrl=/payment-method");

  const user = await getUserById(userId);
  const address = (user?.address ?? {}) as { shippingMethod?: string };

  return (
    <div className="wrapper">
      <CheckoutSteps current={2} />

      <PaymentMethodForm
        preferredPaymentMethod={user?.paymentMethod}
        shippingMethod={address.shippingMethod ?? "home"}
      />
    </div>
  );
}
