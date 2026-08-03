"use server";

import { formatError } from "../utils";
import { getTranslations } from "next-intl/server";
import { assertAdmin } from "@/lib/auth-guard";
import { createBoxNowDeliveryForOrder } from "@/lib/boxnow-fulfillment";
import { listDestinations, type BoxNowLocker } from "../boxnow";

/**
 * Search Box Now lockers for the checkout picker. Requires Box Now credentials to be set;
 * returns a friendly error otherwise so the UI can degrade gracefully.
 */
export async function getBoxNowLockers(params?: {
  latlng?: string;
  radius?: number;
}): Promise<{ success: boolean; data?: BoxNowLocker[]; error?: string }> {
  try {
    const lockers = await listDestinations({
      latlng: params?.latlng,
      radius: params?.radius ?? 25000,
    });
    return { success: true, data: lockers };
  } catch (error) {
    return { success: false, error: formatError(error) };
  }
}

/** Admin action: manually (re)create the Box Now voucher for an order. */
export async function createBoxNowDeliveryRequest(orderId: string) {
  try {
    await assertAdmin();
    const res = await createBoxNowDeliveryForOrder(orderId);
    const t = await getTranslations("Actions");
    if (!res.created && res.reason === "already created") {
      return { success: true, message: t("boxnowVoucherExists"), data: res };
    }
    if (!res.created) {
      return { success: false, error: res.reason || "could not create voucher" };
    }
    return { success: true, message: t("boxnowVoucherCreated"), data: res };
  } catch (error) {
    return { success: false, error: formatError(error) };
  }
}
