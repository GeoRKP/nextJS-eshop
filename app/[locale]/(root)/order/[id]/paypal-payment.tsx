"use client";

import {
  PayPalButtons,
  PayPalScriptProvider,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";
import {
  createPaypalOrder,
  approvePaypalOrder,
} from "@/lib/actions/order.actions";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";

function PrintLoadingState() {
  const [{ isPending, isRejected }] = usePayPalScriptReducer();
  const t = useTranslations("Order");

  let status = "";

  if (isPending) {
    status = t("loadingPaypal");
  } else if (isRejected) {
    status = t("errorLoadingPaypal");
  }

  return status;
}

export default function PayPalPayment({
  paypalClientId,
  orderId,
}: {
  paypalClientId: string;
  orderId: string;
}) {
  const { toast } = useToast();
  const { theme, systemTheme } = useTheme();
  const resolvedTheme = theme === "system" ? systemTheme : theme;

  const handleCreatePaypalOrder = async () => {
    const res = await createPaypalOrder(orderId);

    if (!res.success) {
      toast({
        description: res.message,
        variant: "destructive",
      });
    }

    return res.data;
  };

  const handleApprovePaypalOrder = async (data: { orderID: string }) => {
    const res = await approvePaypalOrder(orderId, data);

    toast({
      variant: res.success ? "default" : "destructive",
      description: res.message,
    });
  };

  return (
    <PayPalScriptProvider
      options={{
        clientId: paypalClientId,
      }}
    >
      <PrintLoadingState />
      <PayPalButtons
        createOrder={handleCreatePaypalOrder}
        onApprove={handleApprovePaypalOrder}
        style={{
          color: resolvedTheme === "dark" ? "black" : "gold",
          layout: "vertical",
        }}
      />
    </PayPalScriptProvider>
  );
}
