"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { X, Truck, Sparkles, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";

const ANNOUNCEMENT_KEYS = [
  "freeShipping",
  "newArrivals",
  "returns",
] as const;

const ANNOUNCEMENT_ICONS = [Truck, Sparkles, RotateCcw];
const ROTATION_INTERVAL = 4000;

export default function AnnouncementBar() {
  const t = useTranslations("Announcement");
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
    <div className="announcement-bar bg-primary/80 backdrop-blur-sm hidden md:flex items-center justify-center relative text-sm font-semibold tracking-wide overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.p
          key={currentIndex}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="text-center flex items-center gap-2 text-brand-accent"
        >
          <Icon className="h-3.5 w-3.5" />
          {t(ANNOUNCEMENT_KEYS[currentIndex])}
        </motion.p>
      </AnimatePresence>

      {/* Dismiss button */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-4 p-1 text-primary-foreground opacity-40 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-transparent">
        <div
          key={progressKey.current}
          className="h-full bg-brand-accent animate-progress-fill"
        />
      </div>
    </div>
  );
}
