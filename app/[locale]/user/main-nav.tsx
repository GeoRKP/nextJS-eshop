"use client";

import { Link } from "@/i18n/navigation";
import { usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import React from "react";
import { useTranslations } from "next-intl";
import { User, Package, Heart, MapPin } from "lucide-react";

const navIcons = {
  "/user/profile": User,
  "/user/orders": Package,
  "/user/wishlist": Heart,
  "/user/addresses": MapPin,
};

export default function MainNav({
  className,
  variant = "horizontal",
  ...props
}: React.HTMLAttributes<HTMLElement> & { variant?: "horizontal" | "sidebar" | "mobile" }) {
  const pathname = usePathname();
  const t = useTranslations("UserNav");

  const links = [
    { title: t("profile"), href: "/user/profile" },
    { title: t("orders"), href: "/user/orders" },
    { title: t("wishlist"), href: "/user/wishlist" },
    { title: t("addresses"), href: "/user/addresses" },
  ];

  if (variant === "sidebar") {
    return (
      <nav className="space-y-1" {...props}>
        {links.map((link) => {
          const Icon = navIcons[link.href as keyof typeof navIcons] || User;
          const isActive = pathname.includes(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200",
                isActive
                  ? "bg-brand-orange/10 text-brand-orange font-semibold border-l-2 border-brand-orange"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon className="w-4 h-4" />
              {link.title}
            </Link>
          );
        })}
      </nav>
    );
  }

  if (variant === "mobile") {
    return (
      <nav className="flex gap-1 overflow-x-auto scrollbar-hide" {...props}>
        {links.map((link) => {
          const Icon = navIcons[link.href as keyof typeof navIcons] || User;
          const isActive = pathname.includes(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-xs whitespace-nowrap transition-all",
                isActive
                  ? "bg-brand-orange/10 text-brand-orange font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {link.title}
            </Link>
          );
        })}
      </nav>
    );
  }

  // Default horizontal
  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname.includes(link.href) ? "" : "text-muted-foreground"
          )}
        >
          {link.title}
        </Link>
      ))}
    </nav>
  );
}
