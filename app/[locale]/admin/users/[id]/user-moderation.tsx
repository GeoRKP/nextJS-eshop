"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShieldBan, ShieldCheck, Clock } from "lucide-react";
import {
  banUser,
  unbanUser,
  suspendUser,
  unsuspendUser,
} from "@/lib/actions/user-admin.actions";

export default function UserModeration({
  userId,
  isBanned,
  suspendedUntil,
}: {
  userId: string;
  isBanned: boolean;
  suspendedUntil: string | null;
}) {
  const t = useTranslations("UpdateUser");
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [reason, setReason] = useState("");
  const [days, setDays] = useState(7);

  const suspendedActive = Boolean(
    suspendedUntil && new Date(suspendedUntil) > new Date()
  );

  const run = (fn: () => Promise<{ success: boolean; message: string }>) =>
    startTransition(async () => {
      const res = await fn();
      toast({
        variant: res.success ? undefined : "destructive",
        description: res.message,
      });
      if (res.success) router.refresh();
    });

  const withReason = (fn: () => Promise<{ success: boolean; message: string }>) => {
    if (!reason.trim()) {
      toast({ variant: "destructive", description: t("reasonRequired") });
      return;
    }
    run(fn);
  };

  return (
    <div className="card-premium p-6 md:p-8 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-heading font-bold text-sm uppercase tracking-wide">
          {t("moderation")}
        </h2>
        {isBanned ? (
          <Badge variant="destructive">{t("statusBanned")}</Badge>
        ) : suspendedActive ? (
          <Badge variant="secondary">
            {t("statusSuspended", {
              date: new Date(suspendedUntil as string).toLocaleDateString(),
            })}
          </Badge>
        ) : (
          <Badge variant="outline">{t("statusActive")}</Badge>
        )}
      </div>

      <p className="text-sm text-muted-foreground">{t("moderationHint")}</p>

      {!isBanned && !suspendedActive && (
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">{t("reason")}</label>
            <Input
              className="mt-1.5"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t("reasonPlaceholder")}
            />
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-32">
              <label className="text-sm font-medium">{t("durationDays")}</label>
              <Input
                className="mt-1.5"
                type="number"
                min={1}
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
              />
            </div>
            <Button
              variant="outline"
              disabled={isPending}
              onClick={() => withReason(() => suspendUser(userId, reason, days))}
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Clock className="mr-2 h-4 w-4" />
              )}
              {t("suspend")}
            </Button>
            <Button
              variant="destructive"
              disabled={isPending}
              onClick={() => withReason(() => banUser(userId, reason))}
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ShieldBan className="mr-2 h-4 w-4" />
              )}
              {t("ban")}
            </Button>
          </div>
        </div>
      )}

      {isBanned && (
        <Button
          variant="outline"
          disabled={isPending}
          onClick={() => run(() => unbanUser(userId))}
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <ShieldCheck className="mr-2 h-4 w-4" />
          )}
          {t("unban")}
        </Button>
      )}

      {!isBanned && suspendedActive && (
        <Button
          variant="outline"
          disabled={isPending}
          onClick={() => run(() => unsuspendUser(userId))}
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <ShieldCheck className="mr-2 h-4 w-4" />
          )}
          {t("unsuspend")}
        </Button>
      )}
    </div>
  );
}
