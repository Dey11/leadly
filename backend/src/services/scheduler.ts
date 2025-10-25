import { scrapeJobsQueue } from "../lib/queue";
import db from "../lib/db";

export async function runScheduler() {
  const currentHour = new Date().getHours();

  // Find all users who have the current hour in their schedule
  const usersWithScheduledHour = await db.userSchedule.findMany({
    where: {
      scheduledHours: {
        has: currentHour,
      },
    },
    include: {
      user: {
        include: {
          subscription: true,
          monitors: {
            where: {
              status: "ACTIVE",
            },
            include: {
              service: true,
            },
          },
        },
      },
    },
  });

  for (const userSchedule of usersWithScheduledHour) {
    const { user } = userSchedule;

    // Skip if user has no active subscription
    if (!user.subscription) {
      continue;
    }

    // Create scrape jobs for all active monitors
    for (const monitor of user.monitors) {
      try {
        const scrapeJob = await db.scrapeJob.create({
          data: {
            monitorId: monitor.id,
            status: "PENDING",
          },
        });

        await scrapeJobsQueue.add("scrape", {
          monitorId: monitor.id,
          jobId: scrapeJob.id,
        });
      } catch (error) {
        console.error(
          `Failed to schedule scrape job for monitor ${monitor.id}:`,
          error
        );
      }
    }
  }
}
