"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from "lucide-react";
import { routing } from "@/i18n/routing";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("LanguageSwitcher");

  const handleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <Select value={locale} onValueChange={handleChange}>
      <SelectTrigger className="w-auto gap-1 border-none shadow-none">
        <Globe className="h-4 w-4" />
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
