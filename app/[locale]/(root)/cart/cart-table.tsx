"use client";
import { useRouter } from "@/i18n/navigation";
import { useToast } from "@/hooks/use-toast";
import { useTransition } from "react";
import { addItemToCart, removeItemFromCart } from "@/lib/actions/cart.actions";
import { Loader, ArrowRight, Minus, Plus, ShoppingCart, Lock, Shield, Trash2 } from "lucide-react";
import { Cart, CartItem } from "@/types";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useTranslations } from "next-intl";
import CouponInput from "@/components/shared/coupon-input";

function QuantityControls({
  item,
  isPending,
  onRemove,
  onAdd,
}: {
  item: CartItem;
  isPending: boolean;
  onRemove: () => void;
  onAdd: () => void;
}) {
  return (
    <div className="flex items-center border-2 border-border rounded-lg overflow-hidden">
      <Button
        disabled={isPending}
        variant="ghost"
        size="icon"
        type="button"
        className="w-11 h-11 rounded-none hover:bg-brand-accent/10"
        onClick={onRemove}
      >
        {isPending ? (
          <Loader className="w-4 h-4 animate-spin" />
        ) : (
          <Minus className="w-4 h-4" />
        )}
      </Button>
      <span className="w-12 text-center font-semibold tabular-nums select-none">{item.qty}</span>
      <Button
        disabled={isPending}
        variant="ghost"
        size="icon"
        type="button"
        className="w-11 h-11 rounded-none hover:bg-brand-accent/10"
        onClick={onAdd}
      >
        {isPending ? (
          <Loader className="w-4 h-4 animate-spin" />
        ) : (
          <Plus className="w-4 h-4" />
        )}
      </Button>
    </div>
  );
}

export default function CartTable({ cart }: { cart?: Cart }) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();
  const t = useTranslations("Cart");
  const tc = useTranslations("Common");

  const handleRemove = (productId: string) => {
    startTransition(async () => {
      const res = await removeItemFromCart(productId);
      if (!res.success) {
        toast({ description: res.message, variant: "destructive" });
      }
    });
  };

  const handleAdd = (item: CartItem) => {
    startTransition(async () => {
      const res = await addItemToCart(item);
      if (!res.success) {
        toast({ description: res.message, variant: "destructive" });
      }
    });
  };

  const itemCount = cart ? cart.items.reduce((a, c) => a + c.qty, 0) : 0;

  return (
    <>
      {/* Page header */}
      <div className="flex items-center gap-3 py-6">
        <ShoppingCart className="w-7 h-7" />
        <h1 className="h2-bold">{t("shoppingCart")}</h1>
        {cart && cart.items.length > 0 && (
          <span className="bg-brand-accent text-accent-foreground text-sm font-bold px-2.5 py-0.5 rounded-full">
            {itemCount}
          </span>
        )}
      </div>

      {!cart || cart.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-6">
          <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center">
            <ShoppingCart className="w-12 h-12 text-muted-foreground/50" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">{t("cartEmpty")}</h2>
            <p className="text-muted-foreground text-sm mb-6">
              {t("cartEmptyDesc")}
            </p>
            <Button asChild className="bg-brand-accent hover:bg-brand-accent-dark text-accent-foreground rounded-lg px-8 uppercase tracking-wide active:scale-[0.98] transition-all">
              <Link href="/">{tc("goShopping")}</Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
        <div className="grid lg:grid-cols-3 gap-4 md:gap-8 pb-[88px] md:pb-0">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.slug}
                className="card-premium p-4 flex gap-4 group/item"
              >
                <Link href={`/product/${item.slug}`} className="flex-shrink-0">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden bg-muted/30">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={96}
                      height={96}
                      className="object-cover w-full h-full"
                      sizes="(max-width: 768px) 80px, 96px"
                    />
                  </div>
                </Link>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link href={`/product/${item.slug}`}>
                        <h3 className="font-semibold text-sm md:text-base line-clamp-2 hover:text-brand-accent transition-colors">
                          {item.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {formatCurrency(item.price)} {t("each")}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemove(item.productId)}
                      className="text-muted-foreground/50 hover:text-destructive hover:bg-destructive/5 transition-colors w-11 h-11 -m-2 flex items-center justify-center flex-shrink-0 rounded-md"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <QuantityControls
                      item={item}
                      isPending={isPending}
                      onRemove={() => handleRemove(item.productId)}
                      onAdd={() => handleAdd(item)}
                    />
                    <span className="font-bold text-lg">
                      {formatCurrency(Number(item.price) * item.qty)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary sidebar */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="card-premium p-6 space-y-5">
              <h2 className="font-bold text-lg">{t("orderSummary")}</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("subtotal", { count: itemCount })}
                  </span>
                  <span className="font-semibold">{formatCurrency(cart.itemsPrice)}</span>
                </div>
                {Number(cart.discountAmount) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>{t("discount")}</span>
                    <span>-{formatCurrency(cart.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("estimatedShipping")}</span>
                  {Number(cart.shippingPrice) > 0 ? (
                    <span className="font-medium">{formatCurrency(cart.shippingPrice)}</span>
                  ) : (
                    <span className="text-green-600 font-medium">{t("free")}</span>
                  )}
                </div>
                {Number(cart.taxPrice) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("cartTax")}</span>
                    <span className="font-medium">{formatCurrency(cart.taxPrice)}</span>
                  </div>
                )}
              </div>

              <CouponInput appliedCode={cart.couponCode} />

              <div className="divider-gradient" />

              <div className="flex justify-between items-baseline">
                <span className="font-semibold">{t("estimatedTotal")}</span>
                <span className="text-2xl font-black">{formatCurrency(cart.totalPrice)}</span>
              </div>

              <Button
                className="w-full h-12 rounded-lg bg-brand-accent hover:bg-brand-accent-dark text-accent-foreground font-semibold text-base uppercase tracking-wide active:scale-[0.98] transition-all"
                disabled={isPending}
                onClick={() => {
                  startTransition(async () => {
                    router.push("/shipping-address");
                  });
                }}
              >
                {isPending ? (
                  <Loader className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <ArrowRight className="w-5 h-5 mr-2" />
                )} {t("proceedToCheckout")}
              </Button>

              {/* Trust badges */}
              <div className="flex items-center justify-center gap-4 pt-2">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Lock className="w-3.5 h-3.5" />
                  <span>{t("secureCheckout")}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Shield className="w-3.5 h-3.5" />
                  <span>{t("buyerProtection")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile sticky checkout bar — sits above mobile-bottom-nav */}
        <div
          className="md:hidden fixed inset-x-0 z-40 bg-card border-t border-border shadow-elevated"
          style={{ bottom: "calc(68px + env(safe-area-inset-bottom, 0px))" }}
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex flex-col leading-tight min-w-0">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                {t("estimatedTotal")}
              </span>
              <span className="font-heading text-xl font-extrabold tabular-nums truncate">
                {formatCurrency(cart.totalPrice)}
              </span>
            </div>
            <Button
              className="h-11 px-5 rounded-lg bg-brand-accent hover:bg-brand-accent-dark text-accent-foreground font-semibold uppercase tracking-wide text-sm whitespace-nowrap active:scale-[0.98] transition-all flex-shrink-0"
              disabled={isPending}
              onClick={() => {
                startTransition(async () => {
                  router.push("/shipping-address");
                });
              }}
            >
              {isPending ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {t("proceedToCheckout")}
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </>
              )}
            </Button>
          </div>
        </div>
        </>
      )}
    </>
  );
}
