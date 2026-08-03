// Maps the canonical Order.status values to their keys in the "Order"
// translation namespace. Shared so the admin list, the dashboard table and the
// status chart all label an order the same way.
export const ORDER_STATUS_TRANSLATION_KEY: Record<string, string> = {
  pending: "statusPending",
  confirmed: "statusConfirmed",
  processing: "statusProcessing",
  shipped: "statusShipped",
  delivered: "statusDelivered",
  cancelled: "statusCancelled",
  refund_requested: "statusRefundRequested",
  refunded: "statusRefunded",
};
