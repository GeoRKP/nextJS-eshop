import { getReviewReports } from "@/lib/actions/review-report.actions";
import { requireAdmin } from "@/lib/auth-guard";
import { getTranslations } from "next-intl/server";
import Pagination from "@/components/shared/pagination";
import ReviewReportActions from "./review-report-actions";

export async function generateMetadata() {
  return { title: "Review Reports" };
}

export default async function ReviewReportsPage(props: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  await requireAdmin();
  const sp = await props.searchParams;
  const page = Number(sp.page) || 1;
  const status = sp.status || "pending";

  const { data, totalPages } = await getReviewReports({ page, status });
  const t = await getTranslations("Admin");

  return (
    <div className="space-y-4">
      <div>
        <span className="text-stamp text-accent block mb-2 hazard-mark">
          ▲ ADMIN / REVIEW REPORTS
        </span>
        <h1 className="h2-bold">{t("reviewReportsTitle")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("reviewReportsDescription")}
        </p>
      </div>

      <div className="space-y-3">
        {data.length === 0 ? (
          <div className="text-center text-muted-foreground py-12 card-premium">
            {t("noReviewReports")}
          </div>
        ) : (
          data.map((r: {
            id: string;
            status: string;
            reason: string;
            description?: string | null;
            reporterEmail: string;
            createdAt: string | Date;
            review: {
              id: string;
              title: string;
              description?: string | null;
              rating: number;
              isHidden: boolean;
              user: { name: string; email: string };
              product: { name: string; slug: string };
            };
          }) => (
            <div key={r.id} className="card-premium p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <span className="font-mono text-[11px] text-accent uppercase tracking-wider">
                    ▲ Reason: {r.reason}
                  </span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Reported by {r.reporterEmail} ·{" "}
                    {new Date(r.createdAt).toLocaleString("el-GR")}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 ${
                    r.status === "pending"
                      ? "bg-warning/10 text-warning"
                      : r.status === "resolved"
                        ? "bg-success/10 text-success"
                        : "bg-muted/30 text-muted-foreground"
                  }`}
                >
                  {r.status}
                </span>
              </div>

              {r.description && (
                <p className="text-sm text-muted-foreground italic mb-3">
                  &ldquo;{r.description}&rdquo;
                </p>
              )}

              <div className="border-t border-dashed border-border pt-3 mt-3">
                <p className="text-xs text-muted-foreground mb-1">
                  Review on{" "}
                  <strong className="text-foreground">{r.review.product.name}</strong>{" "}
                  by {r.review.user.name}
                </p>
                <h4 className="font-bold text-sm mb-1">
                  {r.review.title}{" "}
                  <span className="text-accent">
                    {"★".repeat(r.review.rating)}
                  </span>
                  {r.review.isHidden && (
                    <span className="ml-2 text-xs text-destructive">[HIDDEN]</span>
                  )}
                </h4>
                {r.review.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {r.review.description}
                  </p>
                )}
              </div>

              {r.status === "pending" && (
                <ReviewReportActions reportId={r.id} />
              )}
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center pt-4">
          <Pagination page={page} totalPages={totalPages} />
        </div>
      )}
    </div>
  );
}
