"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Truck, Sparkles, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";

const ANNOUNCEMENT_KEYS = [
  "freeShipping",
  "newArrivals",
  "returns",
] as const;

const ANNOUNCEMENT_ICONS = [Truck, Sparkles, RotateCcw];

export default function AnnouncementBar() {
  const t = useTranslations("Announcement");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  const rotate = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENT_KEYS.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(rotate, 4000);
    return () => clearInterval(interval);
  }, [rotate]);

  if (dismissed) return null;

  const Icon = ANNOUNCEMENT_ICONS[currentIndex];

  return (
    <div className="announcement-bar bg-gradient-to-r from-brand-orange via-brand-orange-light to-brand-orange animate-shimmer text-white hidden md:flex items-center justify-center relative text-sm font-semibold tracking-wide">
      <p className="text-center transition-opacity duration-300 flex items-center gap-2">
        <Icon className="h-3.5 w-3.5" />
        {t(ANNOUNCEMENT_KEYS[currentIndex])}
      </p>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-4 p-1 hover:opacity-70 transition-opacity"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
