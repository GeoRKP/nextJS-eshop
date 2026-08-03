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
import { Package } from "lucide-react";
import { requireAdmin } from "@/lib/auth-guard";

export default async function AdminProductsPage(props: {
  searchParams: Promise<{
    page: string;
    query: string;
    category: string;
  }>;
}) {
  // The layout guard alone is not enough: layout and page render in parallel,
  // so this page's data can reach the RSC stream before the layout redirect
  // lands. Every admin page has to gate itself before it queries anything.
  await requireAdmin();

  const searchParams = await props.searchParams;

  const page = Number(searchParams.page) || 1;
  const searchText = searchParams.query || "";
  const category = searchParams.category || "";

  const products = await getAllProducts({
    query: searchText,
    category,
    page,
  });

  const t = await getTranslations("AdminProducts");
  const tCommon = await getTranslations("Common");

  return (
    <div className="space-y-4">
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
        <Button variant="accent" asChild>
          <Link href="/admin/products/create">{t("createProduct")}</Link>
        </Button>
      </div>

      <div className="card-premium overflow-hidden">
        <div className="overflow-x-auto">
          {products.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Package className="h-10 w-10 mb-3 opacity-50" />
              <p className="text-sm">{tCommon("noItems")}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("id")}</TableHead>
                  <TableHead>{t("name")}</TableHead>
                  <TableHead className="text-right">{t("price")}</TableHead>
                  <TableHead>{t("category")}</TableHead>
                  <TableHead>{t("stock")}</TableHead>
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
                    <TableCell className="flex gap-1">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/products/${product.id}`}>
                          {tCommon("edit")}
                        </Link>
                      </Button>
                      <DeleteDialog id={product.id} action={deleteProduct} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {products?.totalPages > 1 && (
        <Pagination page={page} totalPages={products.totalPages} />
      )}
    </div>
  );
}
