"use server";

import { getAuthSession } from "@/lib/auth-session";
import { formatError } from "../utils";
import { insertReviewSchema, createInsertReviewSchema } from "../validators";
import { z } from "zod/v3";
import { prisma } from "@/db/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { getTranslations } from "next-intl/server";

// Create and update reviews
export async function createUpdateReview(
  data: z.infer<typeof insertReviewSchema>
) {
  const { productId, title, description, rating } = data;

  try {
    const t = await getTranslations("Actions");
    const session = await getAuthSession();

    if (!session) throw new Error(t("userNotAuthenticated"));

    // Validate and store the review
    const tV = await getTranslations("Validation");
    const review = createInsertReviewSchema(tV).parse({
      userId: session?.user?.id,
      productId,
      title,
      description,
      rating,
    });

    // Get product that being reviewed
    const product = await prisma.product.findFirst({
      where: {
        id: review.productId,
      },
    });

    if (!product) throw new Error(t("productNotFound"));

    // SECURITY: only verified purchasers can review.
    // Prevents fake reviews from competitors/spammers.
    const purchased = await prisma.orderItem.findFirst({
      where: {
        productId: review.productId,
        order: {
          userId: review.userId,
          isPaid: true,
        },
      },
      select: { productId: true },
    });

    if (!purchased) throw new Error(t("mustPurchaseToReview"));

    // Check if user has already reviewed this product
    const reviewExists = await prisma.review.findFirst({
      where: {
        userId: review.userId,
        productId: review.productId,
      },
    });

    await prisma.$transaction(async (tx) => {
      if (reviewExists) {
        // Update existing review
        await tx.review.update({
          where: {
            id: reviewExists.id,
          },
          data: {
            title: review.title,
            description: review.description,
            rating: review.rating,
          },
        });
      } else {
        // Create new review
        await tx.review.create({
          data: review,
        });
      }

      // Get average rating for product
      const averageRating = await tx.review.aggregate({
        _avg: {
          rating: true,
        },
        where: {
          productId: review.productId,
        },
      })

      // Get number of reviews for product
      const numReviews = await tx.review.count({
        where: {
          productId: review.productId,
        },
      })

      // Update product with new average rating and number of reviews
      await tx.product.update({
        where: {
          id: review.productId,
        },
        data: {
          rating: averageRating._avg.rating || 0,
          numReviews: numReviews,
        },
      })
    });

    revalidatePath(`/product/${product.slug}`);
    revalidatePath(`/en/product/${product.slug}`);
    revalidateTag("reviews", "max");
    revalidateTag("products", "max");

    return {
      success: true,
      message: t("reviewSubmittedSuccessfully"),
    }
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

// Get reviews for a product with pagination
export async function getReviews({
  productId,
  page = 1,
  limit = 10,
}: {
  productId: string;
  page?: number;
  limit?: number;
}) {
  const [data, totalCount] = await Promise.all([
    prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: (page - 1) * limit,
    }),
    prisma.review.count({ where: { productId } }),
  ]);

  return {
    data,
    totalPages: Math.ceil(totalCount / limit),
  };
}


// Get a review written by the current user
export const getReviewByProductId = async ({productId} : {productId: string}) => {
  const session = await getAuthSession();
  if (!session) {
    const t = await getTranslations("Actions");
    throw new Error(t("userNotAuthenticated"));
  }

  return await prisma.review.findFirst({
    where: {
      productId,
      userId: session?.user?.id,
    },
  });
}
