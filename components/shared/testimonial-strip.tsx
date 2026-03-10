import { getTranslations } from "next-intl/server";
import { Star } from "lucide-react";

const testimonialKeys = [1, 2, 3] as const;

export default async function TestimonialStrip() {
  const t = await getTranslations("Testimonials");

  return (
    <section className="bg-muted/30 py-12 md:py-16">
      <div className="wrapper">
        <div className="text-center mb-8">
          <span className="text-label text-brand-accent block mb-1">
            {t("trustedByProfessionals")}
          </span>
          <h2 className="h2-bold">{t("whatCustomersSay")}</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {testimonialKeys.map((num) => (
            <div key={num} className="card-premium p-6 md:p-8">
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-brand-accent text-brand-accent"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-6">
                &ldquo;{t(`quote${num}`)}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-brand-accent/10 dark:bg-brand-accent/20 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-brand-accent">
                    {(t(`name${num}`) as string).charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-sm">{t(`name${num}`)}</p>
                  <p className="text-xs text-muted-foreground">
                    {t(`role${num}`)}
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
