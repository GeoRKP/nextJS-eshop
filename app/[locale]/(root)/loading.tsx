import { Skeleton } from "@/components/ui/skeleton";
import ProductListSkeleton from "@/components/shared/product/product-list-skeleton";

export default function HomeLoading() {
  return (
    <>
      {/* Hero skeleton */}
      <Skeleton className="w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-none" />

      <div className="wrapper">
        {/* Value props skeleton */}
        <div className="border-y my-8 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Categories skeleton */}
        <div className="my-10">
          <Skeleton className="h-8 w-56 mb-6" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
        </div>

        {/* Product list skeleton */}
        <ProductListSkeleton count={4} />

        {/* View all button skeleton */}
        <div className="flex justify-center my-8">
          <Skeleton className="h-11 w-48 rounded-md" />
        </div>
      </div>
    </>
  );
}
