export default function Loading() {
  return (
    <div className="wrapper">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2 mb-6">
        <div className="h-4 w-20 bg-muted rounded animate-pulse" />
        <div className="h-4 w-4 bg-muted rounded animate-pulse" />
        <div className="h-4 w-32 bg-muted rounded animate-pulse" />
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-4 sm:gap-8 lg:gap-16">
        {/* Image Column */}
        <div className="bg-muted/20 rounded-lg border border-border/30 p-4">
          <div className="aspect-square w-full bg-muted rounded animate-pulse" />
          {/* Thumbnail row */}
          <div className="flex gap-2 mt-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="w-16 h-16 bg-muted rounded animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* Product Info Column */}
        <div className="flex flex-col gap-5">
          {/* Brand */}
          <div className="h-3 w-24 bg-muted rounded animate-pulse" />

          {/* Product name */}
          <div className="space-y-2">
            <div className="h-7 w-3/4 bg-muted rounded animate-pulse" />
            <div className="h-7 w-1/2 bg-muted rounded animate-pulse" />
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="w-4 h-4 bg-muted rounded animate-pulse"
                />
              ))}
            </div>
            <div className="h-4 w-20 bg-muted rounded animate-pulse" />
          </div>

          {/* Price/stock container */}
          <div className="bg-muted/30 rounded-lg border border-border/30 p-4 space-y-3">
            <div className="h-8 w-28 bg-muted rounded animate-pulse" />
            <div className="h-4 w-20 bg-muted rounded animate-pulse" />
          </div>

          {/* Add to cart button */}
          <div className="h-12 w-full bg-muted rounded animate-pulse" />

          {/* Trust signals */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-muted/30 border border-border/50"
              >
                <div className="w-5 h-5 bg-muted rounded animate-pulse" />
                <div className="h-3 w-16 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="h-px w-full bg-muted rounded animate-pulse" />

          {/* Description lines */}
          <div className="space-y-2">
            <div className="h-4 w-full bg-muted rounded animate-pulse" />
            <div className="h-4 w-full bg-muted rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Reviews section */}
      <div className="mt-16 space-y-4">
        <div className="h-px w-full bg-muted rounded animate-pulse" />
        <div className="h-3 w-16 bg-muted rounded animate-pulse" />
        <div className="h-6 w-32 bg-muted rounded animate-pulse" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2 p-4 rounded-lg border border-border/30">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              </div>
              <div className="h-4 w-full bg-muted rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
