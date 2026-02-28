import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { APP_NAME } from "@/lib/constants";
import Menu from "./menu";
import SearchWrapper from "./search-wrapper";
import CategoryNavBar from "./category-nav-bar";
import MobileMenuWrapper from "./mobile-menu-wrapper";

const Header = () => {
  return (
    <header className="w-full border-b">
      {/* Main Header */}
      <div className="wrapper flex items-center gap-4 header-row !py-0">
        {/* Left: Hamburger (mobile) + Logo */}
        <div className="flex items-center gap-1 shrink-0">
          <MobileMenuWrapper />
          <Link href="/" className="flex-start">
            <Image
              src="/images/logo.svg"
              alt={`${APP_NAME} logo`}
              width={48}
              height={48}
              priority={true}
            />
            <span className="hidden md:block font-black text-2xl ml-2 tracking-tight uppercase">
              {APP_NAME}
            </span>
          </Link>
        </div>

        {/* Center: Full-width search bar */}
        <div className="flex-1 max-w-3xl hidden md:block">
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
