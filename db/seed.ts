import { PrismaClient } from '@prisma/client'
import sampleData from './sample-data'
import { categoryTranslationsEn } from '../lib/data/category-translations-en'
import { productTranslationsEn } from '../lib/data/product-translations-en'

const prisma = new PrismaClient()

async function main() {
  // ── 1. Clear existing data (FK-safe order) ──────────────────────
  console.log('Clearing existing data...')

  await prisma.couponUsage.deleteMany()
  await prisma.couponProduct.deleteMany()
  await prisma.couponCategory.deleteMany()
  await prisma.coupon.deleteMany()

  await prisma.wishlistItem.deleteMany()
  await prisma.wishlist.deleteMany()

  await prisma.notification.deleteMany()
  await prisma.returnRequest.deleteMany()
  await prisma.orderStatusHistory.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()

  await prisma.cart.deleteMany()
  await prisma.review.deleteMany()
  await prisma.address.deleteMany()

  await prisma.product.deleteMany()
  await prisma.category.deleteMany()

  await prisma.account.deleteMany()
  await prisma.session.deleteMany()
  await prisma.verificationToken.deleteMany()
  await prisma.user.deleteMany()

  console.log('All tables cleared.')

  // ── 2. Seed categories ──────────────────────────────────────────
  console.log('Seeding categories...')

  // Create parent categories first
  const parentCategories = sampleData.categories.filter(
    (c) => c.parentSlug === null
  )
  const childCategories = sampleData.categories.filter(
    (c) => c.parentSlug !== null
  )

  // Build a slug → id map
  const categoryMap = new Map<string, string>()

  for (const cat of parentCategories) {
    const en = categoryTranslationsEn[cat.slug]
    const created = await prisma.category.create({
      data: {
        name: cat.name,
        nameEn: en?.name ?? null,
        slug: cat.slug,
        description: cat.description,
        descriptionEn: en?.description ?? null,
        image: cat.image,
        sortOrder: cat.sortOrder,
        isActive: true,
      },
    })
    categoryMap.set(cat.slug, created.id)
  }

  console.log(`  ${parentCategories.length} parent categories created.`)

  // Create child categories with parentId
  for (const cat of childCategories) {
    const parentId = categoryMap.get(cat.parentSlug!)
    if (!parentId) {
      console.warn(`  ⚠ Parent slug "${cat.parentSlug}" not found for "${cat.name}"`)
      continue
    }
    const en = categoryTranslationsEn[cat.slug]
    const created = await prisma.category.create({
      data: {
        name: cat.name,
        nameEn: en?.name ?? null,
        slug: cat.slug,
        description: cat.description,
        descriptionEn: en?.description ?? null,
        image: cat.image,
        parentId,
        sortOrder: cat.sortOrder,
        isActive: true,
      },
    })
    categoryMap.set(cat.slug, created.id)
  }

  console.log(`  ${childCategories.length} child categories created.`)

  // ── 3. Seed products ────────────────────────────────────────────
  console.log('Seeding products...')

  let productCount = 0
  let featuredCount = 0

  // Build a slug → id map for products
  const productMap = new Map<string, { id: string; name: string; slug: string; images: string[] }>()

  for (const product of sampleData.products) {
    const categoryId = categoryMap.get(product.categorySlug) ?? null
    const en = productTranslationsEn[product.slug]

    const created = await prisma.product.create({
      data: {
        name: product.name,
        nameEn: en?.name ?? null,
        slug: product.slug,
        category: product.category,
        categoryId,
        description: product.description,
        descriptionEn: en?.description ?? null,
        images: product.images,
        price: product.price,
        brand: product.brand,
        rating: product.rating,
        numReviews: product.numReviews,
        stock: product.stock,
        isFeatured: product.isFeatured,
        banner: product.banner,
        specs: product.specs ?? null,
      },
    })

    productMap.set(product.slug, {
      id: created.id,
      name: product.name,
      slug: product.slug,
      images: product.images,
    })

    productCount++
    if (product.isFeatured) featuredCount++
  }

  console.log(
    `  ${productCount} products created (${featuredCount} featured).`
  )

  // ── 4. Seed users ──────────────────────────────────────────────
  console.log('Seeding users...')

  // Build an email → id map for users
  const userMap = new Map<string, string>()

  for (const user of sampleData.users) {
    const created = await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        role: user.role,
        password: user.password,
      },
    })
    userMap.set(user.email, created.id)
  }

  console.log(`  ${sampleData.users.length} users created.`)

  // ── 5. Seed coupons ─────────────────────────────────────────────
  console.log('Seeding coupons...')

  for (const coupon of sampleData.coupons) {
    await prisma.coupon.create({
      data: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minOrderAmount: coupon.minOrderAmount,
        maxDiscount: coupon.maxDiscount,
        maxUses: coupon.maxUses,
        maxUsesPerUser: coupon.maxUsesPerUser,
        validFrom: coupon.validFrom,
        validUntil: coupon.validUntil,
        isActive: coupon.isActive,
        appliesToAll: coupon.appliesToAll,
      },
    })
  }

  console.log(`  ${sampleData.coupons.length} coupons created.`)

  // ── 6. Seed reviews ───────────────────────────────────────────
  console.log('Seeding reviews...')

  let reviewCount = 0

  for (const review of sampleData.reviews) {
    const userId = userMap.get(review.userEmail)
    const product = productMap.get(review.productSlug)

    if (!userId) {
      console.warn(`  Warning: User "${review.userEmail}" not found, skipping review.`)
      continue
    }
    if (!product) {
      console.warn(`  Warning: Product "${review.productSlug}" not found, skipping review.`)
      continue
    }

    await prisma.review.create({
      data: {
        userId,
        productId: product.id,
        rating: review.rating,
        title: review.title,
        description: review.description,
        isVerifiedPurchase: review.isVerifiedPurchase,
      },
    })

    reviewCount++
  }

  console.log(`  ${reviewCount} reviews created.`)

  // ── 7. Seed orders with order items ───────────────────────────
  console.log('Seeding orders...')

  let orderCount = 0
  let orderItemCount = 0

  for (const order of sampleData.orders) {
    const userId = userMap.get(order.userEmail)

    if (!userId) {
      console.warn(`  Warning: User "${order.userEmail}" not found, skipping order.`)
      continue
    }

    // Calculate order totals from items
    const itemsPrice = order.items.reduce(
      (sum, item) => sum + item.qty * item.price,
      0
    )
    const shippingPrice = itemsPrice > 100 ? 0 : 5.0
    const taxPrice = Number((itemsPrice * 0.24).toFixed(2))
    const totalPrice = Number(
      (itemsPrice + shippingPrice + taxPrice).toFixed(2)
    )

    const createdOrder = await prisma.order.create({
      data: {
        userId,
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
        isPaid: order.isPaid,
        paidAt: order.paidAt,
        isDelivered: order.isDelivered,
        deliveredAt: order.deliveredAt,
        status: order.status,
        createdAt: order.createdAt,
      },
    })

    // Create order items
    for (const item of order.items) {
      const product = productMap.get(item.productSlug)

      if (!product) {
        console.warn(`  Warning: Product "${item.productSlug}" not found, skipping order item.`)
        continue
      }

      await prisma.orderItem.create({
        data: {
          orderId: createdOrder.id,
          productId: product.id,
          qty: item.qty,
          price: item.price,
          name: product.name,
          slug: product.slug,
          image: product.images[0] ?? '/images/placeholder.svg',
        },
      })

      orderItemCount++
    }

    orderCount++
  }

  console.log(`  ${orderCount} orders created (${orderItemCount} items).`)

  // ── Done ───────────────────────────────────────────────────────
  console.log('\nDatabase seeded successfully!')
  console.log(`  Categories: ${categoryMap.size}`)
  console.log(`  Products:   ${productCount}`)
  console.log(`  Users:      ${sampleData.users.length}`)
  console.log(`  Coupons:    ${sampleData.coupons.length}`)
  console.log(`  Reviews:    ${reviewCount}`)
  console.log(`  Orders:     ${orderCount} (${orderItemCount} items)`)
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
