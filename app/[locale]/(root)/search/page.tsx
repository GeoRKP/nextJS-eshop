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
import { getTranslations } from "next-intl/server";
import SearchFilters from "./search-filters";
import ViewToggle from "./view-toggle";
import Pagination from "@/components/shared/pagination";
import { SearchX } from "lucide-react";
import { getWishlistProductIds } from "@/lib/actions/wishlist.actions";

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
    return {
      title: `
      ${t("query")} ${isQuerySet ? q : ""}
      ${isCategorySet ? `${t("category")} ${category}` : ""}
      ${isPriceSet ? `${t("priceLabel")} ${price}` : ""}
      ${isRatingSet ? `${t("ratingLabel")} ${rating} ${t("starsAndUp", { count: Number(rating) })}` : ""}`,
    };
  } else {
    return {
      title: tMeta("searchProducts"),
    };
  }
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

  // Construct filter url
  const getFilterUrl = ({
    c,
    s,
    p,
    r,
    pg,
  }: {
    c?: string;
    s?: string;
    p?: string;
    r?: string;
    pg?: string;
  }) => {
    const params = { q, category, price, rating, sort, page };
    if (c) params.category = c;
    if (s) params.sort = s;
    if (p) params.price = p;
    if (r) params.rating = r;
    if (pg) params.page = pg;

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

  const [categories, priceRange, wishlistIds] = await Promise.all([
    getAllCategories(),
    getProductPriceRange(),
    getWishlistProductIds(),
  ]);

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
      clearUrl: getFilterUrl({
        c: category,
        p: price,
        r: rating,
        s: sort,
      }).replace(`q=${encodeURIComponent(q)}`, "q=all"),
    });
  }
  if (category !== "all" && category !== "") {
    activeFilters.push({
      label: `${t("category")} ${category}`,
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
      count: c.productCount,
      href: getFilterUrl({ c: c.name }),
      isActive: category === c.name,
      children: c.children.map((child) => ({
        name: child.name,
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
                {t("browsing")}: <span className="text-brand-accent">{category}</span>
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
          {/* Segmented sort */}
          <div className="flex items-center bg-muted/50 rounded-lg p-1 overflow-x-auto scrollbar-hide">
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
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {t(sortKeyMap[s] as any)}
              </Link>
            ))}
          </div>

          {/* View toggle */}
          <ViewToggle currentView={view} />
        </div>
      </div>

      {/* Layout: Sidebar + Products */}
      <div className="grid md:grid-cols-[280px_1fr] md:gap-10">
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
          ) : view === "list" ? (
            <div className="flex flex-col gap-4">
              {products.data.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  searchQuery={q !== "all" ? q : undefined}
                  isInWishlist={wishlistIds.has(product.id)}
                  variant="list"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
              {products.data.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  searchQuery={q !== "all" ? q : undefined}
                  isInWishlist={wishlistIds.has(product.id)}
                />
              ))}
            </div>
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
