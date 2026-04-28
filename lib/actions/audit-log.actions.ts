"use server";

import { prisma } from "@/db/prisma";
import { assertAdmin } from "@/lib/auth-guard";
import { toPlainObject } from "@/lib/utils";
import { PAGE_SIZE } from "@/lib/constants";

export async function getAuditLogs({
  page = 1,
  limit = PAGE_SIZE,
  entity,
  action,
  userId,
}: {
  page?: number;
  limit?: number;
  entity?: string;
  action?: string;
  userId?: string;
}) {
  await assertAdmin();

  const where: {
    entity?: string;
    action?: string;
    userId?: string;
  } = {};
  if (entity) where.entity = entity;
  if (action) where.action = action;
  if (userId) where.userId = userId;

  const [data, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: (page - 1) * limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    data: toPlainObject(data),
    totalPages: Math.ceil(total / limit),
  };
}
