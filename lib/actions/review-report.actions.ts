"use server";

import { prisma } from "@/db/prisma";
import { revalidatePath } from "next/cache";
import { assertAdmin } from "@/lib/auth-guard";
import { formatError, toPlainObject } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";
import { getTranslations } from "next-intl/server";
import { logAuditEvent } from "@/lib/audit-log";
import { PAGE_SIZE } from "@/lib/constants";

export async function reportReview(data: {
  reviewId: string;
  reason: string;
  description?: string;
  reporterEmail: string;
}) {
  const t = await getTranslations("Actions");
  try {
    // Rate-limit per email to prevent spam reports
    const rl = rateLimit({
      key: `review-report:${data.reporterEmail}`,
      limit: 5,
      windowMs: 60 * 60_000,
    });
    if (!rl.success) {
      return { success: false, message: t("tooManyRequests") };
    }

    if (!data.reviewId || !data.reason || !data.reporterEmail) {
      return { success: false, message: t("allFieldsRequired") };
    }

    const review = await prisma.review.findUnique({
      where: { id: data.reviewId },
    });
    if (!review) return { success: false, message: t("reviewNotFound") };

    await prisma.reviewReport.create({
      data: {
        reviewId: data.reviewId,
        reason: data.reason.slice(0, 200),
        description: data.description?.slice(0, 2000) || null,
        reporterEmail: data.reporterEmail,
      },
    });

    return { success: true, message: t("reviewReported") };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function getReviewReports({
  page = 1,
  limit = PAGE_SIZE,
  status = "pending",
}: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  await assertAdmin();
  const where = status === "all" ? {} : { status };

  const [data, total] = await Promise.all([
    prisma.reviewReport.findMany({
      where,
      include: {
        review: {
          include: {
            user: { select: { name: true, email: true } },
            product: { select: { name: true, slug: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: (page - 1) * limit,
    }),
    prisma.reviewReport.count({ where }),
  ]);

  return { data: toPlainObject(data), totalPages: Math.ceil(total / limit) };
}

export async function resolveReviewReport(
  reportId: string,
  action: "dismiss" | "hide-review"
) {
  try {
    await assertAdmin();
    const report = await prisma.reviewReport.findUnique({
      where: { id: reportId },
    });
    if (!report) return { success: false, message: "Report not found" };

    await prisma.$transaction(async (tx) => {
      await tx.reviewReport.update({
        where: { id: reportId },
        data: { status: action === "hide-review" ? "resolved" : "dismissed" },
      });

      if (action === "hide-review") {
        await tx.review.update({
          where: { id: report.reviewId },
          data: { isHidden: true },
        });
      }
    });

    await logAuditEvent({
      action: `review-report.${action}`,
      entity: "ReviewReport",
      entityId: reportId,
    });

    revalidatePath("/admin/review-reports");
    return { success: true, message: "Report resolved" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
