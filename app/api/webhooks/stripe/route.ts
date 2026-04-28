import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { updateOrderToPaid } from "@/lib/actions/order.actions";
import { prisma } from "@/db/prisma";

export async function POST(req: NextRequest) {
  const event = await Stripe.webhooks.constructEventAsync(
    await req.text(),
    req.headers.get("stripe-signature") as string,
    process.env.STRIPE_WEBHOOK_SECRET!
  );

  if (event.type === "charge.succeeded") {
    const { object } = event.data;
    const orderId = object.metadata.orderId;

    if (!orderId) {
      return NextResponse.json(
        { error: "missing orderId metadata" },
        { status: 400 }
      );
    }

    // CRITICAL: verify the captured amount matches the order total.
    // Prevents fraud where attacker creates a $1 PaymentIntent with metadata pointing to a $1000 order.
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { totalPrice: true, isPaid: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: "order not found" },
        { status: 404 }
      );
    }

    if (order.isPaid) {
      // Idempotent: webhook retry after success — return OK so Stripe stops retrying
      return NextResponse.json({ message: "order already paid" });
    }

    const expectedCents = Math.round(Number(order.totalPrice) * 100);
    // Allow 1 cent tolerance for rounding differences
    if (object.amount + 1 < expectedCents) {
      return NextResponse.json(
        {
          error: "amount mismatch",
          expected: expectedCents,
          received: object.amount,
        },
        { status: 400 }
      );
    }

    await updateOrderToPaid({
      orderId,
      paymentResult: {
        id: object.id,
        status: "COMPLETED",
        email_address: object.billing_details.email!,
        pricePaid: (object.amount / 100).toFixed(),
      },
    });

    return NextResponse.json({
      message: "updateOrderToPaid was successful",
    });
  }

  return NextResponse.json({
    message: "event is not charge.succeeded",
  });
}

