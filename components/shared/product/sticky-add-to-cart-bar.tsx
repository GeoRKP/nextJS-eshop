"use client";

import { useState, useEffect, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "@/i18n/navigation";
import { Product, Cart } from "@/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { addItemToCart } from "@/lib/actions/cart.actions";
import { ShoppingCart, Loader, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import ProductPrice from "./product-price";
import { cn } from "@/lib/utils";

const SCROLL_THRESHOLD = 600;

export default function StickyAddToCartBar({
  product,
  cart,
}: {
  product: Product;
  cart: Cart | undefined;
}) {
  const [visible, setVisible] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations("Product");

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > SCROLL_THRESHOLD);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (product.stock <= 0) return null;

  const existItem = cart?.items?.find((x) => x.productId === product.id);

  const cartItem = {
    productId: product.id,
    name: product.name,
    price: product.price,
    slug: product.slug,
    qty: 1,
    image: product.images[0],
  };

  const handleAdd = () => {
    startTransition(async () => {
      const res = await addItemToCart(cartItem);
      if (!res.success) {
        toast({ variant: "destructive", description: res.message });
        return;
      }
      toast({
        description: res.message,
        action: (
          <ToastAction
            altText={t("goToCart")}
            className="bg-primary text-background hover:bg-primary/90"
            onClick={() => router.push("/cart")}
          >
            {t("goToCart")}
          </ToastAction>
        ),
      });
    });
  };

  const handleGoToCart = () => router.push("/cart");

  return (
    <>
      {/* Mobile: above mobile-bottom-nav */}
      <div
        className={cn(
          "md:hidden fixed inset-x-0 z-40 bg-card border-t border-border shadow-elevated transition-transform duration-300 ease-out",
          visible ? "translate-y-0" : "translate-y-full"
        )}
        style={{ bottom: "calc(68px + env(safe-area-inset-bottom, 0px))" }}
        aria-hidden={!visible}
      >
        <div className="flex items-center gap-2.5 px-3 py-2.5">
          <Image
            src={product.images[0]}
            alt={product.name}
            width={44}
            height={44}
            className="w-11 h-11 object-cover border border-border flex-shrink-0 bg-muted/30"
            sizes="44px"
          />
          <div className="flex-1 min-w-0 leading-tight">
            <p className="font-mono text-[9px] text-accent uppercase tracking-[0.12em] truncate">
              ▲ {product.brand}
            </p>
            <ProductPrice
              value={Number(product.price)}
              className="font-heading text-base font-extrabold tabular-nums"
            />
          </div>
          <Button
            disabled={isPending}
            onClick={existItem ? handleGoToCart : handleAdd}
            className="h-10 px-4 rounded-none bg-accent text-accent-foreground hover:bg-foreground hover:text-background font-heading font-bold uppercase tracking-[0.12em] text-xs whitespace-nowrap flex-shrink-0"
          >
            {isPending ? (
              <Loader className="h-3.5 w-3.5 animate-spin" />
            ) : existItem ? (
              <>
                <Check className="h-3.5 w-3.5 mr-1" />
                {t("goToCart")}
              </>
            ) : (
              <>
                <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                {t("addToCart")}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Desktop: bottom 0 */}
      <div
        className={cn(
          "hidden md:block fixed inset-x-0 bottom-0 z-40 bg-card border-t-2 border-foreground/10 shadow-elevated transition-transform duration-300 ease-out",
          visible ? "translate-y-0" : "translate-y-full"
        )}
        aria-hidden={!visible}
      >
        <div className="wrapper !py-3 flex items-center gap-5">
          <Image
            src={product.images[0]}
            alt={product.name}
            width={64}
            height={64}
            className="w-16 h-16 object-cover border border-border flex-shrink-0 bg-muted/30 bg-blueprint-grid-sm"
            sizes="64px"
          />
          <div className="flex-1 min-w-0">
            <p className="font-mono text-[10px] text-accent uppercase tracking-[0.18em] mb-1">
              ▲ {product.brand}
            </p>
            <p className="font-heading text-sm font-bold uppercase truncate leading-tight">
              {product.name}
            </p>
          </div>
          <div className="flex items-baseline gap-2.5 flex-shrink-0">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              PRICE
            </span>
            <ProductPrice
              value={Number(product.price)}
              className="font-heading text-2xl font-extrabold tabular-nums"
            />
          </div>
          <Button
            disabled={isPending}
            onClick={existItem ? handleGoToCart : handleAdd}
            className="h-12 px-6 rounded-none bg-accent text-accent-foreground hover:bg-foreground hover:text-background font-heading font-bold uppercase tracking-[0.16em] text-sm whitespace-nowrap flex-shrink-0 btn-stamp"
          >
            {isPending ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : existItem ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                {t("goToCart")} →
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 mr-2" />
                {t("addToCart")} →
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}
