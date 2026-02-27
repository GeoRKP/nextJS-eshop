import ProductList from "@/components/shared/product/product-list";
import {
  getLatestProducts,
  getFeaturedProducts,
} from "@/lib/actions/product.actions";
import ViewAllProductsButton from "@/components/view-all-products-button";
import { getTranslations } from "next-intl/server";
import HeroSection from "@/components/shared/hero-section";
import ValuePropositions from "@/components/shared/value-propositions";
import CategoryCards from "@/components/shared/category-cards";
import ScrollFadeIn from "@/components/shared/scroll-fade-in";

const HomePage = async () => {
  const latestProducts = await getLatestProducts();
  const featuredProducts = await getFeaturedProducts();
  const t = await getTranslations("Product");

  return (
    <>
      {featuredProducts.length > 0 && (
        <HeroSection product={featuredProducts[0]} />
      )}

      <div className="wrapper">
        <ScrollFadeIn>
          <ValuePropositions />
        </ScrollFadeIn>

        <ScrollFadeIn>
          <CategoryCards />
        </ScrollFadeIn>

        <ScrollFadeIn>
          <ProductList
            data={latestProducts}
            title={t("featuredProducts")}
            limit={4}
          />
        </ScrollFadeIn>

        <ScrollFadeIn>
          <ViewAllProductsButton />
        </ScrollFadeIn>
      </div>
    </>
  );
};

export default HomePage;
