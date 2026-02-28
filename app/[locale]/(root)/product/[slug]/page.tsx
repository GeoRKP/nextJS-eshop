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
import ProductDetailTabs from "@/components/shared/product/product-detail-tabs";
import { isInWishlist } from "@/lib/actions/wishlist.actions";
import { Truck, Shield, RotateCcw } from "lucide-react";

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
          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-16">
            {/* Image Column */}
            <div className="lg:sticky lg:top-24 lg:self-start bg-muted/20 rounded-lg border border-border/30 p-4">
              <ProductImages images={product.images} />
            </div>

            {/* Product Info Column */}
            <div className="flex flex-col gap-5">
              {/* Brand label */}
              <div className="text-label text-brand-accent">
                {product.brand}
              </div>

              {/* Product name + wishlist */}
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
                  {product.name}
                </h1>
                <div className="flex-shrink-0 mt-1 rounded-lg border border-border/50 p-2">
                  <WishlistButton productId={product.id} isInWishlist={inWishlist} />
                </div>
              </div>

              {/* Rating + reviews link + write review */}
              <div className="flex items-center gap-3 flex-wrap">
                <Rating value={Number(product.rating)} />
                <a href="#reviews" className="text-sm text-muted-foreground hover:text-brand-accent transition-colors">
                  {t("numReviews", { count: product.numReviews })}
                </a>
                <span className="text-border">|</span>
                <a href="#reviews" className="text-sm text-brand-accent hover:text-brand-accent-dark transition-colors font-medium">
                  {t("writeReview")}
                </a>
              </div>

              {/* Price/stock container */}
              <div className="bg-muted/30 rounded-lg border border-border/30 p-4 space-y-3">
                {/* Price */}
                <div className="flex items-baseline gap-2">
                  <ProductPrice
                    value={Number(product.price)}
                    className="text-3xl font-black"
                  />
                  <span className="text-xs text-muted-foreground">{t("vatIncluded")}</span>
                </div>

                {/* Stock status */}
                <div className="flex items-center gap-2">
                  {product.stock > 5 ? (
                    <>
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                      </span>
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">{t("inStock")}</span>
                    </>
                  ) : product.stock > 0 ? (
                    <>
                      <span className="inline-flex rounded-full h-2.5 w-2.5 bg-orange-500" />
                      <span className="text-sm font-medium text-orange-600 dark:text-orange-400">{t("lowStock", { count: product.stock })}</span>
                    </>
                  ) : (
                    <>
                      <span className="inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                      <span className="text-sm font-medium text-destructive">{t("outOfStock")}</span>
                    </>
                  )}
                </div>
              </div>

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
                    className="flex flex-col items-center text-center gap-1.5 p-3 rounded-lg bg-card border border-border/50"
                  >
                    <item.icon className="w-5 h-5 text-brand-accent" />
                    <span className="text-[11px] font-medium leading-tight">{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div className="divider-gradient" />

              {/* Tabs: Description + Specifications */}
              <ProductDetailTabs
                description={product.description}
                slug={product.slug}
                brand={product.brand}
                category={product.category}
                stock={product.stock}
              />
            </div>
          </div>
        </section>
      </ScrollFadeIn>

      {/* Reviews Section */}
      <ScrollFadeIn>
        <section id="reviews" className="mt-16 scroll-mt-24">
          <div className="divider-gradient mb-8" />
          <div className="text-label text-muted-foreground mb-2">{t("reviews")}</div>
          <h2 className="h2-bold mb-6">{t("reviews")}</h2>
          <ReviewList userId={userId || ""} productId={product.id} productSlug={product.slug} />
        </section>
      </ScrollFadeIn>

      {/* Related Products */}
      <div className="-mx-5 md:-mx-10">
        <div className="bg-muted/20 border-y border-border/30 py-12 mt-16">
          <div className="wrapper">
            <div className="text-label text-muted-foreground mb-2">{t("youMayAlsoLike")}</div>
            <RelatedProducts category={product.category} excludeId={product.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
