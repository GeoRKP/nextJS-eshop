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

      {/* Payment method form */}
      <div className="max-w-lg mx-auto space-y-6">
        <div className="h-7 w-56 bg-muted rounded animate-pulse" />

        {/* Radio options */}
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-4 rounded-lg border border-border/30"
            >
              <div className="h-5 w-5 bg-muted rounded-full animate-pulse" />
              <div className="h-5 w-5 bg-muted rounded animate-pulse" />
              <div className="h-4 w-32 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Submit button */}
        <div className="h-11 w-full bg-muted rounded animate-pulse" />
      </div>
    </div>
  );
}
