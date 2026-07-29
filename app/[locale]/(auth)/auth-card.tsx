import { ReactNode } from "react";

/**
 * Shared card shell for the auth pages — a sharp "spec plate" with the site's
 * safety-yellow accent bar on top. Keeps sign-in / sign-up / password pages
 * visually identical.
 */
export default function AuthCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="relative bg-card border border-border shadow-sm">
      <div
        className="absolute inset-x-0 top-0 h-[3px] bg-brand-accent"
        aria-hidden="true"
      />
      <div className="p-6 sm:p-8">
        <h1 className="font-heading font-black text-2xl sm:text-[1.75rem] uppercase tracking-tight leading-tight">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-1.5">{description}</p>
        )}
        <div className="mt-6">{children}</div>
      </div>
    </section>
  );
}
