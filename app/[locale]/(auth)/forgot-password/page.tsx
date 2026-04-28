import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { APP_NAME } from "@/lib/constants";
import ForgotPasswordForm from "./forgot-password-form";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("Metadata");
  return { title: t("forgotPassword") };
}

export default async function ForgotPasswordPage() {
  const session = await auth();
  const t = await getTranslations("Auth");

  if (session) return redirect("/");

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
        <h1 className="h2-bold">{t("forgotPasswordTitle")}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {t("forgotPasswordDescription")}
        </p>
      </div>
      <ForgotPasswordForm />
    </div>
  );
}
