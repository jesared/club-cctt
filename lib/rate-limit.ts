import { prisma } from "@/lib/prisma";
import { withPrismaRetry } from "@/lib/prisma-retry";

type RateLimitOptions = {
  bucketId: string;
  maxRequests: number;
  windowMs: number;
  now?: Date;
};

export async function checkPersistentRateLimit({
  bucketId,
  maxRequests,
  windowMs,
  now = new Date(),
}: RateLimitOptions) {
  const bucket = await withPrismaRetry(() =>
    prisma.rateLimitBucket.findUnique({
      where: { id: bucketId },
    }),
  );

  if (!bucket) {
    await withPrismaRetry(() =>
      prisma.rateLimitBucket.create({
        data: {
          id: bucketId,
          count: 1,
          windowStart: now,
        },
      }),
    );
    return true;
  }

  const windowExpires = new Date(bucket.windowStart.getTime() + windowMs);

  if (now > windowExpires) {
    await withPrismaRetry(() =>
      prisma.rateLimitBucket.update({
        where: { id: bucketId },
        data: {
          count: 1,
          windowStart: now,
        },
      }),
    );
    return true;
  }

  if (bucket.count >= maxRequests) {
    return false;
  }

  await withPrismaRetry(() =>
    prisma.rateLimitBucket.update({
      where: { id: bucketId },
      data: {
        count: bucket.count + 1,
      },
    }),
  );

  return true;
}
