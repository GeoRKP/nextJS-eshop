export default function Loading() {
  return (
    <div className="wrapper">
      {/* Checkout steps skeleton */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
            <div className="h-4 w-20 bg-muted rounded animate-pulse hidden sm:block" />
            {i < 3 && <div className="h-px w-8 bg-muted animate-pulse" />}
          </div>
        ))}
      </div>

      {/* Title */}
      <div className="h-7 w-48 bg-muted rounded animate-pulse mb-6" />

      {/* 3-column grid */}
      <div className="grid lg:grid-cols-3 gap-4 md:gap-8">
        {/* Left: Details */}
        <div className="lg:col-span-2 space-y-4">
          {/* Shipping Address Card */}
          <div className="rounded-lg border border-border/30 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                <div className="h-5 w-36 bg-muted rounded animate-pulse" />
              </div>
              <div className="h-4 w-12 bg-muted rounded animate-pulse" />
            </div>
            <div className="space-y-1.5 pl-6">
              <div className="h-4 w-40 bg-muted rounded animate-pulse" />
              <div className="h-4 w-56 bg-muted rounded animate-pulse" />
              <div className="h-4 w-32 bg-muted rounded animate-pulse" />
            </div>
          </div>

          {/* Payment Method Card */}
          <div className="rounded-lg border border-border/30 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-muted rounded animate-pulse" />
              <div className="h-5 w-36 bg-muted rounded animate-pulse" />
            </div>
            <div className="h-4 w-24 bg-muted rounded animate-pulse pl-6" />
          </div>

          {/* Order Items Card */}
          <div className="rounded-lg border border-border/30 p-5 space-y-4">
            <div className="h-5 w-28 bg-muted rounded animate-pulse" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-muted rounded-lg animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                </div>
                <div className="h-4 w-16 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Order Summary */}
        <div>
          <div className="rounded-lg border border-border/30 p-6 space-y-4">
            <div className="h-6 w-32 bg-muted rounded animate-pulse" />

            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                </div>
              ))}
            </div>

            <div className="h-px w-full bg-muted animate-pulse" />

            <div className="flex justify-between items-baseline">
              <div className="h-5 w-16 bg-muted rounded animate-pulse" />
              <div className="h-8 w-24 bg-muted rounded animate-pulse" />
            </div>

            {/* Place order button */}
            <div className="h-11 w-full bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
