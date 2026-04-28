import ProductPrice from "@/components/shared/product/product-price";
import { getProductBySlug } from "@/lib/actions/product.actions";
import { notFound } from "next/navigation";
import ProductImages from "@/components/shared/product/product-images";
import AddToCart from "@/components/shared/product/add-to-cart";
import { getMyCart } from "@/lib/actions/cart.actions";
import { Cart } from "@/types";
import ReviewList from "./review-list";
import { getReviews } from "@/lib/actions/review-actions";
import { getAuthSession } from "@/lib/auth-session";
import Rating from "@/components/shared/product/rating";
import { getTranslations } from "next-intl/server";
import Breadcrumb from "@/components/shared/breadcrumb";
import ScrollFadeIn from "@/components/shared/scroll-fade-in";
import RelatedProducts from "@/components/shared/product/related-products";
import WishlistButton from "@/components/shared/product/wishlist-button";
import ProductDetailTabs from "@/components/shared/product/product-detail-tabs";
import SkuChip from "@/components/shared/product/sku-chip";
import StickyAddToCartBar from "@/components/shared/product/sticky-add-to-cart-bar";
import { Truck, Shield, RotateCcw } from "lucide-react";

// Synthetic SKU display from product UUID
function formatSku(id: string): string {
  const clean = id.replace(/-/g, "").toUpperCase();
  return `${clean.slice(0, 4)}-${clean.slice(4, 8)}`;
}

export const dynamic = "force-dynamic";

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);
  if (!product) {
    const t = await getTranslations("NotFound");
    return { title: t("title") };
  }

  return {
    title: product.name,
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 160),
      images: product.images[0] ? [{ url: product.images[0] }] : [],
    },
  };
}

export default async function ProductDetailsPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);
  if (!product) {
    notFound();
  }

  const [session, cart, reviewsData] = await Promise.all([
    getAuthSession(),
    getMyCart(),
    getReviews({ productId: product.id, page: 1, limit: 10 }),
  ]);
  const userId = session?.user?.id;

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
          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-4 sm:gap-8 lg:gap-12">
            {/* Image Column — bordered plate, blueprint backdrop */}
            <div className="lg:sticky lg:top-24 lg:self-start bg-card border border-border bg-blueprint-grid-sm relative">
              {/* Stencil corner brackets */}
              <div className="absolute top-2 left-2 h-4 w-4 border-t-2 border-l-2 border-accent z-10" aria-hidden="true" />
              <div className="absolute top-2 right-2 h-4 w-4 border-t-2 border-r-2 border-accent z-10" aria-hidden="true" />
              <div className="absolute bottom-2 left-2 h-4 w-4 border-b-2 border-l-2 border-accent z-10" aria-hidden="true" />
              <div className="absolute bottom-2 right-2 h-4 w-4 border-b-2 border-r-2 border-accent z-10" aria-hidden="true" />
              <div className="p-5">
                <ProductImages images={product.images} />
              </div>
            </div>

            {/* Product Info Column */}
            <div className="flex flex-col gap-6">
              {/* Brand · Category strip */}
              <div className="flex items-center gap-3 pb-3 border-b border-border flex-wrap">
                <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-accent">
                  ▲ {product.brand}
                </span>
                <span className="h-3 w-px bg-border" />
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  {product.category}
                </span>
                <SkuChip label="SKU" value={formatSku(product.id)} className="ml-auto" />
              </div>

              {/* Product name + wishlist */}
              <div className="flex flex-col-reverse sm:flex-row items-start justify-between gap-4">
                <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase leading-[1.05]" style={{ letterSpacing: "-0.02em" }}>
                  {product.name}
                </h1>
                <div className="flex-shrink-0 mt-1 border border-border p-2 bg-card">
                  <WishlistButton productId={product.id} />
                </div>
              </div>

              {/* Rating + reviews */}
              <div className="flex items-center gap-3 flex-wrap">
                <Rating value={Number(product.rating)} />
                <a href="#reviews" className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground hover:text-accent transition-colors">
                  {t("numReviews", { count: product.numReviews })}
                </a>
                <span className="text-border hidden sm:inline">|</span>
                <a href="#reviews" className="font-mono text-[11px] uppercase tracking-[0.12em] text-accent hover:text-accent/70 transition-colors">
                  {t("writeReview")} →
                </a>
              </div>

              {/* Price/stock — workshop spec plate */}
              <div className="bg-card border border-border">
                <div className="flex items-stretch border-b border-border">
                  <div className="px-4 py-2 bg-foreground text-background flex items-center">
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">PRICE</span>
                  </div>
                  <div className="flex items-baseline gap-3 px-4 py-2 flex-1">
                    <ProductPrice
                      value={Number(product.price)}
                      className="font-heading text-3xl sm:text-4xl font-extrabold tabular-nums"
                    />
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{t("vatIncluded")}</span>
                  </div>
                </div>

                {/* Stock status */}
                <div className="flex items-center gap-2.5 px-4 py-3">
                  {product.stock > 5 ? (
                    <>
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full bg-success opacity-75" />
                        <span className="relative inline-flex h-2.5 w-2.5 bg-success" />
                      </span>
                      <span className="font-mono text-[11px] uppercase tracking-[0.16em] font-bold text-success">{t("inStock")}</span>
                    </>
                  ) : product.stock > 0 ? (
                    <>
                      <span className="inline-flex h-2.5 w-2.5 bg-warning" />
                      <span className="font-mono text-[11px] uppercase tracking-[0.16em] font-bold text-warning">▲ {t("lowStock", { count: product.stock })}</span>
                    </>
                  ) : (
                    <>
                      <span className="inline-flex h-2.5 w-2.5 bg-destructive" />
                      <span className="font-mono text-[11px] uppercase tracking-[0.16em] font-bold text-destructive">▲ {t("outOfStock")}</span>
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

              {/* Trust signals — workshop plates */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-border">
                {[
                  { icon: Truck, label: tv("freeShipping") },
                  { icon: Shield, label: tv("securePayment") },
                  { icon: RotateCcw, label: tv("easyReturns") },
                ].map((item, i) => (
                  <div
                    key={item.label}
                    className="flex flex-col items-center text-center gap-2 p-4 bg-card hover:bg-muted/40 transition-colors"
                  >
                    <item.icon className="w-5 h-5 text-accent stroke-[1.75]" />
                    <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] leading-tight">
                      0{i + 1} · {item.label}
                    </span>
                  </div>
                ))}
              </div>

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
        <section id="reviews" className="mt-20 scroll-mt-24 pt-10 border-t border-border">
          <div className="text-stamp text-accent mb-2 hazard-mark">{t("reviews")}</div>
          <h2 className="h2-bold mb-6">{t("reviews")}</h2>
          <ReviewList
            userId={userId || ""}
            productId={product.id}
            productSlug={product.slug}
            initialReviews={reviewsData.data}
            initialTotalPages={reviewsData.totalPages}
          />
        </section>
      </ScrollFadeIn>

      {/* Related Products */}
      <div className="-mx-5 md:-mx-10">
        <div className="bg-muted/30 border-y border-border py-14 mt-20">
          <div className="wrapper">
            <div className="text-stamp text-accent mb-2 hazard-mark">{t("youMayAlsoLike")}</div>
            <RelatedProducts category={product.category} excludeId={product.id} />
          </div>
        </div>
      </div>

      {/* Sticky add-to-cart bar — appears on scroll past initial CTA */}
      <StickyAddToCartBar product={product} cart={cart as Cart | undefined} />
    </div>
  );
}
