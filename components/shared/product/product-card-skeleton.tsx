import { memo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function ProductCardSkeleton() {
  return (
    <div className="w-full card-premium overflow-hidden rounded-none">
      <Skeleton className="aspect-square md:aspect-[4/3] w-full rounded-none border-b border-border" />
      <div className="p-3.5 grid gap-2">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-2.5 w-16 rounded-none" />
          <Skeleton className="h-2.5 w-12 rounded-none" />
        </div>
        <div className="grid gap-1.5 min-h-[2.6em]">
          <Skeleton className="h-3.5 w-full rounded-none" />
          <Skeleton className="h-3.5 w-3/4 rounded-none" />
        </div>
        <Skeleton className="h-3.5 w-24 rounded-none" />
        <div className="border-t border-dashed border-border pt-3 mt-1 flex items-center justify-between gap-2">
          <Skeleton className="h-7 w-20 rounded-none" />
          <Skeleton className="h-9 w-9 rounded-none" />
        </div>
      </div>
    </div>
  );
}

export default memo(ProductCardSkeleton);
