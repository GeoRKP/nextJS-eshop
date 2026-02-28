"use client";

import { Link } from "@/i18n/navigation";
import { usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import React from "react";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Ticket,
  Users,
} from "lucide-react";

const navIcons = {
  "/admin/overview": LayoutDashboard,
  "/admin/products": Package,
  "/admin/categories": FolderTree,
  "/admin/orders": ShoppingCart,
  "/admin/coupons": Ticket,
  "/admin/users": Users,
};

export default function MainNav({
  className,
  variant = "sidebar",
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  variant?: "sidebar" | "mobile";
}) {
  const pathname = usePathname();
  const t = useTranslations("AdminNav");

  const links = [
    { title: t("overview"), href: "/admin/overview" },
    { title: t("products"), href: "/admin/products" },
    { title: t("categories"), href: "/admin/categories" },
    { title: t("orders"), href: "/admin/orders" },
    { title: t("coupons"), href: "/admin/coupons" },
    { title: t("users"), href: "/admin/users" },
  ];

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  if (variant === "sidebar") {
    return (
      <nav className={cn("space-y-1", className)} {...props}>
        {links.map((link) => {
          const Icon =
            navIcons[link.href as keyof typeof navIcons] || LayoutDashboard;
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
                active
                  ? "bg-brand-accent text-white font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <div
                className={cn(
                  "h-8 w-8 rounded-lg flex items-center justify-center",
                  active ? "bg-white/20" : "bg-brand-accent/10"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4",
                    active ? "text-white" : "text-brand-accent"
                  )}
                />
              </div>
              {link.title}
            </Link>
          );
        })}
      </nav>
    );
  }

  // Mobile pill tabs
  return (
    <nav
      className={cn("flex gap-2 overflow-x-auto scrollbar-hide", className)}
      {...props}
    >
      {links.map((link) => {
        const Icon =
          navIcons[link.href as keyof typeof navIcons] || LayoutDashboard;
        const active = isActive(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 text-xs whitespace-nowrap transition-all rounded-full",
              active
                ? "bg-accent text-accent-foreground font-bold"
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
