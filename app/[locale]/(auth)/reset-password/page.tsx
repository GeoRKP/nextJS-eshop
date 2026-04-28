import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { APP_NAME } from "@/lib/constants";
import ResetPasswordForm from "./reset-password-form";
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
        <h1 className="h2-bold">{t("resetPassword")}</h1>
        <p className="text-destructive mt-4">{t("invalidResetLink")}</p>
        <Link
          href="/forgot-password"
          className="text-accent hover:underline mt-4 inline-block"
        >
          {t("requestNewResetLink")}
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <Link href="/" className="inline-block lg:hidden mb-6">
          <Image
            src="/images/logo.png"
            width={64}
            height={64}
            alt={`${APP_NAME} logo`}
            priority
          />
        </Link>
        <h1 className="h2-bold">{t("resetPasswordTitle")}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {t("resetPasswordDescription")}
        </p>
      </div>
      <ResetPasswordForm token={token} />
    </div>
  );
}
