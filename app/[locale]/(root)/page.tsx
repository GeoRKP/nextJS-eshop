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
import ScrollFadeIn from "@/components/shared/scroll-fade-in";

const HomePage = async () => {
  const [latestProducts, featuredProducts, brands] = await Promise.all([
    getLatestProducts(8),
    getFeaturedProducts(),
    getAllBrands(),
  ]);
  const tHome = await getTranslations("HomePage");

  return (
    <>
      {/* 1. Hero Carousel - Full-width cinematic */}
      {featuredProducts.length > 0 && (
        <HeroSection products={featuredProducts} />
      )}

      {/* 2. Value Propositions - Full-width dark strip */}
      <ValuePropositions />

      {/* 3. Shop by Category - Bento grid */}
      <div className="wrapper">
        <ScrollFadeIn>
          <CategoryCards />
        </ScrollFadeIn>
      </div>

      {/* 4. Trending Products - Horizontal carousel */}
      {featuredProducts.length > 0 && (
        <div className="wrapper">
          <ScrollFadeIn>
            <ProductScrollSection
              title={tHome("trendingProducts")}
              count={featuredProducts.length}
              viewAllLabel={tHome("viewAll")}
              viewAllHref="/search"
            >
              {featuredProducts.map((product) => (
                <ProductScrollItem key={product.id}>
                  <ProductCard product={product} />
                </ProductScrollItem>
              ))}
            </ProductScrollSection>
          </ScrollFadeIn>
        </div>
      )}

      {/* 5. Promo Banner - Full-width dark-to-orange gradient */}
      <ScrollFadeIn>
        <PromoBanner />
      </ScrollFadeIn>

      {/* 6. Brand Showcase - Carousel */}
      {brands.length > 0 && (
        <div className="wrapper">
          <ScrollFadeIn>
            <BrandShowcase brands={brands} />
          </ScrollFadeIn>
        </div>
      )}

      {/* 7. Latest Products Grid */}
      <div className="wrapper">
        <ScrollFadeIn>
          <ProductList
            data={latestProducts}
            title={tHome("latestProducts")}
            limit={8}
          />
        </ScrollFadeIn>
      </div>

      {/* 8. View All Products */}
      <div className="wrapper">
        <ScrollFadeIn>
          <ViewAllProductsButton />
        </ScrollFadeIn>
      </div>
    </>
  );
};

export default HomePage;
