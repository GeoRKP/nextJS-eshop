import { getTranslations } from "next-intl/server";
import { Star } from "lucide-react";

const testimonialKeys = [1, 2, 3] as const;

export default async function TestimonialStrip() {
  const t = await getTranslations("Testimonials");

  return (
    <section className="bg-muted/40 py-14 md:py-20 border-y border-border">
      <div className="wrapper">
        <div className="text-center mb-10">
          <span className="text-stamp text-accent block mb-2 hazard-mark">
            {t("trustedByProfessionals")}
          </span>
          <h2 className="h2-bold">{t("whatCustomersSay")}</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-px bg-border">
          {testimonialKeys.map((num, i) => (
            <div key={num} className="bg-card p-6 md:p-8 relative">
              {/* Top corner stamp number */}
              <span className="absolute top-4 right-4 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
                FIELD REPORT 0{i + 1}
              </span>

              {/* Stars */}
              <div className="flex gap-0.5 mb-5">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star
                    key={idx}
                    className="h-4 w-4 fill-accent text-accent"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm md:text-base text-foreground/80 leading-relaxed mb-6">
                &ldquo;{t(`quote${num}`)}&rdquo;
              </p>

              {/* Divider */}
              <div className="border-t border-dashed border-border mb-4" />

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-foreground border border-accent/40 flex items-center justify-center shrink-0">
                  <span className="font-mono text-sm font-bold text-accent">
                    {(t(`name${num}`) as string).charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-heading font-bold text-sm uppercase tracking-[0.04em]">{t(`name${num}`)}</p>
                  <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.12em] mt-0.5">
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
