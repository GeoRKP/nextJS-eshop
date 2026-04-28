import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600",
  confirmed: "bg-blue-500/10 text-blue-600",
  processing: "bg-indigo-500/10 text-indigo-600",
  shipped: "bg-purple-500/10 text-purple-600",
  delivered: "bg-green-500/10 text-green-600",
  cancelled: "bg-red-500/10 text-red-600",
  refund_requested: "bg-orange-500/10 text-orange-600",
  refunded: "bg-muted text-muted-foreground",
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
        statusColors[status] || "bg-muted text-muted-foreground"
      )}
    >
      {label}
    </Badge>
  );
}
