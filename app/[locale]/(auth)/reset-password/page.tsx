import { Link } from "@/i18n/navigation";
import ResetPasswordForm from "./reset-password-form";
import AuthCard from "../auth-card";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("Metadata");
  return { title: t("resetPassword") };
}

export default async function ResetPasswordPage(props: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await props.searchParams;
  const session = await auth();
  const t = await getTranslations("Auth");

  if (session) return redirect("/");

  if (!token) {
    return (
      <div className="w-full">
        <AuthCard title={t("resetPassword")}>
          <p className="text-destructive text-sm">{t("invalidResetLink")}</p>
          <Link
            href="/forgot-password"
            className="text-accent font-semibold hover:underline mt-4 inline-block text-sm"
          >
            {t("requestNewResetLink")}
          </Link>
        </AuthCard>
      </div>
    );
  }

  return (
    <div className="w-full">
      <AuthCard
        title={t("resetPasswordTitle")}
        description={t("resetPasswordDescription")}
      >
        <ResetPasswordForm token={token} />
      </AuthCard>
    </div>
  );
}
