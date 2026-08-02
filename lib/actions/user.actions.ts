"use server";

import {
  paymentMethodSchema,
  updateUserSchema,
  createSignInFormSchema,
  createSignUpFormSchema,
  createShippingAddressSchema,
  createPaymentMethodSchema,
} from "../validators";
import { auth, signIn, signOut } from "@/auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { hashSync } from "bcrypt-ts";
import { prisma } from "@/db/prisma";
import { formatError } from "../utils";
import { ShippingAddress } from "@/types";
import { z } from "zod/v3";
import { PAGE_SIZE } from "../constants";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";
import { assertAdmin } from "@/lib/auth-guard";
import { safeCallbackUrl } from "@/lib/safe-redirect";
import { createGuestToken } from "@/lib/guest-token";
import { Prisma } from "@prisma/client";

export async function signInWithCredentials(
  prevState: unknown,
  formData: FormData
) {
  try {
    const t = await getTranslations("Actions");
    const tV = await getTranslations("Validation");
    const user = createSignInFormSchema(tV).parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    // Throttle brute-force / password-spraying: cap attempts per IP+email.
    const ip =
      (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    const rl = rateLimit({
      key: `login:${ip}:${user.email.toLowerCase()}`,
      limit: 10,
      windowMs: 15 * 60_000,
    });
    if (!rl.success) {
      return { success: false, message: t("tooManyLoginAttempts") };
    }

    // Send the user back to where they came from (e.g. a checkout step) —
    // without redirectTo, NextAuth falls back to the home page.
    await signIn("credentials", {
      ...user,
      redirectTo: safeCallbackUrl(formData.get("callbackUrl") as string | null),
    });

    return { success: true, message: t("signedInSuccessfully") };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    const t = await getTranslations("Actions");
    return { success: false, message: t("invalidEmailOrPassword") };
  }
}

export async function signOutUser() {
  await signOut();
}

/**
 * Guest checkout: create (or reuse) a passwordless shadow account for the given
 * email and mint a session for it via the "guest" provider, then continue to
 * the checkout step in callbackUrl.
 */
export async function continueAsGuest(prevState: unknown, formData: FormData) {
  try {
    const t = await getTranslations("Actions");
    const tV = await getTranslations("Validation");

    const email = z
      .string()
      .email({ message: tV("invalidEmail") })
      .parse(
        String(formData.get("email") ?? "")
          .trim()
          .toLowerCase()
      );

    // Same throttle profile as login: guests can enumerate emails otherwise.
    const ip =
      (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    const rl = rateLimit({
      key: `guest:${ip}`,
      limit: 10,
      windowMs: 15 * 60_000,
    });
    if (!rl.success) {
      return { success: false, message: t("tooManyLoginAttempts") };
    }

    const existing = await prisma.user.findFirst({
      where: { email, deletedAt: null },
    });

    if (existing && !existing.isGuest) {
      return { success: false, message: t("guestEmailHasAccount") };
    }

    let user;
    if (existing) {
      // Returning guest email: wipe the previously stored personal data so
      // whoever types this email cannot see the earlier session's address.
      user = await prisma.user.update({
        where: { id: existing.id },
        data: { address: Prisma.DbNull, paymentMethod: null },
      });
    } else {
      user = await prisma.user.create({
        data: {
          email,
          name: email.split("@")[0],
          isGuest: true,
          // No password on purpose: guests can never sign in via the normal
          // form; they can claim the account later through password reset.
          password: null,
        },
      });
    }

    await signIn("guest", {
      token: createGuestToken(user.id),
      redirectTo: safeCallbackUrl(
        formData.get("callbackUrl") as string | null,
        "/shipping-address"
      ),
    });

    return { success: true, message: t("signedInSuccessfully") };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return { success: false, message: formatError(error) };
  }
}

export async function signUpUser(prevState: unknown, formData: FormData) {
  try {
    const t = await getTranslations("Actions");
    const tV = await getTranslations("Validation");
    const user = createSignUpFormSchema(tV).parse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    const plainPassword = user.password;

    user.password = hashSync(user.password, 12);

    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
      },
    });

    await signIn("credentials", {
      email: user.email,
      password: plainPassword,
      redirectTo: safeCallbackUrl(formData.get("callbackUrl") as string | null),
    });

    return { success: true, message: t("userRegisteredSuccessfully") };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    return { success: false, message: formatError(error) };
  }
}

// Get user by id
export async function getUserById(id: string) {
  const user = await prisma.user.findFirst({
    where: { id },
    // Never haul the bcrypt hash around with checkout/profile reads.
    omit: { password: true },
  });

  if (!user) {
    const t = await getTranslations("Actions");
    throw new Error(t("userNotFound"));
  }

  return user;
}

// Update the user's address
export async function updateUserAddress(data: ShippingAddress) {
  try {
    const t = await getTranslations("Actions");
    const session = await auth();

    const currentUser = await prisma.user.findFirst({
      where: {
        id: session?.user?.id,
      },
    });

    if (!currentUser) {
      throw new Error(t("userNotFound"));
    }

    const tV = await getTranslations("Validation");
    const address = createShippingAddressSchema(tV).parse(data);

    await prisma.user.update({
      where: { id: currentUser.id },
      data: { address: address },
    });

    return { success: true, message: t("addressUpdatedSuccessfully") };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Update user's payment method

export async function updateUserPaymentMethod(
  data: z.infer<typeof paymentMethodSchema>
) {
  try {
    const t = await getTranslations("Actions");
    const session = await auth();

    const currentUser = await prisma.user.findFirst({
      where: {
        id: session?.user?.id,
      },
    });

    if (!currentUser) {
      throw new Error(t("userNotFound"));
    }

    const tV = await getTranslations("Validation");
    const paymentMethod = createPaymentMethodSchema(tV).parse(data);

    await prisma.user.update({
      where: { id: currentUser.id },
      data: { paymentMethod: paymentMethod.type },
    });

    return { success: true, message: t("paymentMethodUpdatedSuccessfully") };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Update user's profile
export async function updateProfile(user: { name: string; email: string }) {
  try {
    const t = await getTranslations("Actions");
    const session = await auth();

    const currentUser = await prisma.user.findFirst({
      where: {
        id: session?.user?.id,
      },
    });

    if (!currentUser) {
      throw new Error(t("userNotFound"));
    }

    await prisma.user.update({
      where: { id: currentUser.id },
      data: { name: user.name },
    });

    return { success: true, message: t("userUpdatedSuccessfully") };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Get all users
export async function getAllUsers({
  limit = PAGE_SIZE,
  page,
  query,
}: {
  limit?: number;
  page: number;
  query: string;
}) {
  await assertAdmin();
  const data = await prisma.user.findMany({
    where: {
      name: {
        contains: query,
        mode: "insensitive",
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    skip: (page - 1) * limit,
    take: limit,
  });

  const dataCount = await prisma.user.count({
    where: {
      name: {
        contains: query,
        mode: "insensitive",
      },
    },
  });

  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
  };
}

// Delete a user
export async function deleteUser(id: string) {
  try {
    await assertAdmin();
    const t = await getTranslations("Actions");

    // Refuse to hard-delete a user who has orders: Order.userId cascades, so a
    // delete would permanently destroy their orders/invoices — a breach of
    // Greek tax record-retention. Only accounts with no orders can be removed.
    const orderCount = await prisma.order.count({ where: { userId: id } });
    if (orderCount > 0) {
      return { success: false, message: t("cannotDeleteUserWithOrders") };
    }

    await prisma.user.delete({
      where: { id },
    });

    revalidatePath("/admin/users");

    return { success: true, message: t("userDeletedSuccessfully") };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Update a user
export async function updateUser(user: z.infer<typeof updateUserSchema>) {
  try {
    await assertAdmin();
    const t = await getTranslations("Actions");
    // Validate server-side: never trust the typed input verbatim. This also
    // constrains `role` to the allowed set (see updateUserSchema).
    const parsed = updateUserSchema.parse(user);
    await prisma.user.update({
      where: { id: parsed.id },
      data: {
        name: parsed.name,
        role: parsed.role,
      },
    });

    revalidatePath("/admin/users");

    return { success: true, message: t("userUpdatedSuccessfully") };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
