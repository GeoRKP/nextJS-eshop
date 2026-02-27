"use client";

import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { Button } from "../ui/button";
import { formUrlQuery } from "@/lib/utils";
import { useTranslations } from "next-intl";

type PaginationProps = {
  page: number | string;
  totalPages: number;
  urlParamName?: string;
};

export default function Pagination({
  page,
  totalPages,
  urlParamName,
}: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("Common");

  const handleClick = (btnType: string) => {
    const pageValue = btnType === "prev" ? Number(page) - 1 : Number(page) + 1;
    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: urlParamName || "page",
      value: pageValue.toString(),
    });
    router.push(newUrl);
  };

  return (
    <div className="flex gap-2">
      <Button
        size="lg"
        variant="outline"
        className="w-28"
        disabled={Number(page) === 1}
        onClick={() => handleClick('prev')}
      >
        {t("previous")}
      </Button>
      <Button
        size="lg"
        variant="outline"
        className="w-28"
        disabled={Number(page) >= totalPages}
        onClick={() => handleClick("next")}
      >
        {t("next")}
      </Button>
    </div>
  );
}
