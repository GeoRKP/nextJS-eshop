import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { assertAdmin } from "@/lib/auth-guard";
import { getParcelLabelPdf } from "@/lib/boxnow";

export const dynamic = "force-dynamic";

/**
 * Admin-only: download the Box Now voucher/label PDF for an order.
 * GET /api/admin/boxnow/label/{orderId}
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    await assertAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderId } = await params;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { boxnowReferenceNumber: true, boxnowParcelIds: true },
  });

  const parcelId = order?.boxnowParcelIds?.[0];
  if (!order?.boxnowReferenceNumber || !parcelId) {
    return NextResponse.json(
      { error: "No Box Now voucher for this order" },
      { status: 404 }
    );
  }

  try {
    const pdf = await getParcelLabelPdf(parcelId);
    return new NextResponse(pdf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="boxnow-${orderId.slice(0, 8)}.pdf"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "label failed" },
      { status: 502 }
    );
  }
}
