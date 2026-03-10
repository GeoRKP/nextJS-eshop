import { getTranslations } from "next-intl/server";
import { getAdminCategories } from "@/lib/actions/category.actions";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "@/i18n/navigation";
import { formatId } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import DeleteDialog from "@/components/shared/delete-dialog";
import { deleteCategory } from "@/lib/actions/category.actions";
import { requireAdmin } from "@/lib/auth-guard";
import { FolderTree } from "lucide-react";

export async function generateMetadata() {
  const t = await getTranslations("AdminCategories");
  return { title: t("categories") };
}

export default async function AdminCategoriesPage() {
  await requireAdmin();
  const t = await getTranslations("AdminCategories");
  const tCommon = await getTranslations("Common");
  const { data: categories } = await getAdminCategories();

  return (
    <div className="space-y-4">
      <div className="flex-between">
        <h1 className="h2-bold">{t("categories")}</h1>
        <Button asChild variant="accent">
          <Link href="/admin/categories/create">{t("createCategory")}</Link>
        </Button>
      </div>

      <div className="card-premium overflow-hidden">
        <div className="overflow-x-auto">
          {categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <FolderTree className="h-10 w-10 mb-3 opacity-50" />
              <p className="text-sm">{tCommon("noItems")}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>{t("name")}</TableHead>
                  <TableHead>{t("slug")}</TableHead>
                  <TableHead>{t("parent")}</TableHead>
                  <TableHead>{t("productCount")}</TableHead>
                  <TableHead>{t("isActive")}</TableHead>
                  <TableHead>{t("sortOrder")}</TableHead>
                  <TableHead className="w-[100px]">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>{formatId(category.id)}</TableCell>
                    <TableCell className="font-medium">
                      {category.name}
                    </TableCell>
                    <TableCell>{category.slug}</TableCell>
                    <TableCell>{category.parent?.name || "-"}</TableCell>
                    <TableCell>{category._count.products}</TableCell>
                    <TableCell>
                      {category.isActive ? (
                        <Badge variant="success">{tCommon("yes")}</Badge>
                      ) : (
                        <Badge variant="secondary">{tCommon("no")}</Badge>
                      )}
                    </TableCell>
                    <TableCell>{category.sortOrder}</TableCell>
                    <TableCell className="flex gap-1">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/categories/${category.id}`}>
                          {tCommon("edit")}
                        </Link>
                      </Button>
                      <DeleteDialog
                        id={category.id}
                        action={deleteCategory}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
