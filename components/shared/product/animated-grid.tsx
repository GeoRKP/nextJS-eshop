import { cn } from "@/lib/utils";

// CSS-only staggered entrance (server components — no client JS needed).
export function AnimatedGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("stagger-grid", className)}>{children}</div>;
}

export function AnimatedGridItem({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}
