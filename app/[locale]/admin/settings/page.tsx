import { getSettings } from "@/lib/actions/settings.actions";
import { requireAdmin } from "@/lib/auth-guard";
import { getTranslations } from "next-intl/server";
import SettingsForm from "./settings-form";

export async function generateMetadata() {
  return { title: "Settings" };
}

export default async function SettingsPage() {
  await requireAdmin();
  const settings = await getSettings();
  const t = await getTranslations("Admin");

  // Group settings by category
  const grouped: Record<string, typeof settings> = {};
  for (const s of settings) {
    if (!grouped[s.group]) grouped[s.group] = [];
    grouped[s.group].push(s);
  }

  return (
    <div className="space-y-4">
      <div>
        <span className="text-stamp text-accent block mb-2 hazard-mark">
          ▲ ADMIN / SETTINGS
        </span>
        <h1 className="h2-bold">{t("settingsTitle")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("settingsDescription")}
        </p>
      </div>

      {settings.length === 0 ? (
        <div className="card-premium p-8 text-center">
          <p className="text-muted-foreground mb-4">{t("noSettings")}</p>
          <p className="text-xs text-muted-foreground">
            {t("seedSettingsHint")}
          </p>
        </div>
      ) : (
        <SettingsForm groupedSettings={grouped} />
      )}
    </div>
  );
}
