export default function Loading() {
  return (
    <div className="w-full">
      <div className="relative bg-card border border-border shadow-sm">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-muted" />
        <div className="p-6 sm:p-8">
          {/* Title + subtitle */}
          <div className="h-8 w-56 bg-muted rounded animate-pulse" />
          <div className="h-4 w-64 bg-muted rounded animate-pulse mt-2" />

          {/* Form fields */}
          <div className="mt-6 space-y-5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                <div className="h-10 w-full bg-muted rounded animate-pulse" />
              </div>
            ))}
            <div className="h-11 w-full bg-muted rounded animate-pulse" />
            <div className="flex justify-center">
              <div className="h-4 w-48 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
