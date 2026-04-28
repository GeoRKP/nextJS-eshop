"use server";

import { prisma } from "@/db/prisma";
import { revalidatePath } from "next/cache";
import { assertAdmin } from "@/lib/auth-guard";
import { formatError } from "@/lib/utils";
import { logAuditEvent } from "@/lib/audit-log";

export async function getSettings(group?: string) {
  const where = group ? { group } : {};
  return prisma.systemSetting.findMany({ where, orderBy: { key: "asc" } });
}

export async function getSetting(key: string) {
  return prisma.systemSetting.findUnique({ where: { key } });
}

export async function getSettingValue(key: string, defaultValue = "") {
  const setting = await prisma.systemSetting.findUnique({ where: { key } });
  return setting?.value ?? defaultValue;
}

export async function updateSetting(key: string, value: string) {
  try {
    await assertAdmin();

    if (!key || key.length > 100) {
      return { success: false, message: "Invalid setting key" };
    }
    if (value.length > 5000) {
      return { success: false, message: "Setting value too long" };
    }

    await prisma.systemSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    await logAuditEvent({
      action: "settings.update",
      entity: "SystemSetting",
      entityId: key,
      details: { key, valuePreview: value.slice(0, 100) },
    });

    revalidatePath("/admin/settings");
    return { success: true, message: "Setting updated" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function updateSettings(
  settings: { key: string; value: string }[]
) {
  try {
    await assertAdmin();

    for (const setting of settings) {
      if (
        !setting.key ||
        setting.key.length > 100 ||
        setting.value.length > 5000
      ) {
        continue;
      }
      await prisma.systemSetting.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: { key: setting.key, value: setting.value },
      });
    }

    await logAuditEvent({
      action: "settings.bulkUpdate",
      entity: "SystemSetting",
      details: { count: settings.length },
    });

    revalidatePath("/admin/settings");
    return { success: true, message: "Settings updated" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function seedDefaultSettings() {
  await assertAdmin();
  const defaults = [
    { key: "site.name", value: "AVL", type: "string", label: "Site Name", group: "general" },
    { key: "site.email", value: "info@avl.gr", type: "string", label: "Contact Email", group: "general" },
    { key: "site.phone", value: "+30 210 1234567", type: "string", label: "Phone Number", group: "general" },
    { key: "shipping.freeThreshold", value: "100", type: "number", label: "Free Shipping Threshold (€)", group: "shipping" },
    { key: "shipping.standardRate", value: "10", type: "number", label: "Standard Shipping Rate (€)", group: "shipping" },
    { key: "tax.rate", value: "24", type: "number", label: "VAT Rate (%)", group: "tax" },
    { key: "tax.enabled", value: "true", type: "boolean", label: "VAT Enabled", group: "tax" },
    { key: "maintenance.enabled", value: "false", type: "boolean", label: "Maintenance Mode", group: "maintenance" },
    { key: "maintenance.message", value: "Συντήρηση σε εξέλιξη — δοκιμάστε ξανά σύντομα.", type: "string", label: "Maintenance Message", group: "maintenance" },
    { key: "company.name", value: "AVL", type: "string", label: "Company Name", group: "company" },
    { key: "company.vat", value: "-", type: "string", label: "ΑΦΜ", group: "company" },
    { key: "company.gemi", value: "-", type: "string", label: "Γ.Ε.ΜΗ.", group: "company" },
    { key: "company.address", value: "Athens, Greece", type: "string", label: "Διεύθυνση", group: "company" },
  ];

  for (const setting of defaults) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  return { success: true, message: "Default settings seeded" };
}
