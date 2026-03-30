export default function AdminTournoiSectionLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 space-y-6">
      <div className="h-8 w-56 animate-pulse rounded-md bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-xl border bg-card p-4">
            <div className="h-3 w-28 animate-pulse rounded bg-muted" />
            <div className="mt-3 h-6 w-20 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border bg-card p-6">
        <div className="h-4 w-40 animate-pulse rounded bg-muted" />
        <div className="mt-4 h-40 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
