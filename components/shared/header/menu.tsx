import { ShoppingCart, Heart } from "lucide-react";
import { Link } from "@/i18n/navigation";
import UserButton from "./user-button";
import { getMyCart } from "@/lib/actions/cart.actions";

export default async function Menu() {
  let cartItemCount = 0;
  try {
    const cart = await getMyCart();
    cartItemCount = cart?.items?.reduce((acc: number, item: { qty: number }) => acc + item.qty, 0) ?? 0;
  } catch {
    // Cart not available
  }

  return (
    <div className="flex items-center gap-2">
      {/* Desktop nav — grouped in subtle pill */}
      <nav className="hidden md:flex items-center gap-1 bg-muted/40 rounded-full px-1 py-1">
        <Link
          href="/user/wishlist"
          aria-label="Wishlist"
          className="h-9 w-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background/60 transition-all"
        >
          <Heart className="h-[18px] w-[18px] hover:fill-brand-accent/30 transition-all" />
        </Link>
        <Link
          href="/cart"
          aria-label="Cart"
          className="h-9 w-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background/60 transition-all relative"
        >
          <ShoppingCart className="h-[18px] w-[18px]" />
          {cartItemCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-brand-accent text-accent-foreground text-[10px] font-bold rounded-full h-[18px] w-[18px] flex items-center justify-center ring-2 ring-background animate-badge-bounce">
              {cartItemCount > 9 ? "9+" : cartItemCount}
            </span>
          )}
        </Link>
        <UserButton />
      </nav>

      {/* Mobile: only cart icon (rest in bottom nav + mobile menu) */}
      <nav className="md:hidden flex items-center gap-1">
        <Link
          href="/cart"
          aria-label="Cart"
          className="h-9 w-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-all relative"
        >
          <ShoppingCart className="h-5 w-5" />
          {cartItemCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-brand-accent text-accent-foreground text-[10px] font-bold rounded-full h-[18px] w-[18px] flex items-center justify-center ring-2 ring-background animate-badge-bounce">
              {cartItemCount > 9 ? "9+" : cartItemCount}
            </span>
          )}
        </Link>
      </nav>
    </div>
  );
}
