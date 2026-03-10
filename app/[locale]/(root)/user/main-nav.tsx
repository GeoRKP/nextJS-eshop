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

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  if (variant === "sidebar") {
    return (
      <nav className="space-y-1" {...props}>
        {links.map((link) => {
          const Icon = navIcons[link.href as keyof typeof navIcons] || User;
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
                active
                  ? "bg-brand-accent text-accent-foreground font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <div className={cn(
                "h-8 w-8 rounded-lg flex items-center justify-center",
                active ? "bg-accent-foreground/20" : "bg-brand-accent/10"
              )}>
                <Icon className={cn("w-4 h-4", active ? "text-accent-foreground" : "text-brand-accent")} />
              </div>
              {link.title}
            </Link>
          );
        })}
      </nav>
    );
  }

  if (variant === "mobile") {
    return (
      <nav className="flex gap-2 overflow-x-auto scrollbar-hide" {...props}>
        {links.map((link) => {
          const Icon = navIcons[link.href as keyof typeof navIcons] || User;
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2.5 text-sm whitespace-nowrap transition-all rounded-full",
                active
                  ? "bg-accent text-accent-foreground font-bold"
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
            isActive(link.href) ? "" : "text-muted-foreground"
          )}
        >
          {link.title}
        </Link>
      ))}
    </nav>
  );
}
