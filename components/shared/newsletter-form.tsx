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
        className="flex flex-col sm:flex-row"
      >
        <Input
          type="email"
          placeholder={t("emailPlaceholder")}
          className="flex-1 h-12 sm:rounded-r-none rounded-b-none sm:rounded-bl-md border-white/20 bg-white/10 text-primary-foreground placeholder:text-primary-foreground/40 focus-visible:ring-brand-accent text-sm"
        />
        <Button
          type="submit"
          className="h-12 sm:rounded-l-none rounded-t-none sm:rounded-tr-md bg-brand-accent hover:bg-brand-accent-dark text-white px-6 font-heading font-semibold uppercase tracking-wide"
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
          className="flex-1 rounded-r-none border-white/20 bg-white/10 text-primary-foreground placeholder:text-primary-foreground/40 focus-visible:ring-brand-accent"
        />
        <Button
          type="submit"
          className="rounded-l-none bg-brand-accent hover:bg-brand-accent-dark text-white"
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
