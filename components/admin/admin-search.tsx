"use client";

import { usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useTranslations } from "next-intl";

export default function AdminSearch() {
  const t = useTranslations("Common");
  const pathname = usePathname();

  const formActionUrl = pathname.includes("/admin/orders")
    ? "/admin/orders/"
    : pathname.includes("/admin/users")
    ? "/admin/users/"
    : "/admin/products/";

  const searchParams = useSearchParams();
  const [queryValue, setQueryValue] = useState(searchParams.get("query") || "");

  useEffect(() => {
    setQueryValue(searchParams.get("query") || "");
  }, [searchParams]);


  return (
    <form action={formActionUrl} method="GET">
      <Input
        type="search"
        name="query"
        placeholder={t("searchPlaceholder")}
        value={queryValue}
        onChange={(e) => setQueryValue(e.target.value)}
        className="md:w-[100px] lg:w-[300px]"
      />
      <Button type="submit" className="sr-only">
        {t("search")}
      </Button>
    </form>
  );
}
