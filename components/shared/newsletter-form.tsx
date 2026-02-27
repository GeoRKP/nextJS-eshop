"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { useTranslations } from "next-intl";

export default function NewsletterForm() {
  const t = useTranslations("Footer");

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="flex gap-2"
    >
      <Input
        type="email"
        placeholder={t("emailPlaceholder")}
        className="flex-1"
      />
      <Button type="submit" size="icon" variant="default">
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}
