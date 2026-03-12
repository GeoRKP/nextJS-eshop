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

    await signIn("credentials", user);

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

    user.password = hashSync(user.password, 10);

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
    const t = await getTranslations("Actions");
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
    const t = await getTranslations("Actions");
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: user.name,
        role: user.role,
      },
    });

    revalidatePath("/admin/users");

    return { success: true, message: t("userUpdatedSuccessfully") };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
