"use client";

import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { RotateCcw } from "lucide-react";

const PERIODS = [
  { value: "7d", key: "last7Days" },
  { value: "30d", key: "last30Days" },
  { value: "this-month", key: "thisMonth" },
  { value: "3m", key: "last3Months" },
  { value: "6m", key: "last6Months" },
  { value: "this-year", key: "thisYear" },
  { value: "all", key: "allTime" },
] as const;

const PAYMENT_METHODS = ["Stripe", "Paypal", "CashOnDelivery"] as const;

export default function DashboardFilters({
  categories,
}: {
  categories: string[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("AdminDashboard");

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
    <div className="card-premium p-4 flex flex-wrap items-end gap-3">
      {/* Period preset */}
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground font-medium">
          {t("filterByPeriod")}
        </label>
        <Select
          value={hasCustomRange ? "custom" : currentPeriod}
          onValueChange={handlePeriodChange}
        >
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERIODS.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {t(p.key as Parameters<typeof t>[0])}
              </SelectItem>
            ))}
            {hasCustomRange && (
              <SelectItem value="custom" disabled>
                {t("customRange")}
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Custom date range */}
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground font-medium">
          {t("from")}
        </label>
        <Input
          type="date"
          value={currentFrom}
          onChange={(e) => handleDateChange("from", e.target.value)}
          className="w-full sm:w-[150px]"
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground font-medium">
          {t("to")}
        </label>
        <Input
          type="date"
          value={currentTo}
          onChange={(e) => handleDateChange("to", e.target.value)}
          className="w-full sm:w-[150px]"
        />
      </div>

      {/* Paid status filter */}
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground font-medium">
          {t("status")}
        </label>
        <Select
          value={currentPaidStatus}
          onValueChange={(v) => updateParams({ paidStatus: v })}
        >
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allStatuses")}</SelectItem>
            <SelectItem value="paid">{t("paid")}</SelectItem>
            <SelectItem value="unpaid">{t("unpaid")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Payment method filter */}
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground font-medium">
          {t("paymentMethod")}
        </label>
        <Select
          value={currentPayment}
          onValueChange={(v) => updateParams({ paymentMethod: v })}
        >
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allPayments")}</SelectItem>
            {PAYMENT_METHODS.map((m) => (
              <SelectItem key={m} value={m}>
                {t(`payment${m}` as Parameters<typeof t>[0])}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Category filter */}
      {categories.length > 0 && (
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground font-medium">
            {t("category")}
          </label>
          <Select
            value={currentCategory}
            onValueChange={(v) => updateParams({ category: v })}
          >
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allCategories")}</SelectItem>
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
          {t("resetFilters")}
        </Button>
      )}
    </div>
  );
}
