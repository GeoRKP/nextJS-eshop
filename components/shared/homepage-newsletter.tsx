import { getTranslations } from "next-intl/server";
import NewsletterForm from "./newsletter-form";

export default async function HomepageNewsletter() {
  const t = await getTranslations("Newsletter");

  return (
    <section className="wrapper">
      <div className="relative rounded-xl bg-primary overflow-hidden">
        {/* Industrial stripe overlay */}
        <div className="absolute inset-0 industrial-stripe" />

        {/* Amber accent bars */}
        <div className="absolute top-0 left-0 w-20 h-1 bg-brand-accent" />
        <div className="absolute bottom-0 right-0 w-20 h-1 bg-brand-accent" />

        <div className="relative py-12 md:py-16 px-6 md:px-12 flex flex-col items-center text-center">
          <span className="text-label text-brand-accent mb-3">
            {t("stayUpdated")}
          </span>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black uppercase tracking-tight text-white mb-3">
            {t("newsletterTitle")}
          </h2>
          <p className="text-white/60 text-sm md:text-base max-w-lg mb-8">
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
