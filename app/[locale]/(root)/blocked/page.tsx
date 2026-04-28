import { getTranslations } from "next-intl/server";
import { ShieldAlert } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { redirect } from "next/navigation";

export async function generateMetadata() {
  const t = await getTranslations("Blocked");
  return { title: t("title") };
}

export default async function BlockedPage() {
  const t = await getTranslations("Blocked");
  const session = await auth();

  if (!session?.user?.id) return redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      isBanned: true,
      bannedReason: true,
      suspendedUntil: true,
      suspendedReason: true,
    },
  });

  // Not actually blocked — redirect to home
  if (!user?.isBanned && (!user?.suspendedUntil || user.suspendedUntil < new Date())) {
    return redirect("/");
  }

  const isBanned = user.isBanned;
  const reason = isBanned ? user.bannedReason : user.suspendedReason;
  const suspendedUntil = user.suspendedUntil;

  return (
    <div className="wrapper max-w-2xl py-20">
      <div className="text-center mb-8">
        <ShieldAlert className="w-20 h-20 text-destructive mx-auto mb-6" />
        <span className="text-stamp text-destructive block mb-2">
          ▲ ACCOUNT {isBanned ? "BANNED" : "SUSPENDED"}
        </span>
        <h1 className="h1-bold mb-4">
          {isBanned ? t("bannedTitle") : t("suspendedTitle")}
        </h1>
      </div>

      <div className="border border-destructive/30 bg-destructive/5 p-6">
        {reason && (
          <div className="mb-4">
            <h3 className="text-stamp text-muted-foreground mb-2">{t("reason")}</h3>
            <p className="text-foreground">{reason}</p>
          </div>
        )}
        {!isBanned && suspendedUntil && (
          <div>
            <h3 className="text-stamp text-muted-foreground mb-2">{t("until")}</h3>
            <p className="text-foreground">
              {new Date(suspendedUntil).toLocaleString("el-GR")}
            </p>
          </div>
        )}
      </div>

      <div className="text-center mt-8">
        <p className="text-sm text-muted-foreground mb-4">{t("contactSupport")}</p>
        <Link
          href="/"
          className="text-accent hover:underline text-sm"
        >
          {t("backHome")}
        </Link>
      </div>
    </div>
  );
}
