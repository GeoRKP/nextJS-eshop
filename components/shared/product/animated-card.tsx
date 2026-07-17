// CSS-only hover lift (server component — no client JS needed).
export default function AnimatedCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="card-lift">{children}</div>;
}
