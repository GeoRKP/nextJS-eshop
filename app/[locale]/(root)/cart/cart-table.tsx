"use client";
import { useRouter } from "@/i18n/navigation";
import { useToast } from "@/hooks/use-toast";
import { useTransition } from "react";
import { addItemToCart, removeItemFromCart } from "@/lib/actions/cart.actions";
import { Loader, ArrowRight, Minus, Plus } from "lucide-react";
import { Cart, CartItem } from "@/types";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import AnimatedButton from "@/components/shared/animated-button";
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
    <div className="flex items-center gap-2">
      <Button
        disabled={isPending}
        variant="outline"
        size="icon"
        type="button"
        className="w-8 h-8"
        onClick={onRemove}
      >
        {isPending ? (
          <Loader className="w-4 h-4 animate-spin" />
        ) : (
          <Minus className="w-4 h-4" />
        )}
      </Button>
      <span className="w-6 text-center font-medium">{item.qty}</span>
      <Button
        disabled={isPending}
        variant="outline"
        size="icon"
        type="button"
        className="w-8 h-8"
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

  return (
    <>
      <h1 className="py-4 h2-bold">{t("shoppingCart")}</h1>
      {!cart || cart.items.length === 0 ? (
        <div>
          {t("cartEmpty")} <Link href="/">{tc("goShopping")}</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-4 md:gap-5">
          <div className="md:col-span-3">
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left">{t("item")}</TableHead>
                    <TableHead className="text-center">{t("quantity")}</TableHead>
                    <TableHead className="text-right">{t("price")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cart.items.map((item) => (
                    <TableRow key={item.slug}>
                      <TableCell>
                        <Link
                          href={`/product/${item.slug}`}
                          className="flex items-center"
                        >
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={50}
                            height={50}
                          />
                          <span className="px-2">{item.name}</span>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center">
                          <QuantityControls
                            item={item}
                            isPending={isPending}
                            onRemove={() => handleRemove(item.productId)}
                            onAdd={() => handleAdd(item)}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.price)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile card list */}
            <div className="md:hidden space-y-3">
              {cart.items.map((item) => (
                <Card key={item.slug}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <Link href={`/product/${item.slug}`} className="shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={80}
                          height={80}
                          className="rounded-md object-cover"
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link href={`/product/${item.slug}`}>
                          <h3 className="font-medium text-sm line-clamp-2">
                            {item.name}
                          </h3>
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatCurrency(item.price)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t">
                      <QuantityControls
                        item={item}
                        isPending={isPending}
                        onRemove={() => handleRemove(item.productId)}
                        onAdd={() => handleAdd(item)}
                      />
                      <span className="font-semibold text-sm">
                        {formatCurrency(Number(item.price) * item.qty)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card>
            <CardContent className="p-4 gap-4 space-y-3">
              <div className="pb-3 text-xl">
                {t("subtotal", { count: cart.items.reduce((a, c) => a + c.qty, 0) })} :
                <span className="font-bold">
                  {formatCurrency(cart.itemsPrice)}
                </span>
              </div>
              {Number(cart.discountAmount) > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>{t("discount")}</span>
                  <span>-{formatCurrency(cart.discountAmount)}</span>
                </div>
              )}
              <CouponInput appliedCode={cart.couponCode} />
              <AnimatedButton>
                <Button
                  className="w-full"
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
                    <ArrowRight className="w-4 h-4" />
                  )} {t("proceedToCheckout")}
                </Button>
              </AnimatedButton>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
