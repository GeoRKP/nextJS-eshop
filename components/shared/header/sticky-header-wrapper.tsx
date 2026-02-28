"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export default function StickyHeaderWrapper({
  utilityBar,
  announcementBar,
  children,
}: {
  utilityBar?: React.ReactNode;
  announcementBar: React.ReactNode;
  children: React.ReactNode;
}) {
  const [scrolled, setScrolled] = useState(false);
  const ticking = useRef(false);
  const cooldown = useRef(false);

  const handleScroll = useCallback(() => {
    if (ticking.current || cooldown.current) return;
    ticking.current = true;

    requestAnimationFrame(() => {
      const y = window.scrollY;
      setScrolled((prev) => {
        const next =
          prev && y < 40 ? false : !prev && y > 100 ? true : prev;
        if (next !== prev) {
          // Ignore scroll events while the CSS transition settles
          // to prevent layout-shift feedback loops
          cooldown.current = true;
          setTimeout(() => {
            cooldown.current = false;
          }, 350);
        }
        return next;
      });
      ticking.current = false;
    });
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <div className="sticky top-0 z-50">
      {/* Utility bar + Announcement bar — hidden when scrolled */}
      <div
        className={`transition-all duration-300 overflow-hidden ${
          scrolled ? "max-h-0 opacity-0" : "max-h-20 opacity-100"
        }`}
      >
        {utilityBar}
        {announcementBar}
      </div>
      {/* Main header + category nav */}
      <div className={`bg-background transition-all duration-300 ${scrolled ? "shadow-lg border-b border-brand-orange/20" : ""}`}>
        {children}
      </div>
    </div>
  );
}
