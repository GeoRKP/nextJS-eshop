import { Badge } from "@/components/ui/badge";
import ProductPrice from "@/components/shared/product/product-price";
import { getProductBySlug } from "@/lib/actions/product.actions";
import { notFound } from "next/navigation";
import ProductImages from "@/components/shared/product/product-images";
import AddToCart from "@/components/shared/product/add-to-cart";
import { getMyCart } from "@/lib/actions/cart.actions";
import { Cart } from "@/types";
import ReviewList from "./review-list";
import { auth } from "@/auth";
import Rating from "@/components/shared/product/rating";
import { getTranslations } from "next-intl/server";
import Breadcrumb from "@/components/shared/breadcrumb";
import ScrollFadeIn from "@/components/shared/scroll-fade-in";
import RelatedProducts from "@/components/shared/product/related-products";
import WishlistButton from "@/components/shared/product/wishlist-button";
import { isInWishlist } from "@/lib/actions/wishlist.actions";
import { CheckCircle2, AlertTriangle, XCircle, Truck, Shield, RotateCcw } from "lucide-react";

export default async function ProductDetailsPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);
  if (!product) {
    notFound();
  }

  const session = await auth();
  const userId = session?.user?.id;

  const cart = await getMyCart();
  const inWishlist = await isInWishlist(product.id);

  const t = await getTranslations("Product");
  const tv = await getTranslations("ValueProps");

  const isLongDescription = product.description && product.description.length > 200;

  return (
    <div className="wrapper">
      <Breadcrumb
        items={[
          { label: product.category, href: `/search?category=${product.category}` },
          { label: product.name },
        ]}
      />
      <ScrollFadeIn>
        <section>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            {/* Image Column - Sticky */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <ProductImages images={product.images} />
            </div>

            {/* Product Info Column */}
            <div className="flex flex-col gap-6">
              {/* Brand label */}
              <div className="text-label text-brand-orange">
                {product.brand}
              </div>

              {/* Product name + wishlist */}
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
                  {product.name}
                </h1>
                <div className="flex-shrink-0 mt-1">
                  <WishlistButton productId={product.id} isInWishlist={inWishlist} />
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-3">
                <Rating value={Number(product.rating)} />
                <a href="#reviews" className="text-sm text-muted-foreground hover:text-brand-orange transition-colors">
                  {t("numReviews", { count: product.numReviews })}
                </a>
              </div>

              {/* Price section */}
              <div className="flex items-baseline gap-3">
                <ProductPrice
                  value={Number(product.price)}
                  className="text-3xl font-black"
                />
              </div>

              {/* Stock status */}
              <div>
                {product.stock > 5 ? (
                  <Badge variant="outline" className="gap-1.5 text-green-600 border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-800 py-1 px-3">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {t("inStock")}
                  </Badge>
                ) : product.stock > 0 ? (
                  <Badge variant="outline" className="gap-1.5 text-orange-600 border-orange-200 bg-orange-50 dark:bg-orange-950/30 dark:border-orange-800 py-1 px-3">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {t("lowStock", { count: product.stock })}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1.5 text-destructive border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-800 py-1 px-3">
                    <XCircle className="w-3.5 h-3.5" />
                    {t("outOfStock")}
                  </Badge>
                )}
              </div>

              {/* Divider */}
              <div className="divider-gradient" />

              {/* Description */}
              <div>
                <p className="text-sm font-semibold mb-2">{t("description")}</p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {isLongDescription ? product.description.slice(0, 200) + "..." : product.description}
                </p>
              </div>

              {/* Divider */}
              <div className="divider-gradient" />

              {/* Add to Cart */}
              {product.stock > 0 && (
                <AddToCart
                  cart={cart as Cart}
                  item={{
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    slug: product.slug,
                    qty: 1,
                    image: product.images[0],
                  }}
                />
              )}

              {/* Trust signals */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Truck, label: tv("freeShipping"), desc: tv("freeShippingDesc") },
                  { icon: Shield, label: tv("securePayment"), desc: tv("securePaymentDesc") },
                  { icon: RotateCcw, label: tv("easyReturns"), desc: tv("easyReturnsDesc") },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-col items-center text-center gap-1.5 p-3 rounded-xl bg-muted/50 border border-border/50"
                  >
                    <item.icon className="w-5 h-5 text-muted-foreground" />
                    <span className="text-[11px] font-medium leading-tight">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </ScrollFadeIn>

      {/* Reviews Section */}
      <ScrollFadeIn>
        <section id="reviews" className="mt-16 scroll-mt-24">
          <div className="divider-gradient mb-8" />
          <h2 className="section-header">{t("reviews")}</h2>
          <ReviewList userId={userId || ""} productId={product.id} productSlug={product.slug} />
        </section>
      </ScrollFadeIn>

      <RelatedProducts category={product.category} excludeId={product.id} />
    </div>
  );
}
