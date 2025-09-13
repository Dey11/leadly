import db from "../lib/db";

export async function getUser(userId: string) {
  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      subscription: true,
    },
  });

  return {
    id: user?.id,
    email: user?.email,
    name: user?.name,
    credits: user?.credits,
    subscription: {
      status: user?.subscription?.status,
      currentPeriodEnd: user?.subscription?.currentPeriodEnd,
    },
    image: user?.image,
    emailVerified: user?.emailVerified,
    createdAt: user?.createdAt,
  };
}
