import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { Phone, HelpCircle, Package, BadgeCheck } from "lucide-react";
import ModeToggle from "./mode-toggle";
import LanguageSwitcher from "./language-switcher";

export default async function UtilityBar() {
  const t = await getTranslations("UtilityBar");

  return (
    <div className="hidden md:flex items-center justify-between h-7 bg-primary text-primary-foreground text-[11px] font-heading tracking-wide">
      <div className="wrapper flex items-center justify-between !py-0 h-full">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-bold text-brand-accent">
            <Phone className="h-3 w-3" />
            {t("phoneNumber")}
          </span>
          <span className="w-1 h-1 rounded-full bg-primary-foreground/30" />
          <Link
            href="/search"
            className="flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity"
          >
            <HelpCircle className="h-3 w-3" />
            {t("helpCenter")}
          </Link>
          <span className="w-1 h-1 rounded-full bg-primary-foreground/30" />
          <Link
            href="/user/orders"
            className="flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity"
          >
            <Package className="h-3 w-3" />
            {t("orderTracking")}
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <ModeToggle />
          <span className="w-1 h-1 rounded-full bg-primary-foreground/30" />
          <LanguageSwitcher />
          <span className="w-1 h-1 rounded-full bg-primary-foreground/30" />
          <Link
            href="/sign-in"
            className="flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity"
          >
            <BadgeCheck className="h-3 w-3" />
            {t("proAccount")}
          </Link>
        </div>
      </div>
    </div>
  );
}
