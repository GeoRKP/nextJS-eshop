import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  confirmed: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  processing: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  shipped: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  delivered: "bg-green-500/10 text-green-600 dark:text-green-400",
  cancelled: "bg-red-500/10 text-red-600 dark:text-red-400",
  refund_requested: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  refunded: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
};

export default function OrderStatusBadge({
  status,
  label,
}: {
  status: string;
  label: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium border-0",
        statusColors[status] || "bg-gray-500/10 text-gray-600 dark:text-gray-400"
      )}
    >
      {label}
    </Badge>
  );
}
