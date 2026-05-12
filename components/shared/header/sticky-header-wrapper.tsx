"use client";

import { useEffect, useRef, useState } from "react";

const SCROLL_THRESHOLD = 80;
const SCROLL_DELTA = 6;

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
  const lastYRef = useRef(0);
  const tickingRef = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastYRef.current;
        if (Math.abs(delta) > SCROLL_DELTA) {
          if (y > SCROLL_THRESHOLD && delta > 0) {
            setHidden(true);
          } else {
            setHidden(false);
          }
          lastYRef.current = y;
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
