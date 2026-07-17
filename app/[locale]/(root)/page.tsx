import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import ValuePropositions from "@/components/shared/value-propositions";
import CategoryCards from "@/components/shared/category-cards";
import PromoBanner from "@/components/shared/promo-banner";
import TestimonialStrip from "@/components/shared/testimonial-strip";
import HomepageNewsletter from "@/components/shared/homepage-newsletter";
import ScrollFadeIn from "@/components/shared/scroll-fade-in";
import ProductCardSkeleton from "@/components/shared/product/product-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";
import {
  HeroWithData,
  TrendingProducts,
  LatestProducts,
  BrandShowcaseWithData,
} from "./homepage-sections";

export async function generateMetadata() {
  const t = await getTranslations("HomePage");
  return {
    title: `${APP_NAME} — ${t("latestProducts")}`,
    description: APP_DESCRIPTION,
  };
}

function HeroSkeleton() {
  return <Skeleton className="w-full h-[clamp(360px,58svh,660px)]" />;
}

function CategoryCardsSkeleton() {
  return (
    <div className="my-10">
      <Skeleton className="h-6 w-48 mb-6" />
      <div className="grid grid-cols-2 lg:grid-cols-12 gap-4 auto-rows-[200px]">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="rounded-xl lg:col-span-3" />
        ))}
      </div>
    </div>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="my-10">
      <Skeleton className="h-6 w-48 mb-6" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4 2xl:gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

const HomePage = async () => {
  return (
    <>
      {/* 1. Hero Carousel */}
      <Suspense fallback={<HeroSkeleton />}>
        <HeroWithData />
      </Suspense>

      {/* 2. Trust Bar */}
      <ValuePropositions />

      {/* 3. Category Cards */}
      <div className="wrapper">
        <Suspense fallback={<CategoryCardsSkeleton />}>
          <ScrollFadeIn>
            <CategoryCards />
          </ScrollFadeIn>
        </Suspense>
      </div>

      {/* 4. Trending Products */}
      <Suspense fallback={<div className="wrapper"><ProductGridSkeleton /></div>}>
        <TrendingProducts />
      </Suspense>

      {/* 5. Split Promo Banner */}
      <ScrollFadeIn>
        <PromoBanner />
      </ScrollFadeIn>

      {/* 6. Latest Products Grid */}
      <Suspense fallback={<div className="wrapper"><ProductGridSkeleton /></div>}>
        <LatestProducts />
      </Suspense>

      {/* 7. Brand Showcase */}
      <Suspense fallback={null}>
        <BrandShowcaseWithData />
      </Suspense>

      {/* 8. Testimonials */}
      <ScrollFadeIn>
        <TestimonialStrip />
      </ScrollFadeIn>

      {/* 9. Newsletter CTA */}
      <ScrollFadeIn>
        <HomepageNewsletter />
      </ScrollFadeIn>
    </>
  );
};

export default HomePage;
