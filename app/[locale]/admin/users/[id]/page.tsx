import { getUserById } from "@/lib/actions/user.actions";
import { notFound } from "next/navigation";
import UpdateUserForm from "./update-user-form";
import UserModeration from "./user-moderation";
import { getTranslations } from "next-intl/server";
import { requireAdmin } from "@/lib/auth-guard";

export async function generateMetadata() {
  const t = await getTranslations("Metadata");
  return {
    title: t("updateUser"),
  };
}

export default async function AdminUserUpdatePage(props: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await props.params;

  const user = await getUserById(id);

  if (!user) {
    notFound();
  }

  const t = await getTranslations("UpdateUser");

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="h2-bold">{t("updateUser")}</h1>
      <div className="card-premium p-6 md:p-8">
        <UpdateUserForm user={user} />
      </div>
      <UserModeration
        userId={user.id}
        isBanned={user.isBanned}
        suspendedUntil={
          user.suspendedUntil ? user.suspendedUntil.toISOString() : null
        }
      />
    </div>
  );
}
