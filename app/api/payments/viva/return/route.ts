import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { verifyVivaTransaction } from "@/lib/actions/order.actions";
import { SERVER_URL } from "@/lib/constants";

/**
 * Smart Checkout return URL.
 *
 * Viva appends these query params on redirect back to the success URL configured on the Payment Source:
 *   - s   = orderCode
 *   - t   = transactionId (UUID)
 *   - eventId
 *   - eci
 *   - lang
 *
 * For the failure URL, Viva appends `s` (orderCode) and a state/eventId only.
 *
 * Configure your Payment Source in the Viva self-care portal with success/failure URLs:
 *   Success:  https://<your-domain>/api/payments/viva/return?status=success
 *   Failure:  https://<your-domain>/api/payments/viva/return?status=fail
 *
 * Docs: https://developer.viva.com/smart-checkout/smart-checkout-integration/
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const status = url.searchParams.get("status"); // we add this ourselves in the configured URL
  const orderCode = url.searchParams.get("s");
  const transactionId = url.searchParams.get("t");
  const lang = url.searchParams.get("lang") || "";

  // Locale prefix for redirect: el is "as-needed" (no prefix), en is "/en".
  const localePrefix = lang.toLowerCase().startsWith("en") ? "/en" : "";

  if (!orderCode) {
    return NextResponse.redirect(`${SERVER_URL}${localePrefix}/`);
  }

  // Find our order via the orderCode we stored in paymentResult.id when we created the Viva order.
  const order = await prisma.order.findFirst({
    where: {
      paymentResult: {
        path: ["id"],
        equals: orderCode,
      },
    },
    select: { id: true },
  });

  if (!order) {
    return NextResponse.redirect(`${SERVER_URL}${localePrefix}/`);
  }

  const redirectTo = `${SERVER_URL}${localePrefix}/order/${order.id}`;

  // On a failure return, skip verification and just send the user back to the order page.
  if (status === "fail" || !transactionId) {
    return NextResponse.redirect(redirectTo);
  }

  // Best-effort verification on the success return. The webhook is the authoritative path.
  // If anything fails here we still redirect to the order page — the user may see "Not Paid"
  // until the webhook arrives, which is the correct behavior.
  try {
    await verifyVivaTransaction({ orderId: order.id, transactionId });
  } catch (error) {
    console.error("Viva return-URL verification failed:", error);
  }

  return NextResponse.redirect(redirectTo);
}
