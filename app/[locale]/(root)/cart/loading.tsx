import { Skeleton } from "@/components/ui/skeleton";

export default function CartLoading() {
  return (
    <div className="wrapper">
      {/* Page header */}
      <div className="flex items-center gap-3 py-6">
        <Skeleton className="w-7 h-7 rounded" />
        <Skeleton className="h-8 w-48" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 md:gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="card-premium p-4 flex gap-4"
            >
              <Skeleton className="w-20 h-20 md:w-24 md:h-24 rounded-lg flex-shrink-0" />
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <div className="flex items-center justify-between mt-3">
                  <Skeleton className="h-9 w-28 rounded-lg" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary sidebar */}
        <div>
          <div className="card-premium p-6 space-y-5">
            <Skeleton className="h-6 w-40" />
            <div className="space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
            <Skeleton className="h-px w-full" />
            <div className="flex justify-between items-baseline">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-8 w-20" />
            </div>
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
