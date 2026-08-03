"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from "lucide-react";
import { routing } from "@/i18n/routing";

/**
 * Switching language must not throw away the query string — doing so dropped
 * the visitor's active filters, sort order and page on /search.
 */
function useLocalizedHref() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  return query ? `${pathname}?${query}` : pathname;
}

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const href = useLocalizedHref();
  const t = useTranslations("LanguageSwitcher");

  const handleChange = (newLocale: string) => {
    router.replace(href, { locale: newLocale });
  };

  return (
    <Select value={locale} onValueChange={handleChange}>
      <SelectTrigger className="w-auto gap-1 border-none shadow-none bg-transparent text-inherit h-auto py-1 px-2 text-xs">
        <Globe className="h-3.5 w-3.5" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {routing.locales.map((loc) => (
          <SelectItem key={loc} value={loc}>
            {t(loc)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** Compact toggle for mobile headers — switches between the 2 locales on tap */
export function LanguageToggle({ className }: { className?: string }) {
  const locale = useLocale();
  const router = useRouter();
  const href = useLocalizedHref();
  const tCommon = useTranslations("Common");

  const nextLocale = locale === "el" ? "en" : "el";
  const flag = locale === "el" ? "🇬🇷" : "🇬🇧";

  return (
    <button
      onClick={() => router.replace(href, { locale: nextLocale })}
      className={className ?? "h-9 w-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background/60 transition-all"}
      aria-label={tCommon("switchTo", { locale: nextLocale })}
    >
      <span className="text-base">{flag}</span>
    </button>
  );
}
