"use client";

import { useEffect, useRef, useState } from "react";

const HIDE_AFTER = 80;
const SHOW_BEFORE = 24;

export default function StickyHeaderWrapper({
  utilityBar,
  announcementBar,
  children,
}: {
  utilityBar?: React.ReactNode;
  announcementBar: React.ReactNode;
  children: React.ReactNode;
}) {
  const [hidden, setHidden] = useState(false);
  const tickingRef = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y <= SHOW_BEFORE) {
          setHidden(false);
        } else if (y > HIDE_AFTER) {
          setHidden(true);
        }
        tickingRef.current = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`sticky top-0 z-50 transition-transform duration-300 ease-out md:!translate-y-0 ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      {/* Utility bar + Announcement bar */}
      <div>
        {utilityBar}
        {announcementBar}
      </div>
      {/* Main header + category nav */}
      <div className="bg-background border-b border-border">
        {children}
      </div>
    </div>
  );
}
