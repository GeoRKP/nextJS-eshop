import { getMyCart } from "@/lib/actions/cart.actions";
import { getAuthSession } from "@/lib/auth-session";
import { getUserById } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import { ShippingAddress } from "@/types";
import CheckoutSteps from "@/components/shared/checkout-steps";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import PlaceOrderForm from "./place-order-form";
import { PAYMENT_METHODS } from "@/lib/constants";
import { getTranslations } from "next-intl/server";
import { MapPin, CreditCard, Pencil, Lock, Shield } from "lucide-react";

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
  const tCart = await getTranslations("Cart");

  const [cart, session] = await Promise.all([getMyCart(), getAuthSession()]);
  const userid = session?.user?.id;

  if (!userid) redirect("/sign-in?callbackUrl=/place-order");

  const user = await getUserById(userid);

  if (!cart || cart.items.length === 0) redirect("/cart");

  if (!user.address) redirect("/shipping-address");
  // Redirect saved payment methods that are no longer offered (e.g. old PayPal/Stripe).
  if (!user.paymentMethod || !PAYMENT_METHODS.includes(user.paymentMethod))
    redirect("/payment-method");

  const userAddress = user.address as ShippingAddress;

  return (
    <div className="wrapper">
      <CheckoutSteps current={3} />
      <h1 className="h2-bold mb-6">{t("reviewOrder")}</h1>
      <div className="grid lg:grid-cols-3 gap-4 md:gap-8">
        {/* Left: Details */}
        <div className="lg:col-span-2 space-y-4">
          {/* Shipping Address Card */}
          <div className="card-premium p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-accent" />
                <h2 className="font-semibold">{t("shippingAddress")}</h2>
              </div>
              <Link
                href="/shipping-address"
                className="flex items-center gap-1 text-xs text-brand-accent hover:text-brand-accent-dark transition-colors"
              >
                <Pencil className="w-3 h-3" />
                {tCommon("edit")}
              </Link>
            </div>
            <div className="text-sm text-muted-foreground space-y-0.5 pl-6">
              <p className="font-medium text-foreground">{userAddress.fullName}</p>
              <p>{userAddress.address}</p>
              <p>{userAddress.city}, {userAddress.postalCode}</p>
              <p>{userAddress.country}</p>
            </div>
          </div>

          {/* Payment Method Card */}
          <div className="card-premium p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-brand-accent" />
                <h2 className="font-semibold">{t("paymentMethod")}</h2>
              </div>
              <Link
                href="/payment-method"
                className="flex items-center gap-1 text-xs text-brand-accent hover:text-brand-accent-dark transition-colors"
              >
                <Pencil className="w-3 h-3" />
                {tCommon("edit")}
              </Link>
            </div>
            <p className="text-sm text-muted-foreground pl-6">{user.paymentMethod}</p>
          </div>

          {/* Order Items Card */}
          <div className="card-premium p-5">
            <h2 className="font-semibold mb-4">{tOrder("orderItems")}</h2>
            <div className="space-y-3">
              {cart.items.map((item) => (
                <div key={item.slug} className="flex items-center gap-4">
                  <Link href={`/product/${item.slug}`} className="flex-shrink-0">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden bg-muted/30">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={96}
                        height={96}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/product/${item.slug}`}>
                      <p className="text-sm font-medium line-clamp-1 hover:text-brand-accent transition-colors">{item.name}</p>
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {tOrder("quantity")}: {item.qty} &times; {formatCurrency(item.price)}
                    </p>
                  </div>
                  <p className="font-semibold text-sm">{formatCurrency(Number(item.price) * item.qty)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="card-premium p-6 space-y-4">
            <h2 className="font-bold text-lg">{tOrder("orderSummary")}</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{tOrder("items")}</span>
                <span>{formatCurrency(cart.itemsPrice)}</span>
              </div>
              {Number(cart.discountAmount) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>{tOrder("discount")}</span>
                  <span>-{formatCurrency(cart.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">{tOrder("tax")}</span>
                <span>{formatCurrency(cart.taxPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{tOrder("shipping")}</span>
                <span>{formatCurrency(cart.shippingPrice)}</span>
              </div>
            </div>

            <div className="divider-gradient" />

            <div className="flex justify-between items-baseline">
              <span className="font-semibold">{tOrder("total")}</span>
              <span className="text-2xl font-black">{formatCurrency(cart.totalPrice)}</span>
            </div>

            <PlaceOrderForm />

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-4 pt-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Lock className="w-4 h-4" />
                <span>{tCart("secureCheckout")}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Shield className="w-4 h-4" />
                <span>{tCart("buyerProtection")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
