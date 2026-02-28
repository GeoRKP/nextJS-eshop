import ProductList from "@/components/shared/product/product-list";
import ProductCard from "@/components/shared/product/product-card";
import ProductScrollSection, {
  ProductScrollItem,
} from "@/components/shared/product/product-scroll-section";
import {
  getLatestProducts,
  getFeaturedProducts,
} from "@/lib/actions/product.actions";
import { getAllBrands } from "@/lib/actions/brand.actions";
import ViewAllProductsButton from "@/components/view-all-products-button";
import { getTranslations } from "next-intl/server";
import HeroSection from "@/components/shared/hero-section";
import ValuePropositions from "@/components/shared/value-propositions";
import CategoryCards from "@/components/shared/category-cards";
import PromoBanner from "@/components/shared/promo-banner";
import BrandShowcase from "@/components/shared/brand-showcase";
import TestimonialStrip from "@/components/shared/testimonial-strip";
import HomepageNewsletter from "@/components/shared/homepage-newsletter";
import ScrollFadeIn from "@/components/shared/scroll-fade-in";
import { getWishlistProductIds } from "@/lib/actions/wishlist.actions";

const HomePage = async () => {
  const [latestProducts, featuredProducts, brands, wishlistIds] = await Promise.all([
    getLatestProducts(8),
    getFeaturedProducts(),
    getAllBrands(),
    getWishlistProductIds(),
  ]);
  const tHome = await getTranslations("HomePage");

  return (
    <>
      {/* 1. Hero Carousel — Full-width cinematic */}
      {featuredProducts.length > 0 && (
        <HeroSection products={featuredProducts} />
      )}

      {/* 2. Trust Bar — Floating card overlapping hero */}
      <ValuePropositions />

      {/* 3. Category Cards — Bento grid */}
      <div className="wrapper">
        <ScrollFadeIn>
          <CategoryCards />
        </ScrollFadeIn>
      </div>

      {/* 4. Trending Products — Horizontal carousel */}
      {featuredProducts.length > 0 && (
        <div className="wrapper">
          <ScrollFadeIn>
            <ProductScrollSection
              title={tHome("trendingProducts")}
              labelText={tHome("trendingLabel")}
              count={featuredProducts.length}
              viewAllLabel={tHome("viewAll")}
              viewAllHref="/search"
            >
              {featuredProducts.map((product) => (
                <ProductScrollItem key={product.id}>
                  <ProductCard product={product} isInWishlist={wishlistIds.has(product.id)} />
                </ProductScrollItem>
              ))}
            </ProductScrollSection>
          </ScrollFadeIn>
        </div>
      )}

      {/* 5. Split Promo Banner */}
      <ScrollFadeIn>
        <PromoBanner />
      </ScrollFadeIn>

      {/* 6. Latest Products Grid */}
      <div className="wrapper">
        <ScrollFadeIn>
          <ProductList
            data={latestProducts}
            title={tHome("latestProducts")}
            subtitle={tHome("latestLabel")}
            limit={8}
            viewAllLabel={tHome("viewAll")}
            viewAllHref="/search"
          />
        </ScrollFadeIn>
      </div>

      {/* 7. Brand Showcase — Marquee */}
      {brands.length > 0 && (
        <ScrollFadeIn>
          <BrandShowcase brands={brands} />
        </ScrollFadeIn>
      )}

      {/* 8. Testimonials */}
      <ScrollFadeIn>
        <TestimonialStrip />
      </ScrollFadeIn>

      {/* 9. Newsletter CTA */}
      <ScrollFadeIn>
        <HomepageNewsletter />
      </ScrollFadeIn>

      {/* 10. View All Products */}
      <div className="wrapper">
        <ScrollFadeIn>
          <ViewAllProductsButton />
        </ScrollFadeIn>
      </div>
    </>
  );
};

export default HomePage;
