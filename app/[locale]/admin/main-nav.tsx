"use client";

import { Link } from "@/i18n/navigation";
import { usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import React from "react";
import { useTranslations } from "next-intl";

export default function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();
  const t = useTranslations("AdminNav");

  const links = [
    {
      title: t("overview"),
      href: "/admin/overview",
    },
    {
      title: t("products"),
      href: "/admin/products",
    },
    {
      title: t("categories"),
      href: "/admin/categories",
    },
    {
      title: t("orders"),
      href: "/admin/orders",
    },
    {
      title: t("coupons"),
      href: "/admin/coupons",
    },
    {
      title: t("users"),
      href: "/admin/users",
    },
  ];

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
