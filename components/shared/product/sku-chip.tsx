"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

type Props = {
  label?: string;
  value: string;
  className?: string;
};

/**
 * Mono SKU/OEM/code chip with copy-to-clipboard.
 * Signature element of the workshop-manual aesthetic — clean, mechanical, useful.
 */
export default function SkuChip({ label = "SKU", value, className = "" }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={`Copy ${label}`}
      className={`group inline-flex items-center gap-2 px-2.5 py-1 border border-border bg-card hover:border-foreground hover:bg-muted/50 transition-all font-mono text-[11px] tracking-[0.05em] ${className}`}
    >
      <span className="text-muted-foreground uppercase font-bold tracking-[0.14em]">
        {label}
      </span>
      <span className="text-foreground font-medium">{value}</span>
      <span className="ml-1 text-muted-foreground group-hover:text-accent transition-colors">
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      </span>
    </button>
  );
}
