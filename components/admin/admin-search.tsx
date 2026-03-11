"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export default function AdminSearch() {

  const pathname = usePathname();

  const formActionUrl = pathname.includes("/admin/orders")
    ? "/admin/orders/"
    : pathname.includes("/admin/users")
    ? "/admin/users/"
    : "/admin/products/";

  const searchParams = useSearchParams();

  return (
    <form action={formActionUrl} method="GET">
      <Input
        type="search"
        name="query"
        placeholder="Search..."
        defaultValue={searchParams.get("query") || ""}
        key={searchParams.get("query") || ""}
        className="md:w-[100px] lg:w-[300px]"
      />
      <Button type="submit" className="sr-only">
        Search
      </Button>
    </form>
  );
}

