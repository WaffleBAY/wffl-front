export function CompactCardSkeleton() {
  return (
    <div className="flex gap-3 p-3 rounded-lg border bg-card">
      {/* Thumbnail placeholder */}
      <div className="w-16 h-16 shrink-0 rounded-md bg-muted animate-pulse" />

      {/* Content placeholders */}
      <div className="flex-1 flex flex-col justify-center gap-2">
        <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
        <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
        <div className="h-3 w-1/3 bg-muted rounded animate-pulse" />
      </div>
    </div>
  );
}
