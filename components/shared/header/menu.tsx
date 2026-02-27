import { EllipsisVertical, ShoppingCart } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import ModeToggle from "./mode-toggle";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import UserButton from "./user-button";
import LanguageSwitcher from "./language-switcher";
import { getTranslations } from "next-intl/server";

export default async function Menu() {
  const t = await getTranslations("Nav");

  return (
    <div className="flex justify-end gap-3">
      <nav className="hidden md:flex w-full max-w-xs gap-1">
        <ModeToggle />
        <LanguageSwitcher />
        <Button asChild variant="ghost">
          <Link href="/cart">
            <ShoppingCart />
            {t("cart")}
          </Link>
        </Button>
        <UserButton />
      </nav>
      <nav className="md:hidden">
        <Sheet>
          <SheetTrigger className="align-middle">
            <EllipsisVertical />
          </SheetTrigger>
          <SheetContent className="flex flex-col items-start">
            <SheetTitle>{t("menu")}</SheetTitle>
            <ModeToggle />
            <LanguageSwitcher />
            <Button asChild variant="ghost">
              <Link href="/cart">
                <ShoppingCart /> {t("cart")}
              </Link>
            </Button>
            <UserButton />
            <SheetDescription></SheetDescription>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  );
}
