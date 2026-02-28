import { APP_NAME } from "@/lib/constants";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import Menu from "@/components/shared/header/menu";
import MainNav from "./main-nav";
import AdminSearch from "@/components/admin/admin-search";
import { getTranslations } from "next-intl/server";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const t = await getTranslations("AdminNav");

  return (
    <div className="min-h-screen flex flex-col border-t-2 border-brand-accent">
      {/* Top bar */}
      <div className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex items-center h-16 px-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/logo.svg"
              alt={APP_NAME}
              width={40}
              height={40}
            />
          </Link>
          <div className="ml-auto flex items-center gap-3">
            <AdminSearch />
            <Menu />
          </div>
        </div>
      </div>

      {/* Mobile nav — horizontal pill tabs */}
      <div className="md:hidden px-4 py-3 overflow-x-auto border-b border-border/40">
        <MainNav variant="mobile" />
      </div>

      <div className="flex flex-1 container mx-auto px-4">
        {/* Desktop sidebar */}
        <aside className="hidden md:block w-60 flex-shrink-0 py-6 pr-6">
          <div className="sticky top-24">
            <div className="mb-4">
              <h2 className="font-heading font-bold text-sm uppercase tracking-wide text-foreground">
                {t("adminPanel")}
              </h2>
              <div className="mt-1 h-0.5 w-8 bg-brand-accent rounded-full" />
            </div>
            <div className="card-premium p-3">
              <MainNav variant="sidebar" />
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 py-6 md:py-8 md:pl-2">
          {children}
        </main>
      </div>
    </div>
  );
}
