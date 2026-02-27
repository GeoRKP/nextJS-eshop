import { APP_NAME } from "@/lib/constants";
import { getTranslations } from "next-intl/server";
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  CreditCard,
  Wallet,
} from "lucide-react";
import NewsletterForm from "./shared/newsletter-form";

const Footer = async () => {
  const currentYear = new Date().getFullYear();
  const t = await getTranslations("Footer");
  const tc = await getTranslations("Common");

  return (
    <footer className="bg-card border-t">
      <div className="wrapper py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand column */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">{APP_NAME}</h3>
            <p className="text-sm text-muted-foreground">{t("description")}</p>
            <div>
              <p className="text-sm font-semibold mb-2">{t("followUs")}</p>
              <div className="flex gap-3">
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="Youtube"
                >
                  <Youtube className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Customer Service column */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide">
              {t("customerService")}
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  {t("contactUs")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  {t("faq")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  {t("returns")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  {t("shippingInfo")}
                </a>
              </li>
            </ul>
          </div>

          {/* Company column */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide">
              {t("company")}
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  {t("aboutUs")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  {t("careers")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  {t("blog")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  {t("press")}
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter column */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide">
              {t("newsletter")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("newsletterDesc")}
            </p>
            <NewsletterForm />
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t">
        <div className="wrapper py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} {APP_NAME}. {tc("allRightsReserved")}
          </p>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="text-xs">{t("paymentMethods")}:</span>
            <CreditCard className="h-5 w-5" />
            <Wallet className="h-5 w-5" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
