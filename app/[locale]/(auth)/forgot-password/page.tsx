import ForgotPasswordForm from "./forgot-password-form";
import AuthCard from "../auth-card";
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
      <AuthCard
        title={t("forgotPasswordTitle")}
        description={t("forgotPasswordDescription")}
      >
        <ForgotPasswordForm />
      </AuthCard>
    </div>
  );
}
