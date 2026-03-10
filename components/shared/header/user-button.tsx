import { Link } from "@/i18n/navigation";
import { auth } from "@/auth";
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
import { LogOutIcon, UserIcon, Package, Heart, MapPin } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function UserButton() {
  const session = await auth();
  const t = await getTranslations("UserNav");

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

  return (
    <div className="flex items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="h-9 w-9 rounded-full bg-primary text-primary-foreground font-heading font-bold text-sm flex items-center justify-center ml-1 hover:ring-2 hover:ring-brand-accent/30 transition-all">
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
          <DropdownMenuItem asChild>
            <Link href="/user/profile" className="w-full flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              {t("userProfile")}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/user/orders" className="w-full flex items-center gap-2">
              <Package className="w-4 h-4" />
              {t("orderHistory")}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/user/wishlist" className="w-full flex items-center gap-2">
              <Heart className="w-4 h-4" />
              {t("wishlist")}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/user/addresses" className="w-full flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {t("addresses")}
            </Link>
          </DropdownMenuItem>

          {session?.user?.role === "admin" && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/admin/overview" className="w-full">
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
