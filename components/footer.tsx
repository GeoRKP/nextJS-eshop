import { APP_NAME } from "@/lib/constants";
import { getTranslations } from "next-intl/server";
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Truck,
  Shield,
  RotateCcw,
  Headphones,
  CreditCard,
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
  const tv = await getTranslations("ValueProps");

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

      {/* Tier 2: Trust Bar */}
      <div className="border-b border-background/10">
        <div className="wrapper py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-px bg-background/10">
            {[
              { icon: Truck, title: tv("freeShipping"), desc: tv("freeShippingDesc") },
              { icon: Shield, title: tv("securePayment"), desc: tv("securePaymentDesc") },
              { icon: RotateCcw, title: tv("easyReturns"), desc: tv("easyReturnsDesc") },
              { icon: Headphones, title: tv("support"), desc: tv("supportDesc") },
            ].map((item, i) => (
              <div key={item.title} className="flex items-center gap-3 bg-foreground p-4">
                <div className="flex-shrink-0 h-12 w-12 border border-accent/40 bg-foreground/40 flex items-center justify-center">
                  <item.icon className="h-5 w-5 text-accent stroke-[1.75]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-mono text-[10px] text-accent tracking-[0.12em]">
                      0{i + 1}
                    </span>
                    <p className="font-heading text-[13px] font-bold uppercase tracking-[0.06em]">{item.title}</p>
                  </div>
                  <p className="text-xs text-background/75">{item.desc}</p>
                </div>
              </div>
            ))}
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
              {["contactUs", "faq", "returns", "shippingInfo"].map((key) => (
                <li key={key}>
                  <a
                    href="#"
                    className="text-[13px] text-background/80 hover:text-accent transition-colors py-1 inline-block"
                  >
                    → {t(key as "contactUs" | "faq" | "returns" | "shippingInfo")}
                  </a>
                </li>
              ))}
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
            <div className="flex items-center gap-3 text-background/70">
              <CreditCard className="h-6 w-6 stroke-[1.5]" />
              <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-label="PayPal">
                <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c1.394 3.69-1.24 7.124-6.034 7.124h-2.19c-.524 0-.968.382-1.05.9L9.79 21.337H7.076l1.108-7.028c.08-.518.527-.9 1.05-.9h2.19c4.298 0 7.664-1.748 8.647-6.797.03-.149.054-.294.077-.437.064-.388.088-.747.074-1.078z" />
              </svg>
              <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-label="Stripe">
                <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-7.076-2.19l-.89 5.494C5.108 22.88 8.118 24 11.714 24c2.64 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" />
              </svg>
            </div>
            <span className="text-background/20">·</span>
            <div className="flex items-center gap-4 font-mono text-[11px] text-background/70 uppercase tracking-[0.05em]">
              <a href="#" className="hover:text-accent transition-colors">{t("privacyPolicy")}</a>
              <a href="#" className="hover:text-accent transition-colors">{t("termsOfService")}</a>
              <a href="#" className="hover:text-accent transition-colors">{t("cookies")}</a>
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
