"use client";

import { useRouter } from "@/i18n/navigation";
import { ArrowUpDown } from "lucide-react";

type Props = {
  options: { value: string; label: string; url: string }[];
  current: string;
};

export default function SortSelect({ options, current }: Props) {
  const router = useRouter();

  return (
    <div className="relative md:hidden">
      <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <select
        value={current}
        onChange={(e) => {
          const opt = options.find((o) => o.value === e.target.value);
          if (opt) router.push(opt.url);
        }}
        className="appearance-none bg-muted/50 border border-border/50 rounded-lg pl-9 pr-8 py-2 text-xs font-medium w-full focus:outline-none focus:ring-2 focus:ring-brand-accent/30"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <svg
        className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}
