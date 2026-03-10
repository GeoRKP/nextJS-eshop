export default function Loading() {
  return (
    <div className="w-full">
      <div className="mb-8">
        {/* Logo (mobile) */}
        <div className="h-16 w-16 bg-muted rounded animate-pulse mb-6 lg:hidden" />
        {/* Title */}
        <div className="h-7 w-52 bg-muted rounded animate-pulse" />
        {/* Subtitle */}
        <div className="h-4 w-72 bg-muted rounded animate-pulse mt-2" />
      </div>

      {/* Form fields */}
      <div className="space-y-5">
        {/* Name field */}
        <div className="space-y-2">
          <div className="h-4 w-14 bg-muted rounded animate-pulse" />
          <div className="h-10 w-full bg-muted rounded animate-pulse" />
        </div>

        {/* Email field */}
        <div className="space-y-2">
          <div className="h-4 w-16 bg-muted rounded animate-pulse" />
          <div className="h-10 w-full bg-muted rounded animate-pulse" />
        </div>

        {/* Password field */}
        <div className="space-y-2">
          <div className="h-4 w-20 bg-muted rounded animate-pulse" />
          <div className="h-10 w-full bg-muted rounded animate-pulse" />
        </div>

        {/* Confirm password field */}
        <div className="space-y-2">
          <div className="h-4 w-32 bg-muted rounded animate-pulse" />
          <div className="h-10 w-full bg-muted rounded animate-pulse" />
        </div>

        {/* Submit button */}
        <div className="h-11 w-full bg-muted rounded animate-pulse" />

        {/* Divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="h-px flex-1 bg-muted animate-pulse" />
          <div className="h-4 w-8 bg-muted rounded animate-pulse" />
          <div className="h-px flex-1 bg-muted animate-pulse" />
        </div>

        {/* Sign in link */}
        <div className="flex justify-center">
          <div className="h-4 w-52 bg-muted rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
