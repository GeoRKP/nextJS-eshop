// CSS-only tap feedback (server component — no client JS needed).
export default function AnimatedButton({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="tap-scale">{children}</div>;
}
