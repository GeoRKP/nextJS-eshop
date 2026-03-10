import { memo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function ProductCardSkeleton() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="p-0">
        <Skeleton className="aspect-square w-full rounded-b-none" />
      </CardHeader>
      <CardContent className="p-4 grid gap-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      </CardContent>
    </Card>
  );
}

export default memo(ProductCardSkeleton);
