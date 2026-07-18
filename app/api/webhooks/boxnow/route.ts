import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import crypto from "crypto";

// Constant-time secret comparison to avoid leaking the secret via timing.
function secretsMatch(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

/**
 * Box Now parcel status webhook.
 *
 * NOTE: Box Now's webhook/callback support is not fully documented publicly — confirm the
 * exact payload shape and registration during onboarding. This handler is defensive: it
 * tolerates several field names and maps the event back to an order via the orderNumber
 * (which we set to our internal order id) or the delivery referenceNumber.
 *
 * If webhooks turn out to be unavailable, poll lib/boxnow.ts `listParcels` instead.
 *
 * Optional shared-secret check: set BOXNOW_WEBHOOK_SECRET and have Box Now send it as the
 * `x-boxnow-secret` header (or a `secret` body field).
 */

const DELIVERED_STATUSES = new Set([
  "delivered",
  "completed",
  "picked-up",
  "picked_up",
  "collected",
]);

type BoxNowWebhookBody = {
  secret?: string;
  orderNumber?: string;
  referenceNumber?: string;
  parcelId?: string;
  status?: string;
  // Some integrations nest under data/event
  data?: Record<string, unknown>;
  event?: Record<string, unknown>;
};

function str(v: unknown): string | undefined {
  return v === undefined || v === null ? undefined : String(v);
}

export async function POST(req: NextRequest) {
  let payload: BoxNowWebhookBody;
  try {
    payload = (await req.json()) as BoxNowWebhookBody;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  // Fail closed: without a configured secret anyone could mark orders delivered.
  // (Status can still be tracked via the listParcels polling fallback.)
  const secret = process.env.BOXNOW_WEBHOOK_SECRET;
  if (!secret) {
    console.error("Box Now webhook rejected: BOXNOW_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "webhook not configured" }, { status: 503 });
  }
  const provided = req.headers.get("x-boxnow-secret") || payload.secret || "";
  if (!secretsMatch(provided, secret)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  // Flatten possible nesting.
  const node = { ...payload, ...(payload.data || {}), ...(payload.event || {}) };
  const orderNumber = str(node.orderNumber) || str(node.referenceNumber);
  const status = str(node.status);

  if (!orderNumber) {
    // Nothing to map — ack so Box Now doesn't retry forever.
    return NextResponse.json({ ok: true, skipped: "no orderNumber" });
  }

  // We set orderNumber == our internal order id when creating the delivery request.
  const order = await prisma.order.findFirst({
    where: {
      OR: [{ id: orderNumber }, { boxnowReferenceNumber: orderNumber }],
    },
    select: { id: true, isDelivered: true, status: true },
  });

  if (!order) {
    return NextResponse.json({ ok: true, skipped: "order not found" });
  }

  const isDelivered = status
    ? DELIVERED_STATUSES.has(status.toLowerCase())
    : false;

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: {
        boxnowStatus: status || undefined,
        ...(isDelivered && !order.isDelivered
          ? { isDelivered: true, deliveredAt: new Date() }
          : {}),
      },
    });
    if (status) {
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: order.status,
          note: `Box Now: ${status}`,
        },
      });
    }
  });

  return NextResponse.json({ ok: true });
}
