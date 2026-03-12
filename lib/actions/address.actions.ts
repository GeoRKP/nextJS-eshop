"use server";

import { prisma } from "@/db/prisma";
import { getAuthSession } from "@/lib/auth-session";
import { formatError, toPlainObject } from "../utils";
import { revalidatePath } from "next/cache";
import { createInsertAddressSchema, createUpdateAddressSchema } from "../validators";
import { z } from "zod/v3";
import { insertAddressSchema, updateAddressSchema } from "../validators";
import { getTranslations } from "next-intl/server";

// Get all addresses for the current user
export async function getMyAddresses() {
  const session = await getAuthSession();
  if (!session?.user?.id) return [];

  const data = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return toPlainObject(data);
}

// Get address by id
export async function getAddressById(id: string) {
  const session = await getAuthSession();
  if (!session?.user?.id) return null;

  const data = await prisma.address.findFirst({
    where: { id, userId: session.user.id },
  });

  return data ? toPlainObject(data) : null;
}

// Get default address
export async function getDefaultAddress() {
  const session = await getAuthSession();
  if (!session?.user?.id) return null;

  const data = await prisma.address.findFirst({
    where: { userId: session.user.id, isDefault: true },
  });

  return data ? toPlainObject(data) : null;
}

// Create address
export async function createAddress(data: z.infer<typeof insertAddressSchema>) {
  try {
    const t = await getTranslations("Actions");
    const tV = await getTranslations("Validation");
    const session = await getAuthSession();

    if (!session?.user?.id) {
      throw new Error(t("userNotAuthenticated"));
    }

    const parsed = createInsertAddressSchema(tV).parse(data);

    // If setting as default, unset other defaults
    if (parsed.isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    // If this is the first address, make it default
    const addressCount = await prisma.address.count({
      where: { userId: session.user.id },
    });

    await prisma.address.create({
      data: {
        ...parsed,
        userId: session.user.id,
        isDefault: parsed.isDefault || addressCount === 0,
      },
    });

    revalidatePath("/user/addresses");
    revalidatePath("/en/user/addresses");
    revalidatePath("/shipping-address");
    revalidatePath("/en/shipping-address");

    return { success: true, message: t("addressCreatedSuccessfully") };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Update address
export async function updateAddress(data: z.infer<typeof updateAddressSchema>) {
  try {
    const t = await getTranslations("Actions");
    const tV = await getTranslations("Validation");
    const session = await getAuthSession();

    if (!session?.user?.id) {
      throw new Error(t("userNotAuthenticated"));
    }

    const parsed = createUpdateAddressSchema(tV).parse(data);

    const existing = await prisma.address.findFirst({
      where: { id: parsed.id, userId: session.user.id },
    });

    if (!existing) throw new Error(t("addressNotFound"));

    // If setting as default, unset other defaults
    if (parsed.isDefault && !existing.isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    await prisma.address.update({
      where: { id: parsed.id },
      data: {
        label: parsed.label,
        fullName: parsed.fullName,
        phone: parsed.phone,
        address: parsed.address,
        address2: parsed.address2,
        city: parsed.city,
        state: parsed.state,
        postalCode: parsed.postalCode,
        country: parsed.country,
        lat: parsed.lat,
        lng: parsed.lng,
        isDefault: parsed.isDefault,
      },
    });

    revalidatePath("/user/addresses");
    revalidatePath("/en/user/addresses");
    revalidatePath("/shipping-address");
    revalidatePath("/en/shipping-address");

    return { success: true, message: t("addressUpdatedSuccessfully") };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Delete address
export async function deleteAddress(id: string) {
  try {
    const t = await getTranslations("Actions");
    const session = await getAuthSession();

    if (!session?.user?.id) {
      throw new Error(t("userNotAuthenticated"));
    }

    const existing = await prisma.address.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) throw new Error(t("addressNotFound"));

    await prisma.address.delete({ where: { id } });

    // If deleted was default, make the most recent one default
    if (existing.isDefault) {
      const nextDefault = await prisma.address.findFirst({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
      });

      if (nextDefault) {
        await prisma.address.update({
          where: { id: nextDefault.id },
          data: { isDefault: true },
        });
      }
    }

    revalidatePath("/user/addresses");
    revalidatePath("/en/user/addresses");
    revalidatePath("/shipping-address");
    revalidatePath("/en/shipping-address");

    return { success: true, message: t("addressDeletedSuccessfully") };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Set address as default
export async function setDefaultAddress(id: string) {
  try {
    const t = await getTranslations("Actions");
    const session = await getAuthSession();

    if (!session?.user?.id) {
      throw new Error(t("userNotAuthenticated"));
    }

    // Unset all defaults
    await prisma.address.updateMany({
      where: { userId: session.user.id, isDefault: true },
      data: { isDefault: false },
    });

    // Set new default
    await prisma.address.update({
      where: { id },
      data: { isDefault: true },
    });

    revalidatePath("/user/addresses");
    revalidatePath("/en/user/addresses");
    revalidatePath("/shipping-address");
    revalidatePath("/en/shipping-address");

    return { success: true, message: t("defaultAddressUpdatedSuccessfully") };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
