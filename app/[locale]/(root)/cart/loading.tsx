import { Skeleton } from "@/components/ui/skeleton";

export default function CartLoading() {
  return (
    <div className="wrapper">
      <Skeleton className="h-8 w-48 my-4" />
      <div className="grid md:grid-cols-4 md:gap-5">
        <div className="md:col-span-3 space-y-4">
          {/* Table header */}
          <div className="grid grid-cols-3 gap-4 py-3 border-b">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20 mx-auto" />
            <Skeleton className="h-4 w-16 ml-auto" />
          </div>
          {/* Table rows */}
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="grid grid-cols-3 gap-4 py-3 items-center">
              <div className="flex items-center gap-2">
                <Skeleton className="h-12 w-12 rounded" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex justify-center gap-2">
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
              <Skeleton className="h-4 w-16 ml-auto" />
            </div>
          ))}
        </div>
        {/* Summary card */}
        <div className="space-y-4 p-4 border rounded-lg">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-10 w-full rounded" />
        </div>
      </div>
    </div>
  );
}
