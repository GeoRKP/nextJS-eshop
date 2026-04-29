import { ShoppingCart, Heart } from "lucide-react";
import { Link } from "@/i18n/navigation";
import UserButton from "./user-button";
import { LanguageToggle } from "./language-switcher";
import { getMyCart } from "@/lib/actions/cart.actions";
import { getTranslations } from "next-intl/server";

export default async function Menu() {
  let cartItemCount = 0;
  try {
    const cart = await getMyCart();
    cartItemCount = cart?.items?.reduce((acc: number, item: { qty: number }) => acc + item.qty, 0) ?? 0;
  } catch {
    // Cart not available
  }

  const t = await getTranslations("Common");

  return (
    <div className="flex items-center gap-2">
      {/* Desktop nav — bordered tile group */}
      <nav className="hidden md:flex items-stretch border border-border bg-card divide-x divide-border">
        <LanguageToggle className="h-11 w-11 flex items-center justify-center text-muted-foreground hover:text-accent hover:bg-muted transition-all" />
        <Link
          href="/user/wishlist"
          aria-label={t("wishlistLabel")}
          className="h-11 w-11 flex items-center justify-center text-muted-foreground hover:text-accent hover:bg-muted transition-all"
        >
          <Heart className="h-[17px] w-[17px] hover:fill-accent transition-all" />
        </Link>
        <Link
          href="/cart"
          aria-label={t("cartLabel")}
          className="h-11 w-11 flex items-center justify-center text-muted-foreground hover:text-accent hover:bg-muted transition-all relative"
        >
          <ShoppingCart className="h-[17px] w-[17px]" />
          {cartItemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground font-mono text-[10px] font-bold h-[17px] w-[17px] flex items-center justify-center tabular-nums animate-badge-bounce">
              {cartItemCount > 9 ? "9+" : cartItemCount}
            </span>
          )}
        </Link>
        <div className="flex items-center">
          <UserButton />
        </div>
      </nav>

      {/* Mobile: only cart icon (rest in bottom nav + mobile menu) */}
      <nav className="md:hidden flex items-center gap-1">
        <Link
          href="/cart"
          aria-label={t("cartLabel")}
          className="h-11 w-11 flex items-center justify-center text-muted-foreground hover:text-accent transition-all relative"
        >
          <ShoppingCart className="h-5 w-5" />
          {cartItemCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-accent text-accent-foreground font-mono text-[10px] font-bold h-[17px] w-[17px] flex items-center justify-center tabular-nums animate-badge-bounce">
              {cartItemCount > 9 ? "9+" : cartItemCount}
            </span>
          )}
        </Link>
      </nav>
    </div>
  );
}
