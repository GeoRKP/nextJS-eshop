import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Header from "@/components/shared/header";
import Footer from "@/components/footer";
import PageTransition from "@/components/shared/page-transition";
import StickyHeaderWrapper from "@/components/shared/header/sticky-header-wrapper";
// import AnnouncementBar from "@/components/shared/header/announcement-bar";
// import UtilityBar from "@/components/shared/header/utility-bar";
import MobileBottomNav from "@/components/shared/header/mobile-bottom-nav";
import MobileCategoryChips from "@/components/shared/header/mobile-category-chips";
import { auth } from "@/auth";

// Storefront pages query the DB (products, brands, cart, session) on every
// render — keep them runtime-rendered so build doesn't try to reach the DB.
export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Safety net: proxy already redirects banned users to /blocked, but JWT
  // ban-status is refreshed at most every 60s. Calling auth() here forces
  // a fresh ban check on the current render so a freshly-banned user can't
  // see one extra page before the proxy catches them.
  const session = await auth();
  if (session?.user) {
    const suspendedUntil = session.user.suspendedUntil;
    const isSuspended =
      typeof suspendedUntil === "string" &&
      new Date(suspendedUntil) > new Date();
    if (session.user.isBanned || isSuspended) {
      const pathname = (await headers()).get("x-pathname") ?? "";
      if (!pathname.replace(/\/+$/, "").endsWith("/blocked")) {
        const target = pathname.startsWith("/en") ? "/en/blocked" : "/blocked";
        redirect(target);
      }
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <StickyHeaderWrapper
        // utilityBar={<UtilityBar />}
        // announcementBar={<AnnouncementBar />}
        announcementBar={null}
      >
        <Suspense fallback={<div className="h-16 bg-background" />}>
          <Header />
        </Suspense>
      </StickyHeaderWrapper>
      <MobileCategoryChips />
      <main className="flex-1 pb-20 md:pb-0 pt-1 md:pt-0">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
