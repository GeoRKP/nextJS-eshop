"use server";

import { prisma } from "@/db/prisma";
import { revalidatePath } from "next/cache";
import { assertAdmin } from "@/lib/auth-guard";
import { formatError } from "@/lib/utils";
import { logAuditEvent } from "@/lib/audit-log";

export async function banUser(userId: string, reason: string) {
  try {
    await assertAdmin();

    if (!reason?.trim()) {
      return { success: false, message: "Reason required" };
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: true,
        bannedAt: new Date(),
        bannedReason: reason.trim().slice(0, 500),
      },
    });

    await logAuditEvent({
      action: "user.ban",
      entity: "User",
      entityId: userId,
      details: { reason },
    });

    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${userId}`);
    return { success: true, message: "User banned" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function unbanUser(userId: string) {
  try {
    await assertAdmin();

    await prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: false,
        bannedAt: null,
        bannedReason: null,
      },
    });

    await logAuditEvent({
      action: "user.unban",
      entity: "User",
      entityId: userId,
    });

    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${userId}`);
    return { success: true, message: "User unbanned" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function suspendUser(
  userId: string,
  reason: string,
  durationDays: number
) {
  try {
    await assertAdmin();

    if (!reason?.trim() || !durationDays || durationDays < 1) {
      return { success: false, message: "Invalid suspension parameters" };
    }

    const until = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: userId },
      data: {
        suspendedUntil: until,
        suspendedReason: reason.trim().slice(0, 500),
      },
    });

    await logAuditEvent({
      action: "user.suspend",
      entity: "User",
      entityId: userId,
      details: { reason, until: until.toISOString() },
    });

    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${userId}`);
    return { success: true, message: "User suspended" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function unsuspendUser(userId: string) {
  try {
    await assertAdmin();

    await prisma.user.update({
      where: { id: userId },
      data: {
        suspendedUntil: null,
        suspendedReason: null,
      },
    });

    await logAuditEvent({
      action: "user.unsuspend",
      entity: "User",
      entityId: userId,
    });

    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${userId}`);
    return { success: true, message: "User unsuspended" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
