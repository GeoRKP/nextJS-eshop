"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from "next-intl";

type ProductDetailTabsProps = {
  description: string;
  slug: string;
  brand: string;
  category: string;
  stock: number;
};

export default function ProductDetailTabs({
  description,
  slug,
  brand,
  category,
  stock,
}: ProductDetailTabsProps) {
  const t = useTranslations("Product");

  const specs = [
    { label: t("sku"), value: slug },
    { label: t("brandLabel"), value: brand },
    { label: t("categoryLabel"), value: category },
    { label: t("stockLabel"), value: stock.toString() },
  ];

  return (
    <Tabs defaultValue="description" className="w-full">
      <TabsList className="bg-transparent border-b border-border/50 rounded-none h-auto p-0 w-full justify-start gap-0">
        <TabsTrigger
          value="description"
          className="tab-indicator rounded-none bg-transparent shadow-none px-6 py-3 text-sm font-semibold data-[state=active]:text-brand-accent data-[state=active]:bg-transparent data-[state=active]:shadow-none text-muted-foreground"
        >
          {t("description")}
        </TabsTrigger>
        <TabsTrigger
          value="specifications"
          className="tab-indicator rounded-none bg-transparent shadow-none px-6 py-3 text-sm font-semibold data-[state=active]:text-brand-accent data-[state=active]:bg-transparent data-[state=active]:shadow-none text-muted-foreground"
        >
          {t("specifications")}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="description" className="mt-6">
        <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
          {description}
        </p>
      </TabsContent>

      <TabsContent value="specifications" className="mt-6">
        <div className="rounded-lg border border-border/50 overflow-hidden">
          {specs.map((spec, i) => (
            <div
              key={spec.label}
              className={`flex items-center justify-between px-4 py-3 text-sm ${
                i % 2 === 0 ? "bg-muted/30" : "bg-transparent"
              }`}
            >
              <span className="font-medium text-muted-foreground">{spec.label}</span>
              <span className="font-semibold">{spec.value}</span>
            </div>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
}
