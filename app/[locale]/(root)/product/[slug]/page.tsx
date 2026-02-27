import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {/* Image Column */}
            <div className="md:col-span-2 ">
              <ProductImages images={product.images} />
            </div>
            {/* Details Column */}
            <div className="col-span-2 p-5">
              <div className="flex flex-col gap-6">
                <p>
                  {product.brand} {product.category}
                </p>
                <div className="flex items-center gap-2">
                  <h1 className="h3-bold">{product.name}</h1>
                  <WishlistButton productId={product.id} isInWishlist={inWishlist} />
                </div>
                <Rating value={Number(product.rating)} />
                <p>{t("numReviews", { count: product.numReviews })}</p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <ProductPrice
                    value={Number(product.price)}
                    className="w-24 rounded-full bg-green-100 text-green-700 px-5 py-2"
                  />
                </div>
              </div>
              <div className="mt-10">
                <p className="font-semibold">{t("description")}</p>
                <p>{product.description}</p>
              </div>
            </div>
            {/* Actions Column */}
            <div>
              <Card>
                <CardContent className="p-4">
                  <div className="mb-2 flex justify-between">
                    <div>{t("price")}</div>
                    <div>
                      <ProductPrice value={Number(product.price)} />
                    </div>
                  </div>
                  <div className="mb-2 flex justify-between">
                    <div>{t("status")}</div>
                    {product.stock > 0 ? (
                      <Badge variant="outline">{t("inStock")}</Badge>
                    ) : (
                      <Badge variant="destructive">{t("outOfStock")}</Badge>
                    )}
                  </div>
                  {product.stock > 0 && (
                    <div className="flex-center">
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
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </ScrollFadeIn>
      <ScrollFadeIn>
        <section className="mt-10">
          <h2 className="h2-bold">{t("reviews")}</h2>
          <ReviewList userId={userId || ""} productId={product.id} productSlug={product.slug} />
        </section>
      </ScrollFadeIn>
      <RelatedProducts category={product.category} excludeId={product.id} />
    </div>
  );
}
