"use server";

import { prisma } from "@/db/prisma";
import { z } from "zod/v3";
import { getLocale, getTranslations } from "next-intl/server";
import { formatError } from "../utils";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function subscribeToNewsletter(
  prevState: unknown,
  formData: FormData
) {
  const t = await getTranslations("Actions");
  try {
    const tV = await getTranslations("Validation");

    const email = z
      .string()
      .email({ message: tV("invalidEmail") })
      .parse(
        String(formData.get("email") ?? "")
          .trim()
          .toLowerCase()
      );

    // Public unauthenticated endpoint — cap it so it can't be used to stuff the
    // table or probe which addresses are already in it.
    const rl = rateLimit({
      key: `newsletter:${await clientIp()}`,
      limit: 5,
      windowMs: 15 * 60_000,
    });
    if (!rl.success) {
      return { success: false, message: t("tooManyLoginAttempts") };
    }

    const locale = await getLocale();
    const source = String(formData.get("source") ?? "footer").slice(0, 50);

    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email },
      select: { id: true, isActive: true },
    });

    if (existing?.isActive) {
      return { success: true, message: t("newsletterAlreadySubscribed") };
    }

    if (existing) {
      // Previously unsubscribed — reactivate rather than reject.
      await prisma.newsletterSubscriber.update({
        where: { id: existing.id },
        data: { isActive: true, unsubscribedAt: null, locale },
      });
    } else {
      await prisma.newsletterSubscriber.create({
        data: { email, locale, source },
      });
    }

    return { success: true, message: t("newsletterSubscribed") };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
