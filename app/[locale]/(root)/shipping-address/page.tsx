import { getAuthSession } from "@/lib/auth-session";
import { getMyCart } from "@/lib/actions/cart.actions";
import { redirect } from "next/navigation";
import { ShippingAddress } from "@/types";
import { getUserById } from "@/lib/actions/user.actions";
import ShippingAddressForm from "./shipping-address-form";
import CheckoutSteps from "@/components/shared/checkout-steps";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("Metadata");
  return {
    title: t("shippingAddress"),
  };
}

export default async function ShippingAddressPage() {
  const cart = await getMyCart();

  if (!cart || cart.items.length === 0) {
    redirect("/cart");
  }

  const session = await getAuthSession();

  const userId = session?.user?.id;

  if (!userId) redirect("/sign-in?callbackUrl=/shipping-address");

  const user = await getUserById(userId);

  return (
    <div className="wrapper">
      <CheckoutSteps current={1} />
      <ShippingAddressForm address={user.address as ShippingAddress} />
    </div>
  );
}
