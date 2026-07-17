import { getTranslations } from "next-intl/server";
import NewsletterForm from "./newsletter-form";

export default async function HomepageNewsletter() {
  const t = await getTranslations("Newsletter");

  return (
    <section className="wrapper">
      <div className="relative bg-foreground overflow-hidden border border-foreground">
        {/* Industrial stripe + blueprint overlay */}
        <div className="absolute inset-0 industrial-stripe pointer-events-none" />
        <div className="absolute inset-0 bg-blueprint-grid opacity-[0.04] pointer-events-none" />

        {/* Yellow accent bars + corner brackets */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-accent" />
        <div className="absolute top-4 left-4 h-5 w-5 border-t-2 border-l-2 border-accent" />
        <div className="absolute top-4 right-4 h-5 w-5 border-t-2 border-r-2 border-accent" />
        <div className="absolute bottom-4 left-4 h-5 w-5 border-b-2 border-l-2 border-accent" />
        <div className="absolute bottom-4 right-4 h-5 w-5 border-b-2 border-r-2 border-accent" />

        <div className="relative py-14 md:py-20 px-6 md:px-12 flex flex-col items-start text-left">
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-accent mb-4 inline-flex items-center gap-2">
            <span className="h-px w-8 bg-accent" />
            ▲ {t("stayUpdated")}
          </span>
          <h2 className="h2-display text-background mb-4 max-w-2xl">
            {t("newsletterTitle")}
          </h2>
          <p className="text-background/65 text-sm md:text-base max-w-lg mb-8 leading-relaxed">
            {t("newsletterSubtitle")}
          </p>
          <div className="w-full max-w-md">
            <NewsletterForm variant="footer-cta" />
          </div>
        </div>
      </div>
    </section>
  );
}
