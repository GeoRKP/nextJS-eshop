"use client";

import { Order } from "@/types";
import { formatCurrency, formatDateTime, formatId } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
  updateOrderToPaidCOD,
  deliverOrder,
} from "@/lib/actions/order.actions";
import { createBoxNowDeliveryRequest } from "@/lib/actions/boxnow.actions";
import { useToast } from "@/hooks/use-toast";
import { useTransition } from "react";
import { useTranslations } from "next-intl";
import OrderStatusBadge from "@/components/shared/order-status-badge";
import { CreditCard, MapPin, Package, PackageOpen, FileDown } from "lucide-react";

const StripePayment = dynamic(() => import("./stripe-payment"), {
  ssr: false,
  loading: () => (
    <div className="space-y-3 animate-pulse">
      <div className="h-5 w-32 bg-muted/50 rounded" />
      <div className="h-12 bg-muted/50 rounded-lg" />
      <div className="h-12 bg-muted/50 rounded-lg" />
    </div>
  ),
});

const PayPalPayment = dynamic(() => import("./paypal-payment"), {
  ssr: false,
  loading: () => (
    <div className="space-y-3 animate-pulse">
      <div className="h-12 bg-muted/50 rounded-lg" />
    </div>
  ),
});

const VivaPayment = dynamic(() => import("./viva-payment"), {
  ssr: false,
  loading: () => (
    <div className="space-y-3 animate-pulse">
      <div className="h-12 bg-muted/50 rounded-lg" />
    </div>
  ),
});

const statusTranslationKey: Record<string, string> = {
  pending: "statusPending",
  confirmed: "statusConfirmed",
  processing: "statusProcessing",
  shipped: "statusShipped",
  delivered: "statusDelivered",
  cancelled: "statusCancelled",
  refund_requested: "statusRefundRequested",
  refunded: "statusRefunded",
};

function MarkAsPaidButton({ orderId }: { orderId: string }) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const tCommon = useTranslations("Common");
  const t = useTranslations("Order");

  return (
    <Button
      type="button"
      disabled={isPending}
      className="w-full h-12 rounded-lg bg-brand-accent hover:bg-brand-accent-dark text-accent-foreground font-semibold uppercase tracking-wide active:scale-[0.98] transition-all"
      onClick={() => startTransition(async () => {
        const res = await updateOrderToPaidCOD(orderId);
        toast({
          variant: res.success ? "default" : "destructive",
          description: res.message,
        });
      })}
    >
      {isPending ? tCommon("processing") : t("markAsPaid")}
    </Button>
  );
}

function MarkAsDeliveredButton({ orderId }: { orderId: string }) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const tCommon = useTranslations("Common");
  const t = useTranslations("Order");

  return (
    <Button
      type="button"
      disabled={isPending}
      className="w-full h-12 rounded-lg bg-brand-accent hover:bg-brand-accent-dark text-accent-foreground font-semibold uppercase tracking-wide active:scale-[0.98] transition-all"
      onClick={() => startTransition(async () => {
        const res = await deliverOrder(orderId);
        toast({
          variant: res.success ? "default" : "destructive",
          description: res.message,
        });
      })}
    >
      {isPending ? tCommon("processing") : t("markAsDelivered")}
    </Button>
  );
}

function BoxNowAdminControls({
  orderId,
  referenceNumber,
}: {
  orderId: string;
  referenceNumber?: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const t = useTranslations("Order");

  return (
    <div className="space-y-2">
      {referenceNumber ? (
        <a
          href={`/api/admin/boxnow/label/${orderId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full h-11 rounded-lg border border-brand-accent/40 text-sm font-medium hover:bg-brand-accent/5 transition-all"
        >
          <FileDown className="w-4 h-4" />
          {t("boxnowDownloadLabel")}
        </a>
      ) : (
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          className="w-full h-11"
          onClick={() =>
            startTransition(async () => {
              const res = await createBoxNowDeliveryRequest(orderId);
              toast({
                variant: res.success ? "default" : "destructive",
                description: res.success ? res.message : res.error,
              });
            })
          }
        >
          <PackageOpen className="w-4 h-4 mr-2" />
          {t("boxnowCreateVoucher")}
        </Button>
      )}
    </div>
  );
}

export default function OrderDetailsTable({
  order,
  paypalClientId,
  stripeClientSecret,
  isAdmin,
}: {
  order: Order;
  paypalClientId: string;
  stripeClientSecret: string | null;
  isAdmin: boolean;
}) {
  const {
    id,
    shippingAddress,
    shippingMethod,
    boxnowReferenceNumber,
    orderitems,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    paymentMethod,
    isDelivered,
    isPaid,
    paidAt,
    deliveredAt,
    status,
    couponCode,
    discountAmount,
  } = order;
  const isLocker = shippingMethod === "boxnow_locker";
  const locker = (order.boxnowLocker ?? null) as {
    name?: string;
    addressLine1?: string;
    postalCode?: string;
    city?: string;
  } | null;

  const t = useTranslations("Order");
  const tCheckout = useTranslations("Checkout");

  return (
    <>
      <div className="py-4 flex items-center gap-3">
        <h1 className="h2-bold">{t("orderDetails", { id: formatId(id) })}</h1>
        {status && (
          <OrderStatusBadge
            status={status}
            label={t(statusTranslationKey[status] as Parameters<typeof t>[0]) || status}
          />
        )}
      </div>
      <div className="grid lg:grid-cols-3 gap-4 md:gap-8">
        <div className="lg:col-span-2 space-y-4">
          {/* Payment Method */}
          <div className="card-premium p-5">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4 text-brand-accent" />
              <h2 className="font-semibold">{tCheckout("paymentMethod")}</h2>
            </div>
            <div className="pl-4 space-y-2">
              <p className="text-sm">{paymentMethod}</p>
              {isPaid ? (
                <Badge className="bg-brand-accent/10 text-brand-accent border-brand-accent/20">
                  {t("paidAt", { date: formatDateTime(paidAt!).dateTime })}
                </Badge>
              ) : (
                <Badge variant="destructive">{t("notPaid")}</Badge>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="card-premium p-5">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-brand-accent" />
              <h2 className="font-semibold">{tCheckout("shippingAddress")}</h2>
            </div>
            <div className="text-sm text-muted-foreground space-y-0.5 pl-4">
              {isLocker && (
                <Badge className="mb-1 bg-brand-accent/10 text-brand-accent border-brand-accent/20">
                  <PackageOpen className="w-3 h-3 mr-1" />
                  {tCheckout("shippingMethodLocker")}
                </Badge>
              )}
              <p className="font-medium text-foreground">{shippingAddress.fullName}</p>
              {isLocker && locker?.name && (
                <p className="font-medium text-foreground">{locker.name}</p>
              )}
              <p>{shippingAddress.address}</p>
              <p>
                {shippingAddress.city}, {shippingAddress.postalCode}
              </p>
              <p>{shippingAddress.country}</p>
              {shippingAddress.phone && <p>{shippingAddress.phone}</p>}
            </div>
            <div className="pl-4 mt-2">
              {isDelivered ? (
                <Badge className="bg-brand-accent/10 text-brand-accent border-brand-accent/20">
                  {t("deliveredAt", { date: formatDateTime(deliveredAt!).dateTime })}
                </Badge>
              ) : (
                <Badge variant="destructive">{t("notDelivered")}</Badge>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="card-premium p-5">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-4 h-4 text-brand-accent" />
              <h2 className="font-semibold">{t("orderItems")}</h2>
            </div>
            <div className="space-y-3">
              {orderitems.map((item) => (
                <div key={item.slug} className="flex items-center gap-4">
                  <Link href={`/product/${item.slug}`} className="flex-shrink-0">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden bg-muted/30">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                        sizes="(max-width: 768px) 64px, 80px"
                      />
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/product/${item.slug}`}>
                      <p className="text-sm font-medium line-clamp-1 hover:text-brand-accent transition-colors">
                        {item.name}
                      </p>
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {t("quantity")}: {item.qty} &times; {formatCurrency(item.price)}
                    </p>
                  </div>
                  <p className="font-semibold text-sm">
                    {formatCurrency(Number(item.price) * item.qty)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="card-premium p-6 space-y-4">
            <h2 className="font-bold text-lg">{t("orderSummary")}</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("items")}</span>
                <span>{formatCurrency(itemsPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("tax")}</span>
                <span>{formatCurrency(taxPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("shipping")}</span>
                <span>{formatCurrency(shippingPrice)}</span>
              </div>
              {Number(discountAmount) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>
                    {t("discount")}
                    {couponCode && (
                      <span className="text-xs ml-1 font-mono">({couponCode})</span>
                    )}
                  </span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}
            </div>

            <div className="divider-gradient" />

            <div className="flex justify-between items-baseline">
              <span className="font-semibold">{t("total")}</span>
              <span className="text-2xl font-black">{formatCurrency(totalPrice)}</span>
            </div>

            {/* Payment actions */}
            {/* Historical orders were stored as "PayPal"; the constant said "Paypal". */}
            {!isPaid && (paymentMethod === "Paypal" || paymentMethod === "PayPal") && (
              <PayPalPayment
                paypalClientId={paypalClientId}
                orderId={order.id}
              />
            )}
            {!isPaid && paymentMethod === "Stripe" && stripeClientSecret && (
              <StripePayment
                priceInCents={Number(order.totalPrice) * 100}
                orderId={id}
                clientSecret={stripeClientSecret}
              />
            )}
            {!isPaid && paymentMethod === "Viva" && (
              <VivaPayment orderId={id} totalPrice={Number(order.totalPrice)} />
            )}
            {/* COD */}
            {isAdmin && !isPaid && paymentMethod === "CashOnDelivery" && (
              <MarkAsPaidButton orderId={order.id} />
            )}
            {isAdmin && isPaid && !isDelivered && (
              <MarkAsDeliveredButton orderId={order.id} />
            )}
            {isAdmin && isLocker && (
              <BoxNowAdminControls
                orderId={order.id}
                referenceNumber={boxnowReferenceNumber}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
