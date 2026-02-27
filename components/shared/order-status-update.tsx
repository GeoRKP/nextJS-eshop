"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { updateOrderStatus } from "@/lib/actions/order.actions";
import { ORDER_STATUSES } from "@/lib/validators";

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

export default function OrderStatusUpdate({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const { toast } = useToast();
  const t = useTranslations("Order");
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState(currentStatus);
  const [note, setNote] = useState("");

  const handleUpdate = () => {
    startTransition(async () => {
      const res = await updateOrderStatus({
        orderId,
        status,
        note: note || null,
      });
      toast({
        description: res.message,
        variant: res.success ? "default" : "destructive",
      });
      if (res.success) {
        setNote("");
      }
    });
  };

  return (
    <div className="space-y-3">
      <h3 className="font-semibold">{t("updateStatus")}</h3>
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ORDER_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {t(statusTranslationKey[s] || s)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        placeholder={t("enterStatusNote")}
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <Button
        onClick={handleUpdate}
        disabled={isPending || status === currentStatus}
        className="w-full"
      >
        {isPending ? "..." : t("updateStatus")}
      </Button>
    </div>
  );
}
