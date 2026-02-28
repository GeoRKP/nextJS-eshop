"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { useTranslations } from "next-intl";

export default function NewsletterForm({ variant }: { variant?: "footer" | "default" }) {
  const t = useTranslations("Footer");

  if (variant === "footer") {
    return (
      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex"
      >
        <Input
          type="email"
          placeholder={t("emailPlaceholder")}
          className="flex-1 rounded-r-none border-white/20 bg-white/10 text-primary-foreground placeholder:text-primary-foreground/40 focus-visible:ring-brand-orange"
        />
        <Button
          type="submit"
          className="rounded-l-none bg-brand-orange hover:bg-brand-orange-dark text-white"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    );
  }

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
