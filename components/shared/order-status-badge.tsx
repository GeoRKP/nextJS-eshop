import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  confirmed: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  processing: "bg-indigo-100 text-indigo-800 hover:bg-indigo-200",
  shipped: "bg-purple-100 text-purple-800 hover:bg-purple-200",
  delivered: "bg-green-100 text-green-800 hover:bg-green-200",
  cancelled: "bg-red-100 text-red-800 hover:bg-red-200",
  refund_requested: "bg-orange-100 text-orange-800 hover:bg-orange-200",
  refunded: "bg-gray-100 text-gray-800 hover:bg-gray-200",
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
        statusColors[status] || "bg-gray-100 text-gray-800"
      )}
    >
      {label}
    </Badge>
  );
}
