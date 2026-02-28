import Header from "@/components/shared/header";
import Footer from "@/components/footer";
import PageTransition from "@/components/shared/page-transition";
import StickyHeaderWrapper from "@/components/shared/header/sticky-header-wrapper";
import AnnouncementBar from "@/components/shared/header/announcement-bar";
import UtilityBar from "@/components/shared/header/utility-bar";
import MobileBottomNav from "@/components/shared/header/mobile-bottom-nav";
import MobileCategoryChips from "@/components/shared/header/mobile-category-chips";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <StickyHeaderWrapper
        utilityBar={<UtilityBar />}
        announcementBar={<AnnouncementBar />}
      >
        <Header />
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
