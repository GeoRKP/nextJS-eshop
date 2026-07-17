"use client";

import { usePathname } from "@/i18n/navigation";

// CSS-only page fade — keyed on pathname so the animation replays per navigation.
export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="animate-page-enter">
      {children}
    </div>
  );
}
