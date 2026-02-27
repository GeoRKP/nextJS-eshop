import { PAGE_SIZE } from "@/lib/constants";
import { getAllUsers, deleteUser } from "@/lib/actions/user.actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatId } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import DeleteDialog from "@/components/shared/delete-dialog";
import Pagination from "@/components/shared/pagination";
import { Badge } from "@/components/ui/badge";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("Metadata");
  return {
    title: t("users"),
  };
}

export default async function AdminUserPage(props: {
  searchParams: Promise<{
    page: string;
    query: string;
  }>;
}) {
  const { page = "1", query = "" } = await props.searchParams;

  const users = await getAllUsers({
    page: Number(page),
    limit: PAGE_SIZE,
    query,
  });

  const t = await getTranslations("AdminUsers");
  const tCommon = await getTranslations("Common");

  console.log(users);

  return (
    <div className="space-y-2 ">
      <div className="flex items-center gap-3">
        <h1 className="h2-bold">{t("users")}</h1>
        {query && (
          <div>
            {tCommon("filteredBy")} <i>&quot;{query}&quot;</i>
            <Link href="/admin/users">
              <Button variant="outline" size="sm" className="ml-2">
                {tCommon("removeFilter")}
              </Button>
            </Link>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("id")}</TableHead>
              <TableHead>{t("name")}</TableHead>
              <TableHead>{t("email")}</TableHead>
              <TableHead>{t("role")}</TableHead>
              <TableHead>{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.data.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{formatId(user.id)}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {user.role === "user" ? (
                    <Badge variant="secondary">{tCommon("user")}</Badge>
                  ) : (
                    <Badge variant="default">{tCommon("admin")}</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/users/${user.id}`}>{tCommon("edit")}</Link>
                  </Button>

                  <DeleteDialog id={user.id} action={deleteUser} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {users.totalPages > 1 && (
          <Pagination page={Number(page) || 1} totalPages={users?.totalPages} />
        )}
      </div>
    </div>
  );
}
