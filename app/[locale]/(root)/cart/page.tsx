import CartTable from "./cart-table";
import { getMyCart } from "@/lib/actions/cart.actions";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("Metadata");
  return { title: t("shoppingCart") };
}

export default async function CartPage() {
  const cart = await getMyCart();

  return (
    <div className="wrapper">
      <CartTable cart={cart} />
    </div>
  );
}
