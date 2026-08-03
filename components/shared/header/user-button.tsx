import { Link } from "@/i18n/navigation";
import { getAuthSession } from "@/lib/auth-session";
import { signOutUser } from "@/lib/actions/user.actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LogOutIcon, UserIcon, Package, Heart, MapPin, Shield } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function UserButton() {
  const session = await getAuthSession();
  const t = await getTranslations("UserNav");
  const tCommon = await getTranslations("Common");

  if (!session) {
    return (
      <Button asChild variant="accent" size="sm" className="rounded-full ml-1">
        <Link href="/sign-in">
          <UserIcon className="h-4 w-4 mr-1" /> {t("signIn")}
        </Link>
      </Button>
    );
  }

  const firstInitial = session.user?.name?.charAt(0).toUpperCase() ?? "U";
  const isGuest = Boolean(session.user?.isGuest);

  return (
    <div className="flex items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button aria-label={tCommon("userMenu")} className="h-11 w-11 rounded-full bg-primary text-primary-foreground font-heading font-bold text-sm flex items-center justify-center ml-1 hover:ring-2 hover:ring-brand-accent/30 transition-all">
            {firstInitial}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[min(256px,90vw)] rounded-xl shadow-elevated" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {session.user?.name}
              </p>
              <p className="text-xs text-muted-foreground leading-none">
                {session.user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Guests are redirected out of every /user/* page, so showing them
              the full account menu just produced four links that silently
              bounce back to the home page. Offer the way out instead: claiming
              the account via the password-reset flow. */}
          {isGuest ? (
            <DropdownMenuItem className="p-0">
              <Link
                href="/forgot-password"
                className="w-full flex items-center gap-2 px-2 py-2.5 text-brand-accent font-medium"
              >
                <UserIcon className="w-4 h-4" />
                {t("completeRegistration")}
              </Link>
            </DropdownMenuItem>
          ) : (
            <>
              <DropdownMenuItem className="p-0">
                <Link href="/user/profile" className="w-full flex items-center gap-2 px-2 py-2.5">
                  <UserIcon className="w-4 h-4" />
                  {t("userProfile")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="p-0">
                <Link href="/user/orders" className="w-full flex items-center gap-2 px-2 py-2.5">
                  <Package className="w-4 h-4" />
                  {t("orderHistory")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="p-0">
                <Link href="/user/wishlist" className="w-full flex items-center gap-2 px-2 py-2.5">
                  <Heart className="w-4 h-4" />
                  {t("wishlist")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="p-0">
                <Link href="/user/addresses" className="w-full flex items-center gap-2 px-2 py-2.5">
                  <MapPin className="w-4 h-4" />
                  {t("addresses")}
                </Link>
              </DropdownMenuItem>
            </>
          )}

          {!isGuest && session?.user?.role === "admin" && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="p-0">
                <Link href="/admin/overview" className="w-full flex items-center gap-2 px-2 py-2.5 text-brand-accent font-medium">
                  <Shield className="w-4 h-4" />
                  {t("admin")}
                </Link>
              </DropdownMenuItem>
            </>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem className="p-0 mb-1">
            <form action={signOutUser} className="w-full">
              <Button
                type="submit"
                variant="ghost"
                className="w-full py-4 px-2 h-4 justify-start"
              >
                <LogOutIcon className="w-4 h-4 mr-2" />
                {t("signOut")}
              </Button>
            </form>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
