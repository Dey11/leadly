import { Prisma } from "@prisma/client";
import db from "../lib/db";

export type DuplicateMonitorGroup = {
  icpId: string;
  icpName: string;
  platform: string;
  targetType: string;
  normalizedTarget: string;
  monitorCount: number;
  monitorIds: string[];
  createdAt: Date[];
};

export type MonitorDiagnosticRow = {
  id: string;
  icpId: string;
  icpName: string;
  platform: string;
  targetType: string;
  target: string;
  normalizedTarget: string;
  status: string;
  createdAt: Date;
  lastScrapedAt: Date | null;
  scrapeJobCount: number;
  newestJobAt: Date | null;
};

export type MonitorDuplicateDiagnostics = {
  accountId: string;
  monitorCount: number;
  duplicateGroupCount: number;
  duplicateMonitorCount: number;
  duplicateGroups: DuplicateMonitorGroup[];
  monitors: MonitorDiagnosticRow[];
};

export async function getMonitorDuplicateDiagnostics(
  email: string,
): Promise<MonitorDuplicateDiagnostics | null> {
  return db.$transaction(async (tx) => {
    await tx.$executeRaw`SET TRANSACTION READ ONLY`;

    const account = await tx.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: { id: true },
    });

    if (!account) {
      return null;
    }

    const duplicateGroups = await tx.$queryRaw<DuplicateMonitorGroup[]>(
      Prisma.sql`
        SELECT
          m."icpId" AS "icpId",
          i.name AS "icpName",
          m.platform::text AS platform,
          m."targetType"::text AS "targetType",
          lower(trim(m.target)) AS "normalizedTarget",
          count(*)::int AS "monitorCount",
          array_agg(m.id ORDER BY m."createdAt", m.id) AS "monitorIds",
          array_agg(m."createdAt" ORDER BY m."createdAt", m.id) AS "createdAt"
        FROM monitors m
        INNER JOIN icps i ON i.id = m."icpId"
        WHERE m."userId" = ${account.id}
        GROUP BY
          m."icpId",
          i.name,
          m.platform,
          m."targetType",
          lower(trim(m.target))
        HAVING count(*) > 1
        ORDER BY count(*) DESC, lower(trim(m.target)), i.name
      `,
    );

    const monitors = await tx.$queryRaw<MonitorDiagnosticRow[]>(Prisma.sql`
      SELECT
        m.id,
        m."icpId" AS "icpId",
        i.name AS "icpName",
        m.platform::text AS platform,
        m."targetType"::text AS "targetType",
        m.target,
        lower(trim(m.target)) AS "normalizedTarget",
        m.status::text AS status,
        m."createdAt" AS "createdAt",
        m."lastScrapedAt" AS "lastScrapedAt",
        count(j.id)::int AS "scrapeJobCount",
        max(j."createdAt") AS "newestJobAt"
      FROM monitors m
      INNER JOIN icps i ON i.id = m."icpId"
      LEFT JOIN scrape_jobs j ON j."monitorId" = m.id
      WHERE m."userId" = ${account.id}
      GROUP BY m.id, i.name
      ORDER BY lower(trim(m.target)), i.name, m."createdAt", m.id
    `);

    return {
      accountId: account.id,
      monitorCount: monitors.length,
      duplicateGroupCount: duplicateGroups.length,
      duplicateMonitorCount: duplicateGroups.reduce(
        (total, group) => total + group.monitorCount,
        0,
      ),
      duplicateGroups,
      monitors,
    };
  });
}
