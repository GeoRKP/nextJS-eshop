import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { APP_NAME } from "@/lib/constants";
import Menu from "./menu";
import SearchWrapper from "./search-wrapper";
import CategoryNavBar from "./category-nav-bar";
import MobileMenuWrapper from "./mobile-menu-wrapper";

const Header = () => {
  return (
    <header className="w-full">
      {/* Main Header */}
      <div className="wrapper flex items-center gap-4 header-row !py-0">
        {/* Left: Hamburger (mobile) + Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <MobileMenuWrapper />
          <Link
            href="/"
            className="flex-start group relative z-10 -my-3"
            aria-label={`${APP_NAME} — αρχική`}
          >
            <Image
              src="/images/logo.png"
              alt={`${APP_NAME} logo`}
              width={92}
              height={92}
              priority
              className="hidden md:block transition-transform group-hover:scale-105"
            />
            <Image
              src="/images/logo.png"
              alt={`${APP_NAME} logo`}
              width={60}
              height={60}
              priority
              className="md:hidden"
            />
          </Link>
        </div>

        {/* Center: Full-width search bar */}
        <div className="flex-1 max-w-2xl xl:max-w-3xl 2xl:max-w-4xl mx-auto hidden md:block">
          <SearchWrapper />
        </div>

        {/* Right: Action icons */}
        <Menu />
      </div>

      {/* Category Navigation Bar (desktop only) */}
      <CategoryNavBar />
    </header>
  );
};

export default Header;
