import { Skeleton } from "@/components/ui/skeleton";
import ProductCardSkeleton from "./product-card-skeleton";

export default function ProductListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="my-10">
      <Skeleton className="h-8 w-48 mb-4" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-2.5 md:gap-4 2xl:gap-5">
        {Array.from({ length: count }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
