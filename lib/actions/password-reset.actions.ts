"use server";

import { prisma } from "@/db/prisma";
import { hashSync } from "bcrypt-ts";
import { sendPasswordResetEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { formatError } from "@/lib/utils";
import { getTranslations } from "next-intl/server";
import { SERVER_URL } from "@/lib/constants";

const RESET_TOKEN_EXPIRY_MINUTES = 30;

export async function requestPasswordReset(
  prevState: unknown,
  formData: FormData
) {
  const t = await getTranslations("Actions");
  try {
    const email = (formData.get("email") as string)?.toLowerCase().trim();

    if (!email) {
      return { success: false, message: t("emailRequired") };
    }

    // Rate limit: 3 requests per 15 minutes per email
    const rl = rateLimit({
      key: `pwd-reset:${email}`,
      limit: 3,
      windowMs: 15 * 60_000,
    });
    if (!rl.success) {
      // Return success even on rate limit to prevent email enumeration
      return { success: true, message: t("passwordResetSent") };
    }

    const user = await prisma.user.findFirst({
      where: { email, deletedAt: null, password: { not: null } },
    });

    // Always return same message to prevent email enumeration
    if (!user) {
      return { success: true, message: t("passwordResetSent") };
    }

    // Delete any existing tokens for this email
    await prisma.passwordResetToken.deleteMany({ where: { email } });

    // Generate secure token (~64 chars)
    const token = crypto.randomUUID() + crypto.randomUUID();
    const expires = new Date(
      Date.now() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000
    );

    await prisma.passwordResetToken.create({
      data: { email, token, expires },
    });

    const base = SERVER_URL || "http://localhost:3000";
    const resetUrl = `${base}/reset-password?token=${token}`;

    await sendPasswordResetEmail(email, {
      name: user.name,
      resetUrl,
      expiresInMinutes: RESET_TOKEN_EXPIRY_MINUTES,
    });

    return { success: true, message: t("passwordResetSent") };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function resetPassword(prevState: unknown, formData: FormData) {
  const t = await getTranslations("Actions");
  try {
    const token = formData.get("token") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!token || !password || !confirmPassword) {
      return { success: false, message: t("allFieldsRequired") };
    }

    if (password.length < 8) {
      return { success: false, message: t("passwordMinLength") };
    }

    if (password !== confirmPassword) {
      return { success: false, message: t("passwordsMustMatch") };
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return { success: false, message: t("invalidResetLink") };
    }

    if (resetToken.expires < new Date()) {
      await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });
      return { success: false, message: t("resetLinkExpired") };
    }

    const user = await prisma.user.findFirst({
      where: { email: resetToken.email, deletedAt: null },
    });

    if (!user) {
      return { success: false, message: t("userNotFound") };
    }

    const hashedPassword = hashSync(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Single-use token: delete after successful reset
    await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });

    return { success: true, message: t("passwordResetSuccess") };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
