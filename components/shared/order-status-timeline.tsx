import { OrderStatusHistory } from "@/types";
import { formatDateTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { getTranslations } from "next-intl/server";
import {
  Clock,
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  XCircle,
  RotateCcw,
  DollarSign,
} from "lucide-react";

const statusConfig: Record<
  string,
  {
    color: string;
    bgColor: string;
     
    icon: any;
  }
> = {
  pending: { color: "text-yellow-600", bgColor: "bg-yellow-500/10", icon: Clock },
  confirmed: {
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
    icon: CheckCircle2,
  },
  processing: {
    color: "text-indigo-600",
    bgColor: "bg-indigo-500/10",
    icon: Package,
  },
  shipped: { color: "text-purple-600", bgColor: "bg-purple-500/10", icon: Truck },
  delivered: {
    color: "text-green-600",
    bgColor: "bg-green-500/10",
    icon: MapPin,
  },
  cancelled: { color: "text-red-600", bgColor: "bg-red-500/10", icon: XCircle },
  refund_requested: {
    color: "text-orange-600",
    bgColor: "bg-orange-500/10",
    icon: RotateCcw,
  },
  refunded: {
    color: "text-muted-foreground",
    bgColor: "bg-muted",
    icon: DollarSign,
  },
};

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

export default async function OrderStatusTimeline({
  history,
}: {
  history: OrderStatusHistory[];
}) {
  const t = await getTranslations("Order");

  if (!history || history.length === 0) return null;

  return (
    <div className="card-premium p-5 space-y-4">
      <h3 className="font-semibold">{t("statusTimeline")}</h3>
      <div className="relative">
        {history.map((entry, index) => {
          const config = statusConfig[entry.status] || statusConfig.pending;
          const Icon = config.icon;
          const isLast = index === history.length - 1;

          return (
            <div key={entry.id} className="flex gap-4 pb-6 last:pb-0">
              {/* Timeline line */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    config.bgColor
                  )}
                >
                  <Icon className={cn("w-4 h-4", config.color)} />
                </div>
                {!isLast && (
                  <div className="w-0.5 flex-1 bg-border mt-1" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-2">
                <p className={cn("font-medium text-sm", config.color)}>
                  {t(statusTranslationKey[entry.status] || entry.status)}
                </p>
                {entry.note && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {entry.note}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDateTime(entry.createdAt).dateTime}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
