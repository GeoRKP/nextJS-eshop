import { Skeleton } from "@/components/ui/skeleton";
import ProductCardSkeleton from "@/components/shared/product/product-card-skeleton";

export default function SearchLoading() {
  return (
    <div className="wrapper">
      <div className="grid md:grid-cols-5 md:gap-5">
        {/* Filter sidebar skeleton */}
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-6 w-24" />
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton key={j} className="h-4 w-32" />
              ))}
            </div>
          ))}
        </div>
        {/* Product grid skeleton */}
        <div className="md:col-span-4 space-y-4">
          <div className="flex justify-between items-center my-4">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-36" />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
