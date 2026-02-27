"use client";

import { Order } from "@/types";
import { formatCurrency, formatDateTime, formatId } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import {
  PayPalButtons,
  PayPalScriptProvider,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";
import {
  createPaypalOrder,
  approvePaypalOrder,
  updateOrderToPaidCOD,
  deliverOrder,
} from "@/lib/actions/order.actions";
import { useToast } from "@/hooks/use-toast";
import { useTransition } from "react";
import StripePayment from "./stripe-payment";
import { useTranslations } from "next-intl";
import OrderStatusBadge from "@/components/shared/order-status-badge";

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

  const { toast } = useToast();
  const t = useTranslations("Order");
  const tCheckout = useTranslations("Checkout");
  const tCommon = useTranslations("Common");

  const PrintLoadingState = () => {
    const [{ isPending, isRejected }] = usePayPalScriptReducer();

    let status = "";

    if (isPending) {
      status = t("loadingPaypal");
    } else if (isRejected) {
      status = t("errorLoadingPaypal");
    }

    return status;
  };

  const handleCreatePaypalOrder = async () => {
    const res = await createPaypalOrder(order.id);

    if (!res.success) {
      toast({
        description: res.message,
        variant: "destructive",
      });
    }

    return res.data;
  };

  const handleApprovePaypalOrder = async (data: { orderID: string }) => {
    const res = await approvePaypalOrder(order.id, data);

    toast({
      variant: res.success ? "default" : "destructive",
      description: res.message,
    });
  };

  // Button to mark order as paid
  const MarkAsPaidButton = () => {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    return (
      <Button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(async () => {
          const res = await updateOrderToPaidCOD(order.id);
          toast({
            variant: res.success ? "default" : "destructive",
            description: res.message,
          });
        })}
      >
        {isPending ? tCommon("processing") : t("markAsPaid")}
      </Button>
    );
  };

  // Button to mark order as delivered
  const MarkAsDeliveredButton = () => {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    return (
      <Button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(async () => {
          const res = await deliverOrder(order.id);
          toast({
            variant: res.success ? "default" : "destructive",
            description: res.message,
          });
        })}
      >
        {isPending ? tCommon("processing") : t("markAsDelivered")}
      </Button>
    );
  };

  return (
    <>
      <div className="py-4 flex items-center gap-3">
        <h1 className="text-2xl">{t("orderDetails", { id: formatId(id) })}</h1>
        {status && (
          <OrderStatusBadge
            status={status}
            label={t(statusTranslationKey[status] as Parameters<typeof t>[0]) || status}
          />
        )}
      </div>
      <div className="grid  md:grid-cols-3 md:gap-5">
        <div className="col-span-2 space-y-4 overflow-x-auto">
          <Card>
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl pb-4">{tCheckout("paymentMethod")}</h2>
              <p className="mb-2">{paymentMethod}</p>
              {isPaid ? (
                <Badge variant="secondary">
                  {t("paidAt", { date: formatDateTime(paidAt!).dateTime })}
                </Badge>
              ) : (
                <Badge variant="destructive">{t("notPaid")}</Badge>
              )}
            </CardContent>
          </Card>
          <Card className="my-2">
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl pb-4">{tCheckout("shippingAddress")}</h2>
              <p>{shippingAddress.fullName}</p>
              <p className="mb-2">
                {shippingAddress.address}, {shippingAddress.city}
                {shippingAddress.postalCode}, {shippingAddress.country}
              </p>
              {isDelivered ? (
                <Badge variant="secondary">
                  {t("deliveredAt", { date: formatDateTime(deliveredAt!).dateTime })}
                </Badge>
              ) : (
                <Badge variant="destructive">{t("notDelivered")}</Badge>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl pb-4">{t("orderItems")}</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("item")}</TableHead>
                    <TableHead>{t("quantity")}</TableHead>
                    <TableHead>{t("price")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderitems.map((item) => (
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
        <div>
          <Card>
            <CardContent className="p-4 gap-4 space-y-4">
              <div className="flex justify-between">
                <div>{t("items")}</div>
                <div>{formatCurrency(itemsPrice)}</div>
              </div>
              <div className="flex justify-between">
                <div>{t("tax")}</div>
                <div>{formatCurrency(taxPrice)}</div>
              </div>
              <div className="flex justify-between">
                <div>{t("shipping")}</div>
                <div>{formatCurrency(shippingPrice)}</div>
              </div>
              {Number(discountAmount) > 0 && (
                <div className="flex justify-between text-green-600">
                  <div>
                    {t("discount")}
                    {couponCode && (
                      <span className="text-xs ml-1 font-mono">({couponCode})</span>
                    )}
                  </div>
                  <div>-{formatCurrency(discountAmount)}</div>
                </div>
              )}
              <div className="flex justify-between">
                <div>{t("total")}</div>
                <div>{formatCurrency(totalPrice)}</div>
              </div>
              {!isPaid && paymentMethod === "Paypal" && (
                <div>
                  <PayPalScriptProvider
                    options={{
                      clientId: paypalClientId,
                    }}
                  >
                    <PrintLoadingState />
                    <PayPalButtons
                      createOrder={handleCreatePaypalOrder}
                      onApprove={handleApprovePaypalOrder}
                    />
                  </PayPalScriptProvider>
                </div>
              )}
              {!isPaid && paymentMethod === "Stripe" && stripeClientSecret && (
                <StripePayment
                  priceInCents={Number(order.totalPrice) * 100}
                  orderId={id}
                  clientSecret={stripeClientSecret}
                />
              )}
              {/* COD */}
              {isAdmin && !isPaid && paymentMethod === "CashOnDelivery" && (
                <MarkAsPaidButton />
              )}
              {isAdmin && isPaid && !isDelivered && (
                <MarkAsDeliveredButton />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
