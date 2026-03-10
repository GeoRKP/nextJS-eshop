import { getAuthSession } from "@/lib/auth-session";
import { SessionProvider } from "next-auth/react";
import ProfileForm from "./profile-form";
import { getTranslations } from "next-intl/server";
import { User } from "lucide-react";

export async function generateMetadata() {
  const t = await getTranslations("Metadata");
  return {
    title: t("customerProfile"),
  };
}

export default async function ProfilePage() {
  const session = await getAuthSession();
  const t = await getTranslations("UserProfile");

  return (
    <SessionProvider session={session}>
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <User className="w-6 h-6 text-brand-accent" />
          <h2 className="h2-bold">{t("profile")}</h2>
        </div>
        <div className="card-premium p-6 md:p-8">
          <ProfileForm />
        </div>
      </div>
    </SessionProvider>
  );
}
