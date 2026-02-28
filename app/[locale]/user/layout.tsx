import { APP_NAME } from "@/lib/constants";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import Menu from "@/components/shared/header/menu";
import MainNav from "./main-nav";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background">
      {/* Top header bar */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto flex items-center h-16 px-4 md:px-8">
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/images/logo.svg"
              alt={APP_NAME}
              width={48}
              height={48}
            />
          </Link>
          <div className="ml-auto items-center flex space-x-4">
            <Menu />
          </div>
        </div>
      </div>

      {/* Mobile nav tabs */}
      <div className="md:hidden border-b bg-card overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <MainNav variant="mobile" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex">
        {/* Sidebar navigation (desktop) */}
        <aside className="hidden md:block w-56 flex-shrink-0 border-r min-h-[calc(100vh-4rem)]">
          <div className="sticky top-0 p-6">
            <MainNav variant="sidebar" />
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6 md:p-8 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
