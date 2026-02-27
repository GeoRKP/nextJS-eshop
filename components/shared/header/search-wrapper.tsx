import { getAllCategories } from "@/lib/actions/product.actions";
import SearchAutocomplete from "./search-autocomplete";

export default async function SearchWrapper() {
  const categories = await getAllCategories();
  const categoryNames = categories.map((c) => c.category);

  return <SearchAutocomplete categories={categoryNames} />;
}
