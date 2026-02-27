import ProductCard from "@/components/shared/product/product-card";
import { Button } from "@/components/ui/button";
import {
  getAllProducts,
  getAllCategories,
  getDidYouMean,
} from "@/lib/actions/product.actions";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

const prices = [
  {
    key: "priceRange1",
    value: "1-50",
  },
  {
    key: "priceRange2",
    value: "51-100",
  },
  {
    key: "priceRange3",
    value: "101-150",
  },
  {
    key: "priceRange4",
    value: "151-200",
  },
  {
    key: "priceRange5",
    value: "201-500",
  },
  {
    key: "priceRange6",
    value: "501-1000",
  },
  {
    key: "priceRange7",
    value: "1001-2000",
  },
];

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
  }>;
}) {
  const {
    q = "all",
    category = "all",
    price = "all",
    rating = "all",
    sort = "newest",
    page = "1",
  } = await props.searchParams;

  const t = await getTranslations("Search");
  const tCommon = await getTranslations("Common");

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

  const categories = await getAllCategories();

  return (
    <div className="wrapper grid md:grid-cols-5 md:gap-5">
      <div className="filter-links">
        {/* Category links */}
        <div className="text-xl mb-2 mt-3">{t("department")}</div>
        <div>
          <ul className="space-y-1">
            <li>
              <Link
                className={`${
                  category === "all" || category === "" ? "font-bold" : ""
                }`}
                href={getFilterUrl({ c: "all" })}
              >
                {tCommon("any")}
              </Link>
            </li>
            {categories.map((x) => (
              <li key={x.category}>
                <Link
                  className={`${category === x.category ? "font-bold" : ""}`}
                  href={getFilterUrl({ c: x.category })}
                >
                  {x.category}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {/* Price links */}
        <div className="text-xl mb-2 mt-8">{t("price")}</div>
        <div>
          <ul className="space-y-1">
            <li>
              <Link
                className={`${price === "all" ? "font-bold" : ""}`}
                href={getFilterUrl({ p: "all" })}
              >
                {tCommon("any")}
              </Link>
            </li>
            {prices.map((p) => (
              <li key={p.value}>
                <Link
                  className={`${price === p.value ? "font-bold" : ""}`}
                  href={getFilterUrl({ p: p.value })}
                >
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {t(p.key as any)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {/* Rating links */}
        <div className="text-xl mb-2 mt-8">{t("rating")}</div>
        <div>
          <ul className="space-y-1">
            <li>
              <Link
                className={`${rating === "all" ? "font-bold" : ""}`}
                href={getFilterUrl({ r: "all" })}
              >
                {tCommon("any")}
              </Link>
            </li>
            {ratings.map((r) => (
              <li key={r}>
                <Link
                  className={`${rating === r.toString() ? "font-bold" : ""}`}
                  href={getFilterUrl({ r: `${r}` })}
                >
                  {t("starsAndUp", { count: r })}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="md:col-span-4 space-y-4">
        <div className="flex-between flex-col md:flex-row my-4">
          <div className="flex items-center">
            {q !== "all" && q !== "" && ` ${t("query")} ${q}`}
            {category !== "all" && category !== "" && ` ${t("category")} ${category}`}
            {price !== "all" && ` ${t("priceLabel")} ${price}`}
            {rating !== "all" && ` ${t("ratingLabel")} ${rating} ${t("starsAndUp", { count: Number(rating) })}`}
            &nbsp;
            {(q !== "all" && q !== "") ||
            (category !== "all" && category !== "") ||
            price !== "all" ||
            rating !== "all" ? (
              <Button variant={"link"} asChild>
                <Link href="/search">{tCommon("clear")}</Link>
              </Button>
            ) : null}
          </div>
          <div>
            {t("sortBy")}{" "}
            {sortOrders.map((s) => (
              <Link
                key={s}
                className={`${sort === s ? "font-bold" : ""} mx-2`}
                href={getFilterUrl({ s })}
              >
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {t(sortKeyMap[s] as any)}
              </Link>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {products.data.length === 0 && (
            <div className="col-span-full text-center space-y-2">
              <p>{t("noResults")} <strong>&ldquo;{q}&rdquo;</strong></p>
              {q !== "all" && q.trim() !== "" && (
                <DidYouMean query={q} />
              )}
            </div>
          )}
          {products.data.map((product) => (
            <ProductCard key={product.id} product={product} searchQuery={q !== "all" ? q : undefined} />
          ))}
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
    <p className="text-muted-foreground">
      {t("didYouMean")}{" "}
      {suggestions.map((s, i) => (
        <span key={s}>
          {i > 0 && ", "}
          <Link href={`/search?q=${encodeURIComponent(s)}`} className="underline text-primary hover:text-primary/80">
            {s}
          </Link>
        </span>
      ))}
      ?
    </p>
  );
}
