"use client";

export function SkeletonCard({ type = "default" }) {
  if (type === "profile") {
    return (
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="skeleton w-24 h-24 rounded-full" />
          <div className="flex-1 space-y-3 w-full">
            <div className="skeleton h-7 w-48" />
            <div className="skeleton h-4 w-72" />
            <div className="flex gap-6 mt-4">
              <div className="skeleton h-12 w-16" />
              <div className="skeleton h-12 w-16" />
              <div className="skeleton h-12 w-16" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === "heatmap") {
    return (
      <div className="card p-6">
        <div className="skeleton h-5 w-64 mb-4" />
        <div className="skeleton h-32 w-full" />
      </div>
    );
  }

  if (type === "streaks") {
    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-5 text-center space-y-2">
          <div className="skeleton h-8 w-8 mx-auto rounded-full" />
          <div className="skeleton h-8 w-12 mx-auto" />
          <div className="skeleton h-4 w-20 mx-auto" />
        </div>
        <div className="card p-5 text-center space-y-2">
          <div className="skeleton h-8 w-8 mx-auto rounded-full" />
          <div className="skeleton h-8 w-12 mx-auto" />
          <div className="skeleton h-4 w-20 mx-auto" />
        </div>
      </div>
    );
  }

  if (type === "chart") {
    return (
      <div className="card p-6">
        <div className="skeleton h-5 w-48 mb-4" />
        <div className="flex flex-col lg:flex-row items-center gap-6">
          <div className="skeleton w-48 h-48 rounded-full" />
          <div className="flex-1 w-full space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="skeleton w-3 h-3 rounded-full" />
                <div className="skeleton h-4 flex-1" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (type === "repos") {
    return (
      <div>
        <div className="skeleton h-6 w-40 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card p-5 space-y-3">
              <div className="skeleton h-5 w-32" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-2/3" />
              <div className="flex gap-4 mt-2">
                <div className="skeleton h-3 w-16" />
                <div className="skeleton h-3 w-12" />
                <div className="skeleton h-3 w-12" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "ai") {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="skeleton h-5 w-5 rounded-full" />
          <div className="skeleton h-5 w-28" />
        </div>
        <div className="space-y-2">
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-3/4" />
        </div>
      </div>
    );
  }

  // Default
  return (
    <div className="card p-6">
      <div className="skeleton h-5 w-32 mb-4" />
      <div className="skeleton h-24 w-full" />
    </div>
  );
}
