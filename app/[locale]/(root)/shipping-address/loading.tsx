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

      {/* Form card */}
      <div className="max-w-lg mx-auto space-y-6">
        <div className="h-7 w-48 bg-muted rounded animate-pulse" />

        {/* Full Name field */}
        <div className="space-y-2">
          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
          <div className="h-10 w-full bg-muted rounded animate-pulse" />
        </div>

        {/* Address field */}
        <div className="space-y-2">
          <div className="h-4 w-20 bg-muted rounded animate-pulse" />
          <div className="h-10 w-full bg-muted rounded animate-pulse" />
        </div>

        {/* City and Postal Code row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="h-4 w-16 bg-muted rounded animate-pulse" />
            <div className="h-10 w-full bg-muted rounded animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            <div className="h-10 w-full bg-muted rounded animate-pulse" />
          </div>
        </div>

        {/* Country field */}
        <div className="space-y-2">
          <div className="h-4 w-16 bg-muted rounded animate-pulse" />
          <div className="h-10 w-full bg-muted rounded animate-pulse" />
        </div>

        {/* Submit button */}
        <div className="h-11 w-full bg-muted rounded animate-pulse" />
      </div>
    </div>
  );
}
