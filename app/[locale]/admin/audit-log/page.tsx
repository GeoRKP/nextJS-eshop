import { getAuditLogs } from "@/lib/actions/audit-log.actions";
import { requireAdmin } from "@/lib/auth-guard";
import { getTranslations } from "next-intl/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Pagination from "@/components/shared/pagination";

export async function generateMetadata() {
  return { title: "Audit Log" };
}

export default async function AuditLogPage(props: {
  searchParams: Promise<{ page?: string; entity?: string; action?: string }>;
}) {
  await requireAdmin();
  const sp = await props.searchParams;
  const page = Number(sp.page) || 1;

  const { data, totalPages } = await getAuditLogs({
    page,
    entity: sp.entity,
    action: sp.action,
  });

  const t = await getTranslations("Admin");

  return (
    <div className="space-y-4">
      <div>
        <span className="text-stamp text-accent block mb-2 hazard-mark">
          ▲ ADMIN / AUDIT LOG
        </span>
        <h1 className="h2-bold">{t("auditLogTitle")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("auditLogDescription")}
        </p>
      </div>

      <div className="card-premium overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  {t("noAuditLogs")}
                </TableCell>
              </TableRow>
            ) : (
              data.map((log: { id: string; createdAt: string | Date; userName: string; action: string; entity: string; entityId?: string | null; details?: unknown }) => (
                <TableRow key={log.id}>
                  <TableCell className="text-xs font-mono whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString("el-GR")}
                  </TableCell>
                  <TableCell className="text-sm">{log.userName}</TableCell>
                  <TableCell>
                    <span className="font-mono text-xs px-2 py-1 bg-accent/10 text-accent border border-accent/20">
                      {log.action}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">
                    {log.entity}
                    {log.entityId && (
                      <span className="text-xs text-muted-foreground ml-1 font-mono">
                        ({String(log.entityId).slice(0, 8)})
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                    {log.details ? JSON.stringify(log.details) : "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center pt-4">
          <Pagination page={page} totalPages={totalPages} />
        </div>
      )}
    </div>
  );
}
