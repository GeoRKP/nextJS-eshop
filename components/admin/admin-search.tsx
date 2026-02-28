"use client";

import { usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";

export default function AdminSearch() {
  const t = useTranslations("Common");
  const pathname = usePathname();

  const formActionUrl = pathname.includes("/admin/orders")
    ? "/admin/orders/"
    : pathname.includes("/admin/users")
      ? "/admin/users/"
      : pathname.includes("/admin/categories")
        ? "/admin/categories/"
        : pathname.includes("/admin/coupons")
          ? "/admin/coupons/"
          : "/admin/products/";

  const searchParams = useSearchParams();
  const [queryValue, setQueryValue] = useState(
    searchParams.get("query") || ""
  );

  useEffect(() => {
    setQueryValue(searchParams.get("query") || "");
  }, [searchParams]);

  return (
    <form action={formActionUrl} method="GET">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          type="search"
          name="query"
          placeholder={t("searchPlaceholder")}
          value={queryValue}
          onChange={(e) => setQueryValue(e.target.value)}
          className="pl-9 md:w-[200px] lg:w-[300px]"
        />
      </div>
      <Button type="submit" className="sr-only">
        {t("search")}
      </Button>
    </form>
  );
}
