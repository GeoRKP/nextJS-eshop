import { getUserById } from "@/lib/actions/user.actions";
import { notFound } from "next/navigation";
import UpdateUserForm from "./update-user-form";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("Metadata");
  return {
    title: t("updateUser"),
  };
}

export default async function AdminUserUpdatePage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  const user = await getUserById(id);

  if (!user) {
    notFound();
  }

  const t = await getTranslations("UpdateUser");

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="h2-bold mb-6">{t("updateUser")}</h1>
      <div className="card-premium p-6 md:p-8">
        <UpdateUserForm user={user} />
      </div>
    </div>
  );
}
