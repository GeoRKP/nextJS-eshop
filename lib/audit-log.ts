"use server";

import { prisma } from "@/db/prisma";
import { auth } from "@/auth";

// Fields that should never be logged
const SENSITIVE_FIELDS = [
  "password",
  "secret",
  "token",
  "apikey",
  "creditcard",
  "cvv",
];

function sanitizeDetails(
  details?: Record<string, unknown>
): Record<string, unknown> | null {
  if (!details) return null;
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(details)) {
    if (SENSITIVE_FIELDS.some((f) => key.toLowerCase().includes(f))) {
      sanitized[key] = "[REDACTED]";
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export async function logAuditEvent({
  action,
  entity,
  entityId,
  details,
}: {
  action: string;
  entity: string;
  entityId?: string;
  details?: Record<string, unknown>;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) return;

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        userName: session.user.name || "Unknown",
        action,
        entity,
        entityId: entityId || null,
        details: sanitizeDetails(details) as never,
      },
    });
  } catch {
    // Don't let audit logging failures break the main action
  }
}
