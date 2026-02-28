"use client";

import {Review} from "@/types";
import { Link } from "@/i18n/navigation";
import {useEffect, useState} from "react";
import ReviewForm from "./review-form";

import {getReviews} from "@/lib/actions/review-actions";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Calendar, User} from "lucide-react";
import {formatDateTime} from "@/lib/utils";
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
      const res = await getReviews({productId});
      setReviews(res.data);
    };

    loadReviews();
  }, [productId]);

  //  Reload when updated or created
  const reload = async () => {
    const res = await getReviews({productId});
    setReviews([...res.data]);
  };

  // Calculate rating distribution
  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
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
        <div className="text-sm text-muted-foreground p-4 rounded-xl bg-muted/50 border border-border/50">
          {t.rich("signInToReview", {
            signInLink: (chunks) => (
              <Link
                className="text-brand-orange font-medium hover:underline"
                href={`/sign-in?callbackUrl=/product/${productSlug}`}
              >
                {chunks}
              </Link>
            ),
          })}
        </div>
      )}

      {/* Rating summary bar */}
      {totalReviews > 0 && (
        <div className="flex flex-col sm:flex-row gap-8 p-6 rounded-2xl bg-muted/30 border border-border/50">
          {/* Average rating */}
          <div className="flex flex-col items-center justify-center gap-1 min-w-[120px]">
            <span className="text-4xl font-black">{avgRating.toFixed(1)}</span>
            <Rating value={avgRating} />
            <span className="text-xs text-muted-foreground mt-1">
              {t("numReviews", { count: totalReviews })}
            </span>
          </div>

          {/* Distribution bars */}
          <div className="flex-1 space-y-2">
            {ratingCounts.map(({ star, count }) => (
              <div key={star} className="flex items-center gap-3">
                <span className="text-xs font-medium w-4 text-right">{star}</span>
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-yellow-400 transition-all duration-500"
                    style={{ width: totalReviews > 0 ? `${(count / totalReviews) * 100}%` : "0%" }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-6">{count}</span>
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
          <Card key={review.id} className="border-border/50 rounded-xl shadow-none">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-base">{review.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Rating value={review.rating} />
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {formatDateTime(review.createdAt).dateTime}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm leading-relaxed mb-3">
                {review.description}
              </CardDescription>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                  <User className="w-3 h-3" />
                </div>
                <span className="font-medium">
                  {review.user ? review.user.name : tCommon("deletedUser")}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
