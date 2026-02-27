import { getMyCart } from "@/lib/actions/cart.actions";
import { auth } from "@/auth";
import { getUserById } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import { ShippingAddress } from "@/types";
import CheckoutSteps from "@/components/shared/checkout-steps";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@/components/ui/table";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import PlaceOrderForm from "./place-order-form";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("Metadata");
  return {
    title: t("placeOrder"),
  };
}

export default async function PlaceOrderPage() {
  const t = await getTranslations("Checkout");
  const tOrder = await getTranslations("Order");
  const tCommon = await getTranslations("Common");

  const cart = await getMyCart();
  const session = await auth();
  const userid = session?.user?.id;

  if (!userid) throw new Error("User not found");

  const user = await getUserById(userid);

  if (!cart || cart.items.length === 0) redirect("/cart");

  if (!user.address) redirect("/shipping-address");
  if (!user.paymentMethod) redirect("/payment-method");

  const userAddress = user.address as ShippingAddress;

  return (
    <div className="wrapper">
      <CheckoutSteps current={3} />
      <h1 className="text-2xl py-4">{t("placeOrder")}</h1>
      <div className="grid  md:grid-cols-3 md:gap-5">
        <div className="md:col-span-2 overflow-x-auto space-y-4">
          <Card>
            <CardContent className="p-4 gap-4">
              <h2 className="text-lg pb-4">{t("shippingAddress")}</h2>
              <p>{userAddress.fullName}</p>
              <p>
                {userAddress.address}, {userAddress.city}{" "}
              </p>
              <p>
                {userAddress.postalCode}, {userAddress.country}{" "}
              </p>
              <div className="mt-3">
                <Link href="/shipping-address">
                  <Button variant="outline">{tCommon("edit")}</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 gap-4">
              <h2 className="text-lg pb-4">{t("paymentMethod")}</h2>
              <p>{user.paymentMethod}</p>
              <div className="mt-3">
                <Link href="/payment-method">
                  <Button variant="outline">{tCommon("edit")}</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 gap-4">
              <h2 className="text-lg pb-4">{tOrder("orderItems")}</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{tOrder("item")}</TableHead>
                    <TableHead>{tOrder("quantity")}</TableHead>
                    <TableHead>{tOrder("price")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cart.items.map((item) => (
                    <TableRow key={item.slug}>
                      <TableCell>
                        <Link
                          href={`/products/${item.slug}`}
                          className="flex items-center"
                        >
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={50}
                            height={50}
                          />
                          <span className="px-2">{item.name}</span>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className="px-2">{item.qty}</span>
                      </TableCell>
                      <TableCell className="text-right ">
                        ${item.price}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <div >
          <Card>
            <CardContent className="p-4 gap-4 space-y-4">
              <div className="flex justify-between">
                <div>{tOrder("items")}</div>
                <div>{formatCurrency(cart.itemsPrice)}</div>
              </div>
              <div className="flex justify-between">
                <div>{tOrder("tax")}</div>
                <div>{formatCurrency(cart.taxPrice)}</div>
              </div>
              <div className="flex justify-between">
                <div>{tOrder("shipping")}</div>
                <div>{formatCurrency(cart.shippingPrice)}</div>
              </div>
              <div className="flex justify-between">
                <div>{tOrder("total")}</div>
                <div>{formatCurrency(cart.totalPrice)}</div>
              </div>
              <PlaceOrderForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
