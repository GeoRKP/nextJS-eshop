import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { HelpCircle, Package, BadgeCheck } from "lucide-react";
import ModeToggle from "./mode-toggle";
import LanguageSwitcher from "./language-switcher";

export default async function UtilityBar() {
  const t = await getTranslations("UtilityBar");

  return (
    <div className="hidden md:flex items-center justify-between h-8 bg-foreground text-background text-[11px] tracking-wide">
      <div className="wrapper flex items-center justify-between !py-0 h-full">
        <div className="flex items-center gap-4">
          <Link
            href="/search"
            className="flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity"
          >
            <HelpCircle className="h-3 w-3" />
            {t("helpCenter")}
          </Link>
          <span className="opacity-30">|</span>
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
          <span className="opacity-30">|</span>
          <LanguageSwitcher />
          <span className="opacity-30">|</span>
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
