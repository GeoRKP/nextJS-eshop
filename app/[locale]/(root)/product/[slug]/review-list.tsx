"use client";

import { Review } from "@/types";
import { Link } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import ReviewForm from "./review-form";

import { getReviews } from "@/lib/actions/review-actions";
import { Calendar, Star } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import Rating from "@/components/shared/product/rating";
import { useTranslations } from "next-intl";

export default function ReviewList({
  userId,
  productId,
  productSlug,
}: {
  userId: string;
  productId: string;
  productSlug: string;
}) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const t = useTranslations("Product");
  const tCommon = useTranslations("Common");

  useEffect(() => {
    const loadReviews = async () => {
      const res = await getReviews({ productId });
      setReviews(res.data);
    };

    loadReviews();
  }, [productId]);

  //  Reload when updated or created
  const reload = async () => {
    const res = await getReviews({ productId });
    setReviews([...res.data]);
  };

  // Calculate rating distribution
  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));
  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

  return (
    <div className="space-y-6">
      {/* Review form or sign-in prompt */}
      {userId ? (
        <ReviewForm
          userId={userId}
          productId={productId}
          onReviewSubmitted={reload}
        />
      ) : (
        <div className="text-sm text-muted-foreground p-4 rounded-lg bg-muted/50 border border-border/50">
          {t.rich("signInToReview", {
            signInLink: (chunks) => (
              <Link
                className="text-brand-accent font-medium hover:underline"
                href={`/sign-in?callbackUrl=/product/${productSlug}`}
              >
                {chunks}
              </Link>
            ),
          })}
        </div>
      )}

      {/* Rating summary */}
      {totalReviews > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-8 p-6 bg-card rounded-lg border border-border/50 shadow-card-subtle">
          {/* Average rating */}
          <div className="flex flex-col items-center justify-center gap-1">
            <span className="text-4xl sm:text-5xl font-black">{avgRating.toFixed(1)}</span>
            <Rating value={avgRating} />
            <span className="text-xs text-muted-foreground mt-1">
              {t("numReviews", { count: totalReviews })}
            </span>
          </div>

          {/* Distribution bars */}
          <div className="flex-1 space-y-2">
            {ratingCounts.map(({ star, count }) => (
              <div key={star} className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1 text-xs font-medium w-8">
                  {star}
                  <Star className="h-3 w-3 fill-brand-accent text-brand-accent" />
                </span>
                <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-brand-accent transition-all duration-500"
                    style={{
                      width:
                        totalReviews > 0
                          ? `${(count / totalReviews) * 100}%`
                          : "0%",
                    }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-6 tabular-nums">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review list */}
      {reviews.length === 0 && (
        <p className="text-sm text-muted-foreground">{t("noReviews")}</p>
      )}
      <div className="flex flex-col gap-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="border border-border/50 rounded-lg p-5 hover:border-border transition-colors"
          >
            {/* Top: stars + date */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <Rating value={review.rating} />
                <h4 className="font-semibold text-sm mt-2">{review.title}</h4>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                <Calendar className="w-3 h-3" />
                {formatDateTime(review.createdAt).dateTime}
              </div>
            </div>

            {/* Body */}
            <p className="text-sm text-muted-foreground leading-relaxed mt-3 break-words">
              {review.description}
            </p>

            {/* Author */}
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/30">
              <div className="w-7 h-7 rounded-full bg-brand-accent/10 text-brand-accent flex items-center justify-center text-xs font-bold">
                {review.user
                  ? review.user.name.charAt(0).toUpperCase()
                  : "?"}
              </div>
              <span className="text-xs font-medium">
                {review.user ? review.user.name : tCommon("deletedUser")}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
