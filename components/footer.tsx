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
} from "lucide-react";
import NewsletterForm from "./shared/newsletter-form";
import { Link } from "@/i18n/navigation";

const Footer = async () => {
  const currentYear = new Date().getFullYear();
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
    <footer className="bg-primary text-primary-foreground">
      {/* Trust bar */}
      <div className="border-b border-white/10">
        <div className="wrapper py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: tv("freeShipping"), desc: tv("freeShippingDesc") },
              { icon: Shield, title: tv("securePayment"), desc: tv("securePaymentDesc") },
              { icon: RotateCcw, title: tv("easyReturns"), desc: tv("easyReturnsDesc") },
              { icon: Headphones, title: tv("support"), desc: tv("supportDesc") },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <item.icon className="h-5 w-5 text-brand-orange" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-xs text-primary-foreground/60">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="wrapper py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand column */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xl font-bold">{APP_NAME}</h3>
            <p className="text-sm text-primary-foreground/70 leading-relaxed max-w-sm">
              {t("description")}
            </p>
            <div className="flex gap-3 pt-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href="#"
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-orange hover:scale-110 transition-all duration-200"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Customer Service column */}
          <div className="space-y-4">
            <h3 className="text-label text-primary-foreground/80">
              {t("customerService")}
            </h3>
            <ul className="space-y-2.5">
              {["contactUs", "faq", "returns", "shippingInfo"].map((key) => (
                <li key={key}>
                  <a
                    href="#"
                    className="text-sm text-primary-foreground/60 hover:text-white transition-colors"
                  >
                    {t(key as "contactUs" | "faq" | "returns" | "shippingInfo")}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* My Account column */}
          <div className="space-y-4">
            <h3 className="text-label text-primary-foreground/80">
              {t("myAccount")}
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/user/orders" className="text-sm text-primary-foreground/60 hover:text-white transition-colors">
                  {t("myOrders")}
                </Link>
              </li>
              <li>
                <Link href="/user/wishlist" className="text-sm text-primary-foreground/60 hover:text-white transition-colors">
                  {t("myWishlist")}
                </Link>
              </li>
              <li>
                <Link href="/user/profile" className="text-sm text-primary-foreground/60 hover:text-white transition-colors">
                  {t("myProfile")}
                </Link>
              </li>
              <li>
                <Link href="/user/addresses" className="text-sm text-primary-foreground/60 hover:text-white transition-colors">
                  {t("myAddresses")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter column */}
          <div className="space-y-4">
            <h3 className="text-label text-primary-foreground/80">
              {t("newsletter")}
            </h3>
            <p className="text-sm text-primary-foreground/60">
              {t("newsletterDesc")}
            </p>
            <NewsletterForm variant="footer" />
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="wrapper py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-primary-foreground/50">
            &copy; {currentYear} {APP_NAME}. {tc("allRightsReserved")}
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-primary-foreground/50">
              <CreditCard className="h-6 w-6" />
              <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-label="PayPal">
                <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c1.394 3.69-1.24 7.124-6.034 7.124h-2.19c-.524 0-.968.382-1.05.9L9.79 21.337H7.076l1.108-7.028c.08-.518.527-.9 1.05-.9h2.19c4.298 0 7.664-1.748 8.647-6.797.03-.149.054-.294.077-.437.064-.388.088-.747.074-1.078z" />
              </svg>
              <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-label="Stripe">
                <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-7.076-2.19l-.89 5.494C5.108 22.88 8.118 24 11.714 24c2.64 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" />
              </svg>
            </div>
            <span className="text-primary-foreground/30">|</span>
            <div className="flex items-center gap-3 text-xs text-primary-foreground/50">
              <a href="#" className="hover:text-white transition-colors">{t("privacyPolicy")}</a>
              <a href="#" className="hover:text-white transition-colors">{t("termsOfService")}</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
