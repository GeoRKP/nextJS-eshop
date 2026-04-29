export type ProductSuggestion = {
  id: string;
  name: string;
  nameEn: string | null;
  slug: string;
  price: string;
  image: string;
  brand: string;
  category: string;
  categoryEn: string | null;
};

export type CategorySuggestion = {
  category: string;
  categoryEn: string | null;
  count: number;
};

export type SuggestionsResponse = {
  products: ProductSuggestion[];
  categories: CategorySuggestion[];
};
