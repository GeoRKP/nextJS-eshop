import { auth } from "@/auth";
import { getUserById } from "@/lib/actions/user.actions";
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
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("User not found");
  }

  const user = await getUserById(userId);

  return (
    <div className="wrapper">
      <CheckoutSteps current={2} />

      <PaymentMethodForm preferredPaymentMethod={user?.paymentMethod} />
    </div>
  );
}
