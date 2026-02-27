import { Link } from "@/i18n/navigation";
import { getAllProducts, deleteProduct } from "@/lib/actions/product.actions";
import { formatCurrency, formatId } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import Pagination from "@/components/shared/pagination";
import DeleteDialog from "@/components/shared/delete-dialog";
import { getTranslations } from "next-intl/server";

export default async function AdminProductsPage(props: {
  searchParams: Promise<{
    page: string;
    query: string;
    category: string;
  }>;
}) {
  const searchParams = await props.searchParams;

  const page = Number(searchParams.page) || 1;
  const searchText = searchParams.query || "";
  const category = searchParams.category || "";
  console.log(searchText, category);

  const products = await getAllProducts({
    query: searchText,
    category,
    page,
  });

  const t = await getTranslations("AdminProducts");
  const tCommon = await getTranslations("Common");

  console.log(products);

  return (
    <div className="space-y-2">
      <div className="flex-between">
        <div className="flex items-center gap-3">
          <h1 className="h2-bold">{t("products")}</h1>
          {searchText && (
            <div>
              {tCommon("filteredBy")} <i>&quot;{searchText}&quot;</i>
              <Link href="/admin/products">
                <Button variant="outline" size="sm" className="ml-2">
                  {tCommon("removeFilter")}
                </Button>
              </Link>
            </div>
          )}
        </div>
        <Button variant="default" asChild>
          <Link href="/admin/products/create">{t("createProduct")}</Link>
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("id")}</TableHead>
            <TableHead>{t("name")}</TableHead>
            <TableHead className="text-right">{t("price")}</TableHead>
            <TableHead>{t("category")}</TableHead>
            <TableHead>{t("stock")}</TableHead>
            <TableHead>{t("rating")}</TableHead>
            <TableHead className="w-[100px]">{t("actions")}</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {products.data.map((product) => (
            <TableRow key={product.id}>
              <TableCell>{formatId(product.id)}</TableCell>
              <TableCell>{product.name}</TableCell>
              <TableCell className="text-right">
                {formatCurrency(product.price)}
              </TableCell>
              <TableCell>{product.category}</TableCell>
              <TableCell>{product.stock}</TableCell>
              <TableCell>{product.rating}</TableCell>
              <TableCell className="flex gap-1">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/products/${product.id}`}>{tCommon("edit")}</Link>
                </Button>
                <DeleteDialog id={product.id} action={deleteProduct} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {products?.totalPages > 1 && (
        <Pagination page={page} totalPages={products.totalPages} />
      )}
    </div>
  );
}
