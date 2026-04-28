"use client";

import { memo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from "next-intl";

type ProductDetailTabsProps = {
  description: string;
  slug: string;
  brand: string;
  category: string;
  stock: number;
};

function ProductDetailTabs({
  description,
  slug,
  brand,
  category,
  stock,
}: ProductDetailTabsProps) {
  const t = useTranslations("Product");

  // Synthetic OEM-style code from slug for visual interest
  const oemCode = `${brand.slice(0, 3).toUpperCase()}-${slug.slice(0, 8).toUpperCase()}`;

  const specs = [
    { label: t("sku"), value: slug.toUpperCase() },
    { label: "OEM REF", value: oemCode },
    { label: t("brandLabel"), value: brand.toUpperCase() },
    { label: t("categoryLabel"), value: category.toUpperCase() },
    { label: t("stockLabel"), value: `${String(stock).padStart(4, "0")} UNITS` },
  ];

  return (
    <Tabs defaultValue="description" className="w-full">
      <TabsList className="bg-transparent border-b-2 border-foreground rounded-none h-auto p-0 w-full justify-start gap-0 overflow-x-auto">
        <TabsTrigger
          value="description"
          className="tab-indicator rounded-none bg-transparent shadow-none px-4 sm:px-6 py-3.5 font-heading text-[12px] font-bold uppercase tracking-[0.16em] data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none text-muted-foreground min-h-[44px] hover:text-foreground transition-colors"
        >
          {t("description")}
        </TabsTrigger>
        <TabsTrigger
          value="specifications"
          className="tab-indicator rounded-none bg-transparent shadow-none px-4 sm:px-6 py-3.5 font-heading text-[12px] font-bold uppercase tracking-[0.16em] data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none text-muted-foreground min-h-[44px] hover:text-foreground transition-colors"
        >
          {t("specifications")}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="description" className="mt-6">
        <p className="text-foreground/80 text-sm leading-relaxed whitespace-pre-line">
          {description}
        </p>
      </TabsContent>

      <TabsContent value="specifications" className="mt-6">
        {/* Workshop spec sheet — dot-leader rows */}
        <div className="border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-dashed border-border">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-accent">
              ▲ TECHNICAL SHEET
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              REV 01
            </span>
          </div>
          <div className="space-y-0.5">
            {specs.map((spec) => (
              <div key={spec.label} className="dot-leader">
                <span className="label">{spec.label}</span>
                <span className="leader" />
                <span className="value">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}

export default memo(ProductDetailTabs);
