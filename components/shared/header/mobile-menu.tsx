"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  MenuIcon,
  X,
  ChevronDown,
  ChevronRight,
  Home,
  ShoppingBag,
  Heart,
  Package,
  SearchIcon,
  Layers,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Category } from "@/types";
import { getCategoryIcon } from "@/lib/category-icons";
import ModeToggle from "./mode-toggle";
import LanguageSwitcher from "./language-switcher";

type BrandItem = { brand: string; _count: number };

type Props = {
  categories: Category[];
  brands: BrandItem[];
  userName?: string | null;
};

export default function MobileMenu({ categories, brands, userName }: Props) {
  const t = useTranslations("MobileNav");
  const tMenu = useTranslations("MegaMenu");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [brandsExpanded, setBrandsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const closeMenu = () => setOpen(false);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        closeMenu();
        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      }
    },
    [searchQuery, router]
  );

  // Focus search input when menu opens
  useEffect(() => {
    if (open) {
      setTimeout(() => searchInputRef.current?.focus(), 300);
    } else {
      setSearchQuery("");
    }
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <MenuIcon className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[340px] sm:w-[400px] p-0 flex flex-col"
      >
        {/* Header - gradient with industrial stripe */}
        <div className="relative bg-gradient-to-r from-primary to-primary/90 text-primary-foreground">
          <div className="absolute inset-0 industrial-stripe opacity-30" />
          <div className="relative flex items-center justify-between px-4 py-4">
            <SheetTitle className="text-lg font-heading font-black tracking-tight uppercase text-primary-foreground">
              {t("categories")}
            </SheetTitle>
            <Button variant="ghost" size="icon" onClick={closeMenu} className="text-primary-foreground hover:bg-white/10">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Search bar with premium styling */}
        <div className="px-4 py-3 border-b">
          <form onSubmit={handleSearch} className="search-premium flex items-center bg-muted/30">
            <SearchIcon className="h-4 w-4 text-muted-foreground/60 ml-3 shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("search") + "..."}
              className="flex-1 h-10 bg-transparent pl-2 pr-2 text-sm focus:outline-none"
              autoComplete="off"
            />
            <button type="submit" className="h-8 w-8 rounded-full bg-brand-accent text-white flex items-center justify-center shrink-0 mr-1">
              <SearchIcon className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>

        {/* User section — card-like */}
        <div className="px-4 py-3 border-b bg-muted/30">
          {userName ? (
            <Link href="/user/profile" onClick={closeMenu} className="flex items-center gap-3 p-2 rounded-lg bg-card border border-border">
              <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground font-heading font-bold text-sm flex items-center justify-center">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{userName}</p>
                <p className="text-xs text-muted-foreground">View Profile</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ) : (
            <div className="space-y-2">
              <Link href="/sign-in" onClick={closeMenu}>
                <Button className="w-full bg-brand-accent hover:bg-brand-accent-dark text-white" size="sm">
                  {t("signIn")}
                </Button>
              </Link>
              <p className="text-[10px] text-center text-muted-foreground">
                Trusted by 10,000+ professionals
              </p>
            </div>
          )}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* Category accordion */}
          <div className="py-2">
            <p className="px-4 py-2 text-xs font-bold text-brand-accent uppercase tracking-widest">
              {t("categories")}
            </p>
            {categories.map((category) => (
              <CategoryAccordion
                key={category.id}
                category={category}
                expanded={expandedCategories}
                onToggle={toggleCategory}
                onClose={closeMenu}
                viewAllText={tMenu("viewAll")}
                level={0}
              />
            ))}
          </div>

          {/* Brands section — horizontal scroll for popular */}
          {brands.length > 0 && (
            <>
              <div className="border-t mx-4" />
              <div className="py-2">
                <button
                  onClick={() => setBrandsExpanded(!brandsExpanded)}
                  className="flex items-center justify-between w-full px-4 min-h-[44px] text-sm hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Layers className="h-4 w-4 text-brand-accent" />
                    <span className="font-medium">{t("popularBrands")}</span>
                  </div>
                  {brandsExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                <AnimatePresence>
                  {brandsExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      {/* Horizontal scroll for popular brands */}
                      <div className="flex gap-2 px-4 py-2 overflow-x-auto scrollbar-hide">
                        {brands.slice(0, 8).map((b) => (
                          <Link
                            key={b.brand}
                            href={`/search?q=all&category=all&brand=${encodeURIComponent(b.brand)}`}
                            onClick={closeMenu}
                            className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium bg-card border border-border hover:border-brand-accent rounded-lg whitespace-nowrap shrink-0 transition-colors"
                          >
                            {b.brand}
                            <span className="text-muted-foreground">({b._count})</span>
                          </Link>
                        ))}
                      </div>
                      {/* All brands list */}
                      {brands.slice(8).map((b) => (
                        <Link
                          key={b.brand}
                          href={`/search?q=all&category=all&brand=${encodeURIComponent(b.brand)}`}
                          onClick={closeMenu}
                          className="flex items-center justify-between px-4 pl-11 min-h-[44px] text-sm hover:bg-brand-accent/10 transition-colors"
                        >
                          <span>{b.brand}</span>
                          <span className="text-xs text-muted-foreground">
                            ({b._count})
                          </span>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}

          {/* Divider */}
          <div className="border-t mx-4" />

          {/* Quick links */}
          <div className="py-2">
            <p className="px-4 py-2 text-xs font-bold text-brand-accent uppercase tracking-widest">
              {t("quickLinks")}
            </p>
            <Link
              href="/"
              onClick={closeMenu}
              className="flex items-center gap-3 px-4 min-h-[44px] text-sm hover:bg-accent transition-colors"
            >
              <Home className="h-4 w-4" />
              {t("home")}
            </Link>
            <Link
              href="/user/orders"
              onClick={closeMenu}
              className="flex items-center gap-3 px-4 min-h-[44px] text-sm hover:bg-accent transition-colors"
            >
              <Package className="h-4 w-4" />
              {t("myOrders")}
            </Link>
            <Link
              href="/user/wishlist"
              onClick={closeMenu}
              className="flex items-center gap-3 px-4 min-h-[44px] text-sm hover:bg-accent transition-colors"
            >
              <Heart className="h-4 w-4" />
              {t("wishlist")}
            </Link>
            <Link
              href="/search"
              onClick={closeMenu}
              className="flex items-center gap-3 px-4 min-h-[44px] text-sm hover:bg-accent transition-colors"
            >
              <ShoppingBag className="h-4 w-4" />
              {tMenu("deals")}
            </Link>
          </div>
        </div>

        {/* Bottom: theme + language with gradient divider */}
        <div>
          <div className="divider-gradient" />
          <div className="px-4 py-3 flex items-center gap-2 bg-card">
            <ModeToggle />
            <LanguageSwitcher />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function CategoryAccordion({
  category,
  expanded,
  onToggle,
  onClose,
  viewAllText,
  level,
}: {
  category: Category;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onClose: () => void;
  viewAllText: string;
  level: number;
}) {
  const isExpanded = expanded.has(category.id);
  const hasChildren = category.children && category.children.length > 0;
  const paddingLeft = 16 + level * 16;
  const Icon = level === 0 ? getCategoryIcon(category.name) : null;

  return (
    <div className={isExpanded && level === 0 ? "border-l-2 border-l-brand-accent" : ""}>
      <div
        className={`flex items-center hover:bg-accent transition-colors ${isExpanded ? "bg-muted/30" : ""}`}
        style={{ paddingLeft }}
      >
        {Icon && (
          <Icon className="h-4 w-4 text-brand-accent mr-2 shrink-0" />
        )}
        {/* Amber dot indicator for subcategories */}
        {level > 0 && (
          <span className="w-1.5 h-1.5 rounded-full bg-brand-accent/40 mr-2 shrink-0" />
        )}
        <Link
          href={`/search?category=${encodeURIComponent(category.name)}`}
          onClick={onClose}
          className="flex-1 min-h-[44px] flex items-center text-sm"
        >
          {category.name}
          {category._count?.products ? (
            <span className="text-xs text-muted-foreground ml-1">
              ({category._count.products})
            </span>
          ) : null}
        </Link>
        {hasChildren && (
          <button
            onClick={() => onToggle(category.id)}
            className="p-3 hover:bg-accent/50"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-brand-accent" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {/* View All link */}
            <Link
              href={`/search?category=${encodeURIComponent(category.name)}`}
              onClick={onClose}
              className="block min-h-[44px] flex items-center text-xs text-brand-accent font-medium hover:bg-accent/50 transition-colors"
              style={{ paddingLeft: paddingLeft + (Icon ? 40 : 16) }}
            >
              {viewAllText} {category.name}
            </Link>
            {category.children!.map((child) => (
              <CategoryAccordion
                key={child.id}
                category={child}
                expanded={expanded}
                onToggle={onToggle}
                onClose={onClose}
                viewAllText={viewAllText}
                level={level + 1}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
