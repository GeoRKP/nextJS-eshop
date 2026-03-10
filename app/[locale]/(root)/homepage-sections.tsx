import ProductCard from "@/components/shared/product/product-card";
import ProductList from "@/components/shared/product/product-list";
import ProductScrollSection, {
  ProductScrollItem,
} from "@/components/shared/product/product-scroll-section";
import {
  getLatestProducts,
  getFeaturedProducts,
} from "@/lib/actions/product.actions";
import { getAllBrands } from "@/lib/actions/brand.actions";
import HeroSection from "@/components/shared/hero-section";
import BrandShowcase from "@/components/shared/brand-showcase";
import ScrollFadeIn from "@/components/shared/scroll-fade-in";
import { getTranslations } from "next-intl/server";

export async function HeroWithData() {
  const featuredProducts = await getFeaturedProducts();
  if (featuredProducts.length === 0) return null;
  return <HeroSection products={featuredProducts} />;
}

export async function TrendingProducts() {
  const [featuredProducts, tHome] = await Promise.all([
    getFeaturedProducts(),
    getTranslations("HomePage"),
  ]);
  if (featuredProducts.length === 0) return null;
  return (
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
              <ProductCard product={product} />
            </ProductScrollItem>
          ))}
        </ProductScrollSection>
      </ScrollFadeIn>
    </div>
  );
}

export async function LatestProducts() {
  const [latestProducts, tHome] = await Promise.all([
    getLatestProducts(8),
    getTranslations("HomePage"),
  ]);
  return (
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
  );
}

export async function BrandShowcaseWithData() {
  const brands = await getAllBrands();
  if (brands.length === 0) return null;
  return (
    <ScrollFadeIn>
      <BrandShowcase brands={brands} />
    </ScrollFadeIn>
  );
}
