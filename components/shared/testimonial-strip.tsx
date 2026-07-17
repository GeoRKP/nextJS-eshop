import { getLocale, getTranslations } from "next-intl/server";
import { Star } from "lucide-react";
import { getTopReviews } from "@/lib/actions/review-actions";
import { localizedName } from "@/lib/i18n-helpers";

const testimonialKeys = [1, 2, 3] as const;

type TestimonialCard = {
  quote: string;
  name: string;
  role: string;
  // null = editorial fallback quote, no star row (avoids fake ratings)
  stars: number | null;
};

export default async function TestimonialStrip() {
  const [t, locale, reviews] = await Promise.all([
    getTranslations("Testimonials"),
    getLocale(),
    getTopReviews(3),
  ]);

  // Prefer real customer reviews; fall back to the editorial quotes
  // (without star rows) until enough real reviews exist.
  const cards: TestimonialCard[] =
    reviews.length >= 3
      ? reviews.map((review) => ({
          quote: review.description ?? review.title,
          name: review.user.name,
          role: localizedName(review.product, locale),
          stars: review.rating,
        }))
      : testimonialKeys.map((num) => ({
          quote: t(`quote${num}`),
          name: t(`name${num}`),
          role: t(`role${num}`),
          stars: null,
        }));

  return (
    <section className="bg-muted/40 py-14 md:py-20 border-y border-border">
      <div className="wrapper">
        <div className="mb-10 pb-4 border-b border-foreground/15">
          <span className="text-stamp text-accent block mb-2 hazard-mark">
            {t("trustedByProfessionals")}
          </span>
          <h2 className="h2-bold">{t("whatCustomersSay")}</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-px bg-border">
          {cards.map((card, i) => (
            <div key={i} className="bg-card p-6 md:p-8 relative">
              {/* Top corner stamp number */}
              <span className="absolute top-4 right-4 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
                {t("fieldReport")} 0{i + 1}
              </span>

              {/* Stars — only for real reviews */}
              {card.stars !== null && (
                <div className="flex gap-0.5 mb-5">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      className={`h-4 w-4 ${
                        idx < card.stars!
                          ? "fill-accent text-accent"
                          : "text-border"
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Quote */}
              <p className={`text-sm md:text-base text-foreground/80 leading-relaxed mb-6 ${card.stars === null ? "mt-8" : ""}`}>
                &ldquo;{card.quote}&rdquo;
              </p>

              {/* Divider */}
              <div className="border-t border-dashed border-border mb-4" />

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-foreground border border-accent/40 flex items-center justify-center shrink-0">
                  <span className="font-mono text-sm font-bold text-accent">
                    {card.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-heading font-bold text-sm uppercase tracking-[0.04em]">{card.name}</p>
                  <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.12em] mt-0.5">
                    {card.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
