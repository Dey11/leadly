import {
  type Platform,
  type Prisma,
  type RedditTargetType,
} from "@prisma/client";
import db from "../lib/db";

export const DUPLICATE_MONITOR_MESSAGE =
  "A monitor for this target and ICP already exists.";

export class DuplicateMonitorError extends Error {
  constructor() {
    super(DUPLICATE_MONITOR_MESSAGE);
  }
}

export function normalizeMonitorTargetForStorage(target: string): string {
  return target.trim().toLowerCase();
}

function identityLockKey(identity: {
  icpId: string;
  platform: Platform;
  targetType: RedditTargetType;
  target: string;
}): string {
  return [
    identity.icpId,
    identity.platform,
    identity.targetType,
    normalizeMonitorTargetForStorage(identity.target),
  ].join(":");
}

async function lockMonitorIdentity(
  tx: Prisma.TransactionClient,
  identity: {
    icpId: string;
    platform: Platform;
    targetType: RedditTargetType;
    target: string;
  },
) {
  const key = identityLockKey(identity);
  await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${key}))`;
}

export async function createMonitorWithIdentityGuard(
  data: Prisma.MonitorUncheckedCreateInput,
) {
  const identity = {
    icpId: data.icpId,
    platform: data.platform,
    targetType: data.targetType ?? "SUBREDDIT",
    target: data.target,
  };

  return db.$transaction(async (tx) => {
    await lockMonitorIdentity(tx, identity);
    const existing = await tx.monitor.findFirst({
      where: {
        icpId: identity.icpId,
        platform: identity.platform,
        targetType: identity.targetType,
        target: {
          equals: normalizeMonitorTargetForStorage(identity.target),
          mode: "insensitive",
        },
      },
      select: { id: true },
    });

    if (existing) throw new DuplicateMonitorError();
    return tx.monitor.create({ data });
  });
}

export async function updateMonitorWithIdentityGuard(input: {
  id: string;
  identity: {
    icpId: string;
    platform: Platform;
    targetType: RedditTargetType;
    target: string;
  };
  data: Prisma.MonitorUncheckedUpdateInput;
}) {
  return db.$transaction(async (tx) => {
    await lockMonitorIdentity(tx, input.identity);
    const existing = await tx.monitor.findFirst({
      where: {
        id: { not: input.id },
        icpId: input.identity.icpId,
        platform: input.identity.platform,
        targetType: input.identity.targetType,
        target: {
          equals: normalizeMonitorTargetForStorage(input.identity.target),
          mode: "insensitive",
        },
      },
      select: { id: true },
    });

    if (existing) throw new DuplicateMonitorError();
    return tx.monitor.update({ where: { id: input.id }, data: input.data });
  });
}
