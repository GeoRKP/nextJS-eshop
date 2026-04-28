"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { useTranslations } from "next-intl";

export default function NewsletterForm({ variant }: { variant?: "footer" | "footer-cta" | "default" }) {
  const t = useTranslations("Footer");

  if (variant === "footer-cta") {
    return (
      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex flex-col sm:flex-row gap-px"
      >
        <Input
          type="email"
          placeholder={t("emailPlaceholder")}
          className="flex-1 h-12 rounded-none border-2 border-background/25 bg-background/5 text-background placeholder:text-background/55 focus-visible:ring-0 focus-visible:border-accent text-sm font-mono"
        />
        <Button
          type="submit"
          className="h-12 rounded-none bg-accent hover:bg-background text-accent-foreground hover:text-foreground px-6 font-heading font-bold uppercase tracking-[0.16em] btn-stamp transition-colors"
        >
          <Send className="h-4 w-4 mr-2" />
          {t("subscribe")}
        </Button>
      </form>
    );
  }

  if (variant === "footer") {
    return (
      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex"
      >
        <Input
          type="email"
          placeholder={t("emailPlaceholder")}
          className="flex-1 rounded-none border-2 border-background/25 bg-background/5 text-background placeholder:text-background/55 focus-visible:ring-0 focus-visible:border-accent font-mono"
        />
        <Button
          type="submit"
          className="rounded-none bg-accent hover:bg-background text-accent-foreground hover:text-foreground btn-stamp transition-colors"
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
