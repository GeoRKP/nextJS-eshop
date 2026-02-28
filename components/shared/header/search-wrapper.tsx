import { getTranslations } from "next-intl/server";
import SearchAutocomplete from "./search-autocomplete";

export default async function SearchWrapper() {
  const t = await getTranslations("Search");

  return <SearchAutocomplete placeholder={t("searchPlaceholder")} />;
}
