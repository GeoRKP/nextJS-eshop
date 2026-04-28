"use client";
import { APP_NAME } from "@/lib/constants";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  const t = useTranslations("NotFound");
  const tCommon = useTranslations("Common");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-background relative overflow-hidden">
      {/* Industrial backdrop */}
      <div className="absolute inset-0 bg-blueprint-grid opacity-[0.06] pointer-events-none" aria-hidden="true" />
      <div className="absolute inset-0 industrial-stripe opacity-30 pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 max-w-xl text-center">
        {/* Stencil header */}
        <span className="inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-accent mb-6">
          <span className="h-px w-8 bg-accent" />
          ▲ NOT FOUND / 404
          <span className="h-px w-8 bg-accent" />
        </span>

        {/* Big stencil 404 */}
        <div className="font-heading font-black text-7xl md:text-8xl lg:text-9xl text-foreground leading-none mb-2 tabular-nums">
          404
        </div>

        {/* Logo as stamp */}
        <div className="flex items-center justify-center gap-3 mb-6 mt-4">
          <Image
            src="/images/logo.png"
            width={36}
            height={36}
            alt={`${APP_NAME} logo`}
            priority
          />
          <span className="font-heading font-black text-base uppercase tracking-[0.16em]">
            {APP_NAME}
          </span>
        </div>

        {/* Title + description */}
        <h1 className="font-heading text-2xl md:text-3xl font-bold uppercase tracking-tight mb-3">
          {t("title")}
        </h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
          {t("description")}
        </p>

        {/* CTA */}
        <Button
          asChild
          className="bg-accent hover:bg-foreground text-accent-foreground hover:text-background font-heading font-bold uppercase tracking-[0.16em] px-8 h-12 rounded-none btn-stamp"
        >
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {tCommon("backToHome")}
          </Link>
        </Button>
      </div>
    </div>
  );
}
