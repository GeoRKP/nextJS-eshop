import ProductCard from "@/components/shared/product/product-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getAllProducts,
  getAllCategories,
  getDidYouMean,
  getProductPriceRange,
} from "@/lib/actions/product.actions";
import { Link } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { localizedName } from "@/lib/i18n-helpers";
import SearchFilters from "./search-filters";
import ViewToggle from "./view-toggle";
import SortSelect from "./sort-select";
import Pagination from "@/components/shared/pagination";
import { SearchX } from "lucide-react";
import { ViewProvider } from "./view-context";
import ProductsView from "./products-view";

const ratings = [4, 3, 2, 1];

const sortOrders = ["newest", "lowest", "highest", "rating"] as const;

const sortKeyMap: Record<string, string> = {
  newest: "newest",
  lowest: "lowest",
  highest: "highest",
  rating: "sortRating",
};

export async function generateMetadata(props: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    price?: string;
    rating?: string;
  }>;
}) {
  const t = await getTranslations("Search");
  const tMeta = await getTranslations("Metadata");

  const {
    q = "all",
    category = "all",
    price = "all",
    rating = "all",
  } = await props.searchParams;

  const isQuerySet = q && q !== "all" && q.trim() !== "";
  const isCategorySet =
    category && category !== "all" && category.trim() !== "";
  const isPriceSet = price && price !== "all" && price.trim() !== "";
  const isRatingSet = rating && rating !== "all" && rating.trim() !== "";

  if (isQuerySet || isCategorySet || isPriceSet || isRatingSet) {
    const parts: string[] = [];
    if (isCategorySet) parts.push(category);
    if (isQuerySet) parts.push(q);
    if (isPriceSet) parts.push(`${t("priceLabel")} ${price}`);
    if (isRatingSet) parts.push(`${rating}+ ★`);
    return { title: parts.join(" · ") };
  }
  return { title: tMeta("searchProducts") };
}

export default async function SearchPage(props: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    price?: string;
    rating?: string;
    sort?: string;
    page?: string;
    view?: string;
  }>;
}) {
  const {
    q = "all",
    category = "all",
    price = "all",
    rating = "all",
    sort = "newest",
    page = "1",
    view = "grid",
  } = await props.searchParams;

  const t = await getTranslations("Search");
  const tCommon = await getTranslations("Common");
  const tBreadcrumb = await getTranslations("Breadcrumb");
  const locale = await getLocale();

  // Construct filter url
  const getFilterUrl = ({
    c,
    s,
    p,
    r,
    pg,
    qv,
  }: {
    c?: string;
    s?: string;
    p?: string;
    r?: string;
    pg?: string;
    qv?: string;
  }) => {
    const params = { q, category, price, rating, sort, page };
    if (qv !== undefined) params.q = qv;
    if (c) params.category = c;
    if (s) params.sort = s;
    if (p) params.price = p;
    if (r) params.rating = r;
    if (pg) {
      params.page = pg;
    } else if (c || s || p || r || qv !== undefined) {
      // Any filter/sort/query change resets to page 1 — the current page may
      // not exist in the narrowed result set (otherwise: empty grid).
      params.page = "1";
    }

    return `/search?${new URLSearchParams(params).toString()}`;
  };

  const products = await getAllProducts({
    query: q,
    category,
    price,
    rating,
    sort,
    page: parseInt(page),
  });

  const [categories, priceRange] = await Promise.all([
    getAllCategories(),
    getProductPriceRange(),
  ]);

  // Build flat lookup so we can show category names in the active locale
  // anywhere we only have the canonical Greek name (chips, headlines, etc.).
  const categoryNameByGreek = new Map<string, { name: string; nameEn: string | null }>();
  for (const c of categories) {
    categoryNameByGreek.set(c.name, { name: c.name, nameEn: c.nameEn ?? null });
    for (const child of c.children) {
      categoryNameByGreek.set(child.name, {
        name: child.name,
        nameEn: child.nameEn ?? null,
      });
    }
  }
  const localizedCategoryName = (greekName: string) =>
    localizedName(categoryNameByGreek.get(greekName) ?? { name: greekName }, locale);

  // Parse current price filter values for the slider
  const currentMin =
    price !== "all" ? Number(price.split("-")[0]) : priceRange.min;
  const currentMax =
    price !== "all" ? Number(price.split("-")[1]) : priceRange.max;

  // Count active filters
  const activeFilters: { label: string; clearUrl: string }[] = [];
  if (q !== "all" && q !== "") {
    activeFilters.push({
      label: `${t("query")} ${q}`,
      // Reset the query directly — string-replacing the encoded value broke for
      // multi-word/special-char queries (URLSearchParams "+" vs "%20" mismatch).
      clearUrl: getFilterUrl({ qv: "all" }),
    });
  }
  if (category !== "all" && category !== "") {
    activeFilters.push({
      label: `${t("category")} ${localizedCategoryName(category)}`,
      clearUrl: getFilterUrl({ c: "all" }),
    });
  }
  if (price !== "all") {
    activeFilters.push({
      label: `${t("priceLabel")} ${price}`,
      clearUrl: getFilterUrl({ p: "all" }),
    });
  }
  if (rating !== "all") {
    activeFilters.push({
      label: `${t("ratingLabel")} ${rating} ${t("starsAndUp", { count: Number(rating) })}`,
      clearUrl: getFilterUrl({ r: "all" }),
    });
  }

  // Build filter data for client component
  const filterData = {
    categories: categories.map((c) => ({
      name: c.name,
      nameEn: c.nameEn ?? null,
      count: c.productCount,
      href: getFilterUrl({ c: c.name }),
      isActive: category === c.name,
      children: c.children.map((child) => ({
        name: child.name,
        nameEn: child.nameEn ?? null,
        count: child.productCount,
        href: getFilterUrl({ c: child.name }),
        isActive: category === child.name,
      })),
    })),
    priceRange: {
      min: priceRange.min,
      max: priceRange.max,
      currentMin,
      currentMax,
    },
    ratings: ratings.map((r) => ({
      value: r,
      label: t("starsAndUp", { count: r }),
      href: getFilterUrl({ r: `${r}` }),
      isActive: rating === r.toString(),
    })),
    anyHref: {
      category: getFilterUrl({ c: "all" }),
      price: getFilterUrl({ p: "all" }),
      rating: getFilterUrl({ r: "all" }),
    },
    activeCategory: category,
    activePrice: price,
    activeRating: rating,
    translations: {
      department: t("department"),
      price: t("price"),
      rating: t("rating"),
      any: tCommon("any"),
      filters: t("filters"),
      clearFilters: t("clearFilters"),
      priceRange: t("priceRange"),
      applyPrice: t("applyPrice"),
    },
    clearAllHref: "/search",
    searchParams: { q, category, price, rating, sort, page },
  };

  const hasQuery = q !== "all" && q.trim() !== "";
  const hasCategory = category !== "all" && category.trim() !== "";

  return (
    <ViewProvider initialView={view === "list" ? "list" : "grid"}>
    <div className="wrapper">
      {/* Results banner */}
      <div className="card-premium overflow-hidden mb-6">
        <div className="industrial-stripe p-4 md:p-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
            <Link href="/" className="hover:text-foreground transition-colors">{tBreadcrumb("home")}</Link>
            <span>/</span>
            <span>{t("filters")}</span>
            {hasQuery && (
              <>
                <span>/</span>
                <span className="text-foreground">{q}</span>
              </>
            )}
          </div>

          <h1 className="h2-bold">
            {hasQuery ? (
              <>
                {t("resultsFor")} &ldquo;<span className="text-brand-accent">{q}</span>&rdquo;
              </>
            ) : hasCategory ? (
              <>
                {t("browsing")}: <span className="text-brand-accent">{localizedCategoryName(category)}</span>
              </>
            ) : (
              t("allProducts")
            )}
          </h1>
          {products.data.length > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {t("showingResults", { count: products.data.length, page: page, totalPages: products.totalPages.toString() })}
            </p>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 mb-6 border-b border-border/50">
        {/* Active filter chips */}
        <div className="flex flex-wrap items-center gap-2">
          {activeFilters.length > 0 && (
            <>
              {activeFilters.map((filter) => (
                <Badge
                  key={filter.label}
                  className="gap-1.5 pr-1.5 rounded-md bg-brand-accent/10 text-brand-accent border border-brand-accent/20 hover:bg-brand-accent/15"
                >
                  <span className="text-xs">{filter.label}</span>
                  <Link
                    href={filter.clearUrl}
                    className="ml-0.5 hover:text-destructive inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-destructive/10"
                  >
                    &times;
                  </Link>
                </Badge>
              ))}
              <Button variant="link" size="sm" asChild className="h-auto p-0 text-xs">
                <Link href="/search">{tCommon("clearAll")}</Link>
              </Button>
            </>
          )}
        </div>

        {/* Sort + View Toggle */}
        <div className="flex items-center gap-3">
          {/* Segmented sort — desktop only */}
          <div className="hidden md:flex items-center bg-muted/50 rounded-lg p-1">
            {sortOrders.map((s) => (
              <Link
                key={s}
                className={`px-3 py-1.5 rounded-md text-xs transition-all whitespace-nowrap ${
                  sort === s
                    ? "bg-card shadow-card-subtle text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                href={getFilterUrl({ s })}
              >
                { }
                {t(sortKeyMap[s] as any)}
              </Link>
            ))}
          </div>

          {/* Sort dropdown — mobile only */}
          <SortSelect
            options={sortOrders.map((s) => ({
              value: s,
               
              label: t(sortKeyMap[s] as any),
              url: getFilterUrl({ s }),
            }))}
            current={sort}
          />

          {/* View toggle */}
          <ViewToggle />
        </div>
      </div>

      {/* Layout: Sidebar + Products */}
      <div className="grid md:grid-cols-[280px_1fr] xl:grid-cols-[320px_1fr] 2xl:grid-cols-[360px_1fr] md:gap-10 2xl:gap-14">
        {/* Sidebar filters */}
        <SearchFilters
          filterData={filterData}
          filterCount={activeFilters.length}
        />

        {/* Results */}
        <div className="space-y-6">
          {/* Product grid or list */}
          {products.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center">
                <SearchX className="w-10 h-10 text-muted-foreground/50" />
              </div>
              <h3 className="h3-bold text-center">{t("noResultsTitle")}</h3>
              <p className="text-muted-foreground text-center text-sm max-w-md">
                {t("noResultsSubtitle")}
              </p>
              {q !== "all" && q.trim() !== "" && <DidYouMean query={q} />}
              <Button variant="accent" asChild className="mt-2">
                <Link href="/search">{t("allProducts")}</Link>
              </Button>
            </div>
          ) : (
            <ProductsView
              listContent={
                <div className="flex flex-col gap-4">
                  {products.data.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      searchQuery={q !== "all" ? q : undefined}
                      variant="list"
                    />
                  ))}
                </div>
              }
              gridContent={
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5 2xl:gap-6">
                  {products.data.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      searchQuery={q !== "all" ? q : undefined}
                    />
                  ))}
                </div>
              }
            />
          )}

          {/* Pagination */}
          {products.totalPages > 1 && (
            <div className="flex justify-center pt-4">
              <Pagination
                page={Number(page) || 1}
                totalPages={products.totalPages}
              />
            </div>
          )}
        </div>
      </div>
    </div>
    </ViewProvider>
  );
}

async function DidYouMean({ query }: { query: string }) {
  const suggestions = await getDidYouMean(query);
  const t = await getTranslations("Search");

  if (suggestions.length === 0) return null;

  return (
    <p className="text-muted-foreground text-sm">
      {t("didYouMean")}{" "}
      {suggestions.map((s, i) => (
        <span key={s}>
          {i > 0 && ", "}
          <Link
            href={`/search?q=${encodeURIComponent(s)}`}
            className="underline text-brand-accent hover:text-brand-accent-dark"
          >
            {s}
          </Link>
        </span>
      ))}
      ?
    </p>
  );
}
