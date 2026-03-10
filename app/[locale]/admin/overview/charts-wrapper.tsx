"use client";

import dynamic from "next/dynamic";

const Charts = dynamic(() => import("./charts"), {
  ssr: false,
  loading: () => (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="card-premium col-span-4 h-[400px] animate-pulse bg-muted/50 rounded-lg" />
        <div className="card-premium col-span-3 h-[400px] animate-pulse bg-muted/50 rounded-lg" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="card-premium col-span-4 h-[400px] animate-pulse bg-muted/50 rounded-lg" />
        <div className="card-premium col-span-3 h-[400px] animate-pulse bg-muted/50 rounded-lg" />
      </div>
    </div>
  ),
});

export default Charts;
