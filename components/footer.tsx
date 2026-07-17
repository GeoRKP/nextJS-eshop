import { APP_NAME } from "@/lib/constants";
import { getTranslations } from "next-intl/server";
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowUp,
} from "lucide-react";
import NewsletterForm from "./shared/newsletter-form";
import { Link } from "@/i18n/navigation";

const Footer = async () => {
  const currentYear = new Date().getFullYear();
  const buildDate = new Date().toISOString().slice(0, 10);
  const t = await getTranslations("Footer");
  const tc = await getTranslations("Common");

  const socialLinks = [
    { icon: Facebook, label: "Facebook" },
    { icon: Instagram, label: "Instagram" },
    { icon: Twitter, label: "Twitter" },
    { icon: Youtube, label: "Youtube" },
  ];

  return (
    <footer className="bg-foreground text-background relative">
      {/* Top yellow signal bar */}
      <div className="h-[3px] bg-accent" aria-hidden="true" />

      {/* Tier 1: Newsletter CTA Band — with scan-line decoration */}
      <div className="bg-foreground border-b border-background/10 relative">
        <div className="absolute inset-0 animate-scan-line opacity-50 pointer-events-none" aria-hidden="true" />
        <div className="wrapper py-12 md:py-14 relative">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-12">
            <div className="flex-1">
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-accent mb-3 inline-flex items-center gap-2">
                <span className="h-px w-8 bg-accent" />
                ▲ TRANSMISSION
              </span>
              <h3 className="font-heading font-extrabold text-2xl md:text-3xl uppercase tracking-tight text-background mb-2 leading-tight">
                {t("newsletterCTA")}
              </h3>
              <p className="text-sm text-background/80 max-w-md leading-relaxed">
                {t("newsletterDesc")}
              </p>
            </div>
            <div className="w-full md:w-auto md:min-w-[420px]">
              <NewsletterForm variant="footer-cta" />
            </div>
          </div>
        </div>
      </div>

      {/* Tier 3: Main Grid */}
      <div className="wrapper py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-10">
          {/* Brand column (2-col) */}
          <div className="lg:col-span-2 space-y-5">
            <h3 className="font-heading text-2xl font-extrabold uppercase tracking-[0.18em] flex items-baseline">
              <span className="text-accent text-lg mr-2">▲</span>
              {APP_NAME}
            </h3>
            <p className="text-sm text-background/80 leading-relaxed max-w-sm">
              {t("description")}
            </p>
            {/* Square bordered social tiles */}
            <div className="flex gap-2 pt-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href="#"
                  className="h-10 w-10 border border-background/20 flex items-center justify-center text-background/85 hover:bg-accent hover:text-accent-foreground hover:border-accent transition-all duration-200"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Categories column */}
          <div className="space-y-4">
            <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-accent border-b border-accent/30 pb-2">
              {t("categoriesTitle")}
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/search" className="text-[13px] text-background/80 hover:text-accent transition-colors py-1 inline-block">
                  → {t("allProducts")}
                </Link>
              </li>
              <li>
                <Link href="/search?sort=newest" className="text-[13px] text-background/80 hover:text-accent transition-colors py-1 inline-block">
                  → {t("newArrivals")}
                </Link>
              </li>
              <li>
                <Link href="/search?price=1-50" className="text-[13px] text-background/80 hover:text-accent transition-colors py-1 inline-block">
                  → {t("deals")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service column */}
          <div className="space-y-4">
            <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-accent border-b border-accent/30 pb-2">
              {t("customerService")}
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/returns"
                  className="text-[13px] text-background/80 hover:text-accent transition-colors py-1 inline-block"
                >
                  → {t("returns")}
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping"
                  className="text-[13px] text-background/80 hover:text-accent transition-colors py-1 inline-block"
                >
                  → {t("shippingInfo")}
                </Link>
              </li>
              <li>
                <a
                  href="mailto:info@avl.gr"
                  className="text-[13px] text-background/80 hover:text-accent transition-colors py-1 inline-block"
                >
                  → {t("contactUs")}
                </a>
              </li>
            </ul>
          </div>

          {/* My Account column */}
          <div className="space-y-4">
            <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-accent border-b border-accent/30 pb-2">
              {t("myAccount")}
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/user/orders" className="text-[13px] text-background/80 hover:text-accent transition-colors py-1 inline-block">
                  → {t("myOrders")}
                </Link>
              </li>
              <li>
                <Link href="/user/wishlist" className="text-[13px] text-background/80 hover:text-accent transition-colors py-1 inline-block">
                  → {t("myWishlist")}
                </Link>
              </li>
              <li>
                <Link href="/user/profile" className="text-[13px] text-background/80 hover:text-accent transition-colors py-1 inline-block">
                  → {t("myProfile")}
                </Link>
              </li>
              <li>
                <Link href="/user/addresses" className="text-[13px] text-background/80 hover:text-accent transition-colors py-1 inline-block">
                  → {t("myAddresses")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info column */}
          <div className="space-y-4">
            <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-accent border-b border-accent/30 pb-2">
              {t("contactTitle")}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-[13px] text-background/85">
                <Phone className="h-4 w-4 text-accent shrink-0 mt-0.5 stroke-[1.75]" />
                <span className="font-mono">+30 210 1234567</span>
              </li>
              <li className="flex items-start gap-2 text-[13px] text-background/85">
                <Mail className="h-4 w-4 text-accent shrink-0 mt-0.5 stroke-[1.75]" />
                <span className="font-mono">info@avl.gr</span>
              </li>
              <li className="flex items-start gap-2 text-[13px] text-background/85">
                <MapPin className="h-4 w-4 text-accent shrink-0 mt-0.5 stroke-[1.75]" />
                <span>Athens, Greece</span>
              </li>
              <li className="flex items-start gap-2 text-[13px] text-background/85">
                <Clock className="h-4 w-4 text-accent shrink-0 mt-0.5 stroke-[1.75]" />
                <span>{t("businessHours")}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Tier 4: Bottom Bar */}
      <div className="border-t border-background/10">
        <div className="wrapper py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-mono text-[11px] text-background/70 tracking-[0.05em]">
            &copy; {currentYear} {APP_NAME.toUpperCase()} · {tc("allRightsReserved")}
          </p>
          <div className="flex items-center gap-4 2xl:gap-6 flex-wrap justify-center">
            <div className="flex items-center gap-4 font-mono text-[11px] text-background/70 uppercase tracking-[0.05em]">
              <Link href="/privacy" className="hover:text-accent transition-colors">{t("privacyPolicy")}</Link>
              <Link href="/terms" className="hover:text-accent transition-colors">{t("termsOfService")}</Link>
              <Link href="/cookies" className="hover:text-accent transition-colors">{t("cookies")}</Link>
            </div>
            <span className="text-background/20">·</span>
            <a
              href="#"
              className="font-mono text-[11px] text-background/70 hover:text-accent transition-colors flex items-center gap-1 py-2 px-2 uppercase tracking-[0.1em]"
              aria-label={t("backToTop")}
            >
              <ArrowUp className="h-3.5 w-3.5" />
              {t("backToTop")}
            </a>
          </div>
        </div>
      </div>

      {/* Field-data line — signature touch */}
      <div className="border-t border-background/10 bg-foreground">
        <div className="wrapper py-2.5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center">
          <span className="font-mono text-[10px] text-background/55 tracking-[0.14em] uppercase">
            <span className="text-accent">▲</span> BUILD {buildDate.replace(/-/g, ".")}
          </span>
          <span className="text-background/15">·</span>
          <span className="font-mono text-[10px] text-background/55 tracking-[0.14em] uppercase">
            Γ.Ε.ΜΗ. 123456701000
          </span>
          <span className="text-background/15">·</span>
          <span className="font-mono text-[10px] text-background/55 tracking-[0.14em] uppercase">
            ATHENS HQ
          </span>
          <span className="text-background/15">·</span>
          <span className="font-mono text-[10px] text-background/55 tracking-[0.14em] uppercase">
            HEAVY DUTY DIVISION
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
