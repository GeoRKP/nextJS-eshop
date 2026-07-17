import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";
import { Wrench } from "lucide-react";

export default async function PromoBanner() {
  const t = await getTranslations("HomePage");

  return (
    <section className="bg-foreground text-background overflow-hidden border-y border-foreground relative">
      {/* Blueprint grid backdrop */}
      <div className="absolute inset-0 bg-blueprint-grid opacity-[0.06] pointer-events-none" aria-hidden="true" />
      {/* Top hazard accent line */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-accent" aria-hidden="true" />

      <div className="wrapper relative">
        <div className="grid md:grid-cols-2 gap-10 py-14 md:py-20">
          {/* Left: Content */}
          <div className="flex flex-col justify-center">
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-accent mb-4 inline-flex items-center gap-2">
              <span className="h-px w-8 bg-accent" />
              ▲ {t("promoLabel")}
            </span>
            <h2 className="h2-display text-background mb-4">
              {t("promoTitle")}
            </h2>
            <p className="text-background/65 mb-10 text-sm md:text-base max-w-lg leading-relaxed">
              {t("promoSubtitle")}
            </p>

            {/* Stats row — workshop spec plate */}
            <div className="flex gap-px mb-10 border border-background/20 w-fit">
              {(["statParts", "statBrands", "statSupport"] as const).map((key) => {
                const value = t(key);
                const parts = value.split(" ");
                const number = parts[0];
                const label = parts.slice(1).join(" ");
                return (
                  <div key={key} className="px-5 py-4 bg-foreground/40 min-w-[110px]">
                    <p className="font-heading text-3xl md:text-4xl font-extrabold text-accent leading-none tabular-nums">
                      {number}
                    </p>
                    <p className="font-mono text-[10px] text-background/55 uppercase tracking-[0.14em] mt-2">
                      {label}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-5">
              <Button
                asChild
                size="lg"
                className="bg-accent hover:bg-background text-accent-foreground hover:text-foreground font-heading font-bold text-sm md:text-base px-8 py-6 rounded-none uppercase tracking-[0.16em] border-0 btn-stamp"
              >
                <Link href="/search?price=1-50">{t("shopDeals")} →</Link>
              </Button>
              <Wrench className="h-5 w-5 text-background/30" />
            </div>
          </div>

          {/* Right: Workshop photo panel (desktop only) */}
          <div className="hidden md:block relative border border-accent/25 overflow-hidden min-h-[360px]">
            {/* Workshop photo */}
            <Image
              src="/images/banners/photos/why-4-crane-workshop.jpg"
              alt="Heavy duty workshop"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 0, 50vw"
            />

            {/* Graphite gradient overlay — keeps the photo moody */}
            <div className="absolute inset-0 bg-gradient-to-br from-foreground/65 via-foreground/35 to-foreground/75" />
            <div className="absolute inset-0 industrial-stripe opacity-40" />

            {/* Stencil corner brackets */}
            <div className="absolute top-3 left-3 h-5 w-5 border-t-2 border-l-2 border-accent z-10" />
            <div className="absolute top-3 right-3 h-5 w-5 border-t-2 border-r-2 border-accent z-10" />
            <div className="absolute bottom-3 left-3 h-5 w-5 border-b-2 border-l-2 border-accent z-10" />
            <div className="absolute bottom-3 right-3 h-5 w-5 border-b-2 border-r-2 border-accent z-10" />

            {/* Content — caption + HEAVY DUTY badge */}
            <div className="absolute inset-x-0 bottom-0 p-6 z-10 flex flex-col gap-3">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-accent inline-flex items-center gap-2 self-start bg-foreground/50 px-2.5 py-1 border border-accent/40">
                ▲ {t("promoBadge")}
              </span>
              <p className="font-heading text-lg md:text-xl font-bold uppercase tracking-[0.04em] text-background leading-tight max-w-xs">
                {t("promoCaption")}
              </p>
            </div>

            {/* Yellow bottom accent bar */}
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-accent z-20" />
          </div>
        </div>
      </div>
    </section>
  );
}
