import { ShoppingCart, Heart } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
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
      {/* Desktop nav */}
      <nav className="hidden md:flex items-center gap-1">
        <Button asChild variant="ghost" size="icon">
          <Link href="/user/wishlist">
            <Heart className="h-5 w-5" />
          </Link>
        </Button>
        <Button asChild variant="ghost" size="icon" className="relative">
          <Link href="/cart">
            <ShoppingCart className="h-5 w-5" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-orange text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {cartItemCount > 9 ? "9+" : cartItemCount}
              </span>
            )}
          </Link>
        </Button>
        <UserButton />
      </nav>

      {/* Mobile: only cart icon (rest in bottom nav + mobile menu) */}
      <nav className="md:hidden flex items-center gap-1">
        <Button asChild variant="ghost" size="icon" className="relative">
          <Link href="/cart">
            <ShoppingCart className="h-5 w-5" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-orange text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {cartItemCount > 9 ? "9+" : cartItemCount}
              </span>
            )}
          </Link>
        </Button>
      </nav>
    </div>
  );
}
