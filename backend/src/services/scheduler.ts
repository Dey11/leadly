import { scrapeJobsQueue } from "../lib/queue";
import db from "../lib/db";

export async function runScheduler() {
  console.log("Running scheduler");
  const currentHour = new Date().getHours();
  console.log("Current hour:", currentHour);

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

  console.log("Users with scheduled hour:", usersWithScheduledHour.length);

  for (const userSchedule of usersWithScheduledHour) {
    const { user } = userSchedule;

    // Skip if user has no active subscription
    if (!user.subscription) {
      continue;
    }

    console.log("User:", user.id);

    // Create scrape jobs for all active monitors
    for (const monitor of user.monitors) {
      try {
        console.log("Creating scrape job for monitor:", monitor.id);
        const scrapeJob = await db.scrapeJob.create({
          data: {
            monitorId: monitor.id,
            status: "PENDING",
          },
        });

        await scrapeJobsQueue.add("scrapeJobs", {
          monitorId: monitor.id,
          jobId: scrapeJob.id,
        });
        console.log("Scrape job created for monitor:", monitor.id);
      } catch (error) {
        console.error(
          `Failed to schedule scrape job for monitor ${monitor.id}:`,
          error
        );
      }
    }
  }
}
