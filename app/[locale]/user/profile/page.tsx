import { auth } from "@/auth";
import { SessionProvider } from "next-auth/react";
import ProfileForm from "./profile-form";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("Metadata");
  return {
    title: t("customerProfile"),
  };
}

export default async function ProfilePage() {
  const session = await auth();
  const t = await getTranslations("UserProfile");

  return (
    <>
      <SessionProvider session={session}>
        <div className="max-w-md mx-auto space-y-4">
          <h2 className="h2-bold">{t("profile")}</h2>
          <ProfileForm />
        </div>
      </SessionProvider>
    </>
  );
}
