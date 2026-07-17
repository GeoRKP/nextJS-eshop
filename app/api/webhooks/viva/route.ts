import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { verifyVivaTransaction } from "@/lib/actions/order.actions";

/**
 * Viva webhook endpoint.
 *
 * Two roles:
 *  1) GET — Viva performs a verification request once when you register the webhook URL
 *           in the self-care portal. We must respond with `{ "Key": "<verification-key>" }`,
 *           where the Key is the value the self-care portal showed when generating the webhook.
 *           Store that value in `VIVA_WEBHOOK_KEY`.
 *
 *  2) POST — Viva sends a JSON payload for each subscribed event. We handle:
 *            - EventTypeId 1796 (Transaction Payment Created)  — mark order paid
 *            - EventTypeId 1798 (Transaction Failed)           — log, no state change
 *            - EventTypeId 1797 (Transaction Reversal Created) — refund, log only
 *
 *  We treat the webhook as the *authoritative* path. The return-URL handler runs the same
 *  verification but the webhook is what guarantees order state even if the customer closes
 *  their browser mid-redirect.
 *
 *  Docs:
 *   - https://developer.viva.com/webhooks-for-payments/
 *   - https://developer.viva.com/webhooks-for-payments/transaction-payment-created/
 *   - https://developer.viva.com/webhooks-for-payments/transaction-failed/
 *   - https://developer.viva.com/webhooks-for-payments/transaction-reversal-created/
 */

const EVENT_PAYMENT_CREATED = 1796; // Transaction Payment Created (success, StatusId "F")
const EVENT_TRANSACTION_REVERSAL = 1797; // Transaction Reversal Created (refund)
const EVENT_TRANSACTION_FAILED = 1798; // Transaction Failed (StatusId "E")

/**
 * Optional source-IP allow-list. Viva payment webhooks are unsigned; the authoritative
 * protection is the server-side Retrieve Transaction re-validation below. If
 * VIVA_WEBHOOK_ALLOWED_IPS (comma-separated) is set, we additionally reject non-matching
 * source IPs. Left unset by default since Viva's IP ranges can change.
 */
function isAllowedSourceIp(req: NextRequest): boolean {
  const allowed = process.env.VIVA_WEBHOOK_ALLOWED_IPS;
  if (!allowed) return true; // not configured → don't block
  const fwd = req.headers.get("x-forwarded-for") || "";
  const clientIp = fwd.split(",")[0].trim();
  if (!clientIp) return true; // can't determine → don't block
  return allowed
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .some((ip) => clientIp === ip || clientIp.startsWith(ip));
}

/** Resolve our internal order id from webhook EventData (MerchantTrns preferred, OrderCode fallback). */
async function resolveOrderId(
  eventData: VivaWebhookBody["EventData"] | undefined
): Promise<string | null> {
  if (eventData?.MerchantTrns) return eventData.MerchantTrns;
  if (eventData?.OrderCode != null) {
    const order = await prisma.order.findFirst({
      where: {
        paymentResult: { path: ["id"], equals: String(eventData.OrderCode) },
      },
      select: { id: true },
    });
    return order?.id || null;
  }
  return null;
}

export async function GET() {
  const key = process.env.VIVA_WEBHOOK_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "VIVA_WEBHOOK_KEY is not set on the server" },
      { status: 500 }
    );
  }
  return NextResponse.json({ Key: key });
}

type VivaWebhookBody = {
  Url?: string;
  EventTypeId: number;
  Created?: string;
  CorrelationId?: string;
  MessageId?: string;
  MessageTypeId?: number;
  EventData: {
    OrderCode?: number | string;
    TransactionId?: string;
    StatusId?: string;
    Amount?: number;
    MerchantTrns?: string;
    CustomerTrns?: string;
    Email?: string;
    FullName?: string;
  };
};

export async function POST(req: NextRequest) {
  if (!isAllowedSourceIp(req)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let payload: VivaWebhookBody;
  try {
    payload = (await req.json()) as VivaWebhookBody;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  // We only act on Transaction Payment Created. Acknowledge all other events with 200 so Viva
  // doesn't retry; reversals additionally leave an admin-visible trace on the order.
  if (payload.EventTypeId !== EVENT_PAYMENT_CREATED) {
    if (payload.EventTypeId === EVENT_TRANSACTION_FAILED) {
      console.warn("Viva: transaction failed event", payload.EventData);
    } else if (payload.EventTypeId === EVENT_TRANSACTION_REVERSAL) {
      console.warn("Viva: transaction reversal (refund) event", payload.EventData);
      const refundOrderId = await resolveOrderId(payload.EventData);
      if (refundOrderId) {
        try {
          const order = await prisma.order.findUnique({
            where: { id: refundOrderId },
            select: { status: true },
          });
          if (order) {
            await prisma.orderStatusHistory.create({
              data: {
                orderId: refundOrderId,
                status: order.status,
                note: `Viva: reversal/refund received (amount: ${payload.EventData?.Amount ?? "?"}) — review required`,
              },
            });
          }
        } catch (e) {
          console.error("Viva webhook: failed to record reversal", e);
        }
      }
    }
    return NextResponse.json({ ok: true, ignored: payload.EventTypeId });
  }

  const { TransactionId, MerchantTrns, OrderCode } = payload.EventData || {};
  if (!TransactionId) {
    // Permanent condition — can never succeed on retry. Ack with 200 to stop Viva's 24× retries.
    return NextResponse.json({ ok: true, skipped: "missing TransactionId" });
  }

  // Resolve our internal order id. Prefer MerchantTrns (we set it to our orderId on order creation),
  // and fall back to OrderCode lookup if MerchantTrns is missing for any reason.
  let orderId: string | null = MerchantTrns || null;
  if (!orderId && OrderCode != null) {
    const orderCodeStr = String(OrderCode);
    const order = await prisma.order.findFirst({
      where: {
        paymentResult: {
          path: ["id"],
          equals: orderCodeStr,
        },
      },
      select: { id: true },
    });
    orderId = order?.id || null;
  }

  if (!orderId) {
    // Permanent condition (unknown order) — ack with 200 so Viva stops retrying.
    console.warn("Viva webhook: order not found", { TransactionId, OrderCode });
    return NextResponse.json({ ok: true, skipped: "order not found" });
  }

  try {
    const result = await verifyVivaTransaction({ orderId, transactionId: TransactionId });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    // Transient/not-yet-final → return non-2xx so Viva retries (e.g. transaction not yet
    // captured when the webhook races ahead of settlement).
    console.error("Viva webhook verification failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "verification failed" },
      { status: 400 }
    );
  }
}
