export type RetryableFailedMonitorJob = {
  id: string;
  monitorId: string;
  monitorTarget: string;
  createdAt: Date;
  retryCount: number;
  errorMessage: string | null;
};

export function selectLatestFailedJobsWithoutActiveMonitor(
  failedJobs: RetryableFailedMonitorJob[],
  activeMonitorIds: Set<string>,
): RetryableFailedMonitorJob[] {
  const latestByMonitor = new Map<string, RetryableFailedMonitorJob>();

  for (const job of failedJobs) {
    if (activeMonitorIds.has(job.monitorId)) continue;
    const existing = latestByMonitor.get(job.monitorId);
    if (
      !existing ||
      job.createdAt.getTime() > existing.createdAt.getTime() ||
      (job.createdAt.getTime() === existing.createdAt.getTime() &&
        job.id > existing.id)
    ) {
      latestByMonitor.set(job.monitorId, job);
    }
  }

  return [...latestByMonitor.values()].sort(
    (left, right) =>
      left.createdAt.getTime() - right.createdAt.getTime() ||
      left.id.localeCompare(right.id),
  );
}
