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
          <Link href="/" className="flex-start">
            <Image
              src="/images/logo.svg"
              alt={`${APP_NAME} logo`}
              width={52}
              height={52}
              priority={true}
              className="hidden md:block"
            />
            <Image
              src="/images/logo.svg"
              alt={`${APP_NAME} logo`}
              width={44}
              height={44}
              priority={true}
              className="md:hidden"
            />
            <span className="hidden md:block font-heading font-extrabold text-xl ml-2 tracking-[0.15em] uppercase">
              {APP_NAME}
            </span>
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
