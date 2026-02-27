import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("Metadata");
  return {
    title: t("unauthorizedAccess"),
    description: t("unauthorizedDescription"),
  };
}

export default async function Unauthorized() {
  const t = await getTranslations("Unauthorized");
  const tCommon = await getTranslations("Common");

  return (
    <div className="container mx-auto flex flex-col items-center justify-center space-y-4 h-[calc(100vh-200px)]">
      <h1 className="text-4xl h1-bold">{t("title")}</h1>
      <p className="text-muted-foreground">{t("description")}</p>
      <Button asChild>
        <Link href="/">{tCommon("goToHome")}</Link>
      </Button>
    </div>
  );
}
