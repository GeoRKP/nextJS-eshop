import MainNav from "./main-nav";
import { getTranslations } from "next-intl/server";
import { getAuthSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";

export default async function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Guest-checkout sessions are checkout-only: the account area would expose
  // whatever a previous visitor with the same email left behind.
  const session = await getAuthSession();
  if (session?.user?.isGuest) redirect("/");

  const t = await getTranslations("UserNav");

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
      {/* Mobile nav — horizontal pill tabs */}
      <div className="md:hidden mb-6 overflow-x-auto">
        <MainNav variant="mobile" />
      </div>

      <div className="flex gap-8">
        {/* Sidebar navigation (desktop) */}
        <aside className="hidden md:block w-60 flex-shrink-0">
          <div className="sticky top-24">
            <div className="mb-4">
              <h2 className="font-heading font-bold text-sm uppercase tracking-wide text-foreground">
                {t("myAccount")}
              </h2>
              <div className="mt-1 h-0.5 w-8 bg-brand-accent rounded-full" />
            </div>
            <div className="card-premium p-3">
              <MainNav variant="sidebar" />
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
