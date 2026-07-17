"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// IntersectionObserver + CSS transition (framer-motion whileInView replacement).
export default function ScrollFadeIn({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "-50px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("scroll-reveal", visible && "is-visible", className)}
    >
      {children}
    </div>
  );
}
