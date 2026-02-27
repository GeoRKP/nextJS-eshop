export type ProductSuggestion = {
  id: string;
  name: string;
  slug: string;
  price: string;
  image: string;
  brand: string;
  category: string;
};

export type CategorySuggestion = {
  category: string;
  count: number;
};

export type SuggestionsResponse = {
  products: ProductSuggestion[];
  categories: CategorySuggestion[];
};
