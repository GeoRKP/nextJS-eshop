"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

const PERIODS = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "this-month", label: "This month" },
  { value: "3m", label: "Last 3 months" },
  { value: "6m", label: "Last 6 months" },
  { value: "this-year", label: "This year" },
  { value: "all", label: "All time" },
] as const;

const PAYMENT_METHODS = ["Stripe", "Paypal", "CashOnDelivery"] as const;

export default function DashboardFilters({
  categories,
}: {
  categories: string[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentPeriod = searchParams.get("period") || "30d";
  const currentFrom = searchParams.get("from") || "";
  const currentTo = searchParams.get("to") || "";
  const currentPaidStatus = searchParams.get("paidStatus") || "all";
  const currentPayment = searchParams.get("paymentMethod") || "all";
  const currentCategory = searchParams.get("category") || "all";
  const hasCustomRange = !!currentFrom || !!currentTo;

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "" || value === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    const qs = params.toString();
    router.push(`/admin/overview${qs ? `?${qs}` : ""}`);
  }

  function handlePeriodChange(value: string) {
    updateParams({ period: value, from: null, to: null });
  }

  function handleDateChange(field: "from" | "to", value: string) {
    updateParams({ [field]: value || null, period: null });
  }

  function handleReset() {
    router.push("/admin/overview");
  }

  const hasFilters =
    currentPeriod !== "30d" ||
    hasCustomRange ||
    currentPaidStatus !== "all" ||
    currentPayment !== "all" ||
    currentCategory !== "all";

  return (
    <div className="flex flex-wrap items-end gap-3">
      {/* Period preset */}
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground font-medium">
          Period
        </label>
        <Select
          value={hasCustomRange ? "custom" : currentPeriod}
          onValueChange={handlePeriodChange}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERIODS.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
            {hasCustomRange && (
              <SelectItem value="custom" disabled>
                Custom range
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Custom date range */}
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground font-medium">
          From
        </label>
        <Input
          type="date"
          value={currentFrom}
          onChange={(e) => handleDateChange("from", e.target.value)}
          className="w-[150px]"
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground font-medium">
          To
        </label>
        <Input
          type="date"
          value={currentTo}
          onChange={(e) => handleDateChange("to", e.target.value)}
          className="w-[150px]"
        />
      </div>

      {/* Paid status filter */}
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground font-medium">
          Status
        </label>
        <Select
          value={currentPaidStatus}
          onValueChange={(v) => updateParams({ paidStatus: v })}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Payment method filter */}
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground font-medium">
          Payment
        </label>
        <Select
          value={currentPayment}
          onValueChange={(v) => updateParams({ paymentMethod: v })}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            {PAYMENT_METHODS.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Category filter */}
      {categories.length > 0 && (
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground font-medium">
            Category
          </label>
          <Select
            value={currentCategory}
            onValueChange={(v) => updateParams({ category: v })}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Reset */}
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={handleReset} className="h-10">
          <RotateCcw className="w-4 h-4 mr-1" />
          Reset
        </Button>
      )}
    </div>
  );
}
