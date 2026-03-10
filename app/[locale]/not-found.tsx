"use client";
import { APP_NAME } from "@/lib/constants";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function NotFoundPage() {
  const t = useTranslations("NotFound");
  const tCommon = useTranslations("Common");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Image
        src="/images/logo.png"
        width={48}
        height={48}
        alt={`${APP_NAME} logo`}
        priority={true}
      />
      <div className="p-6 w-1/3 rounded-lg  shadow-md text-center">
        <h1 className="text-3xl font-bold mb-4">{t("title")}</h1>
        <p>{t("description")}</p>
        <Button
          variant="outline"
          className="mt-4 ml-2"
          asChild
        >
          <Link href="/">{tCommon("backToHome")}</Link>
        </Button>
      </div>
    </div>
  );
}
