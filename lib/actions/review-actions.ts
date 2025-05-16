"use server";

import { auth } from "@/auth";
import { formatError } from "../utils";
import { insertReviewSchema } from "../validators";
import { z } from "zod";
import { prisma } from "@/db/prisma";
import { revalidatePath } from "next/cache";

// Create and update reviews
export async function createUpdateReview(
  data: z.infer<typeof insertReviewSchema>
) {
  const { productId, title, description, rating } = data;

  try {
    const session = await auth();

    if (!session) throw new Error("User is not authenticated");

    // Validate and store the review
    const review = insertReviewSchema.parse({
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

    if (!product) throw new Error("Product not found");

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

    return {
      success: true,
      message: "Review submitted successfully",
    }
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

// Get all reviews for a product
export async function getReviews({ productId }: { productId: string }) {
  const data = await prisma.review.findMany({
    where: {
      productId,
    },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return { data };
}


// Get a review written by the current user
export const getReviewByProductId = async ({productId} : {productId: string}) => {
  const session = await auth();
  if (!session) throw new Error("User is not authenticated");

  return await prisma.review.findFirst({
    where: {
      productId,
      userId: session?.user?.id,
    },
  });
}
