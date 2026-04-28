import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAllCategories } from "@/lib/actions/product.actions";
import { SearchIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function Search() {
  const categories = await getAllCategories();
  const t = await getTranslations("Common");

  return (
    <form action="/search" method="GET">
      <div className="flex w-full max-w-sm items-center space-x-2">
        <Select name="category">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("all")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem key="All" value="all">
              {t("all")}
            </SelectItem>
            {categories.map((x) => (
              <SelectItem key={x.name} value={x.name}>
                {x.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="text"
          name="q"
          placeholder={t("searchPlaceholder")}
          className="md:w-[100px] lg:w-[300px]"
        />
        <Button type="submit">
          <SearchIcon />
        </Button>
      </div>
    </form>
  );
}
