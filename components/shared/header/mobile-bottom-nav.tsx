"use client";

import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Home, Grid3X3, Search, ShoppingCart, User } from "lucide-react";
import { useState } from "react";
import MobileSearch from "./mobile-search";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const t = useTranslations("MobileNav");
  const [searchOpen, setSearchOpen] = useState(false);

  const tabs = [
    {
      key: "home",
      href: "/",
      icon: Home,
      label: t("home"),
      isActive: pathname === "/",
    },
    {
      key: "categories",
      href: "/search",
      icon: Grid3X3,
      label: t("categories"),
      isActive: pathname.startsWith("/search"),
    },
    {
      key: "search",
      href: "#",
      icon: Search,
      label: t("search"),
      isActive: false,
      action: () => setSearchOpen(true),
      isCenter: true,
    },
    {
      key: "cart",
      href: "/cart",
      icon: ShoppingCart,
      label: t("cart"),
      isActive: pathname === "/cart",
    },
    {
      key: "account",
      href: "/user/profile",
      icon: User,
      label: t("account"),
      isActive: pathname.startsWith("/user"),
    },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card/95 backdrop-blur-xl safe-area-bottom">
        <div className="divider-gradient" />
        <div className="grid grid-cols-5 h-[68px]">
          {tabs.map((tab) => {
            const Icon = tab.icon;

            // Center search button - raised circular with ring + glow
            if (tab.action && "isCenter" in tab && tab.isCenter) {
              return (
                <button
                  key={tab.key}
                  onClick={tab.action}
                  className="flex flex-col items-center justify-center"
                >
                  <div className="bg-brand-accent text-white rounded-full h-14 w-14 flex items-center justify-center -mt-5 ring-4 ring-background shadow-card-glow hover:bg-brand-accent-dark transition-colors">
                    <Icon className="h-[22px] w-[22px]" />
                  </div>
                </button>
              );
            }

            if (tab.action) {
              return (
                <button
                  key={tab.key}
                  onClick={tab.action}
                  className="flex flex-col items-center justify-center gap-0.5 text-muted-foreground"
                >
                  <Icon className="h-[22px] w-[22px]" />
                  <span className="text-xs font-heading">{tab.label}</span>
                </button>
              );
            }

            return (
              <Link
                key={tab.key}
                href={tab.href}
                className={`flex flex-col items-center justify-center gap-0.5 transition-colors relative ${
                  tab.isActive
                    ? "text-brand-accent"
                    : "text-muted-foreground"
                }`}
              >
                {/* Active indicator dot bar */}
                {tab.isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 h-1 w-5 bg-brand-accent rounded-full" />
                )}
                <Icon className="h-[22px] w-[22px]" />
                <span className="text-xs font-heading font-medium">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile search overlay */}
      {searchOpen && <MobileSearch onClose={() => setSearchOpen(false)} />}
    </>
  );
}
