"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { X, Truck, Sparkles, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";

const ANNOUNCEMENT_KEYS = [
  "freeShipping",
  "newArrivals",
  "returns",
] as const;

const ANNOUNCEMENT_ICONS = [Truck, Sparkles, RotateCcw];
const ROTATION_INTERVAL = 4000;

export default function AnnouncementBar() {
  const t = useTranslations("Announcement");
  const tCommon = useTranslations("Common");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const progressKey = useRef(0);

  const rotate = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENT_KEYS.length);
    progressKey.current++;
  }, []);

  useEffect(() => {
    const interval = setInterval(rotate, ROTATION_INTERVAL);
    return () => clearInterval(interval);
  }, [rotate]);

  if (dismissed) return null;

  const Icon = ANNOUNCEMENT_ICONS[currentIndex];

  return (
    <div className="announcement-bar bg-foreground flex items-center justify-center relative overflow-hidden border-b border-foreground">
      {/* Left stencil tag — hidden on mobile to save space */}
      <span className="hidden md:inline-block absolute left-4 top-1/2 -translate-y-1/2 font-mono text-[10px] font-bold tracking-[0.18em] text-accent uppercase">
        ▲ NOTICE
      </span>

      <p
        key={currentIndex}
        className="animate-page-enter text-center flex items-center gap-2 text-background font-mono text-[10px] md:text-[11px] font-medium uppercase tracking-[0.10em] md:tracking-[0.12em] px-10 max-w-full"
      >
        <Icon className="h-3 w-3 text-accent shrink-0" />
        <span className="truncate">{t(ANNOUNCEMENT_KEYS[currentIndex])}</span>
      </p>

      {/* Dismiss button */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-2 md:right-4 p-1 text-background/60 hover:text-accent transition-colors"
        aria-label={tCommon("dismiss")}
      >
        <X className="h-3 w-3" />
      </button>

      {/* Progress bar — yellow stencil tick */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-background/10">
        <div
          key={progressKey.current}
          className="h-full bg-accent animate-progress-fill"
        />
      </div>
    </div>
  );
}
