"use client";

import { useState, useEffect, useMemo } from "react";
import type { ScheduledJob } from "@/lib/scheduler/types";

export type SchedulerCalendarState = ReturnType<typeof useSchedulerCalendar>;

export function useSchedulerCalendar() {
  const [jobs, setJobs] = useState<ScheduledJob[]>([]);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [viewFilter, setViewFilter] = useState<"ALL" | "UPCOMING" | "RUNNING" | "COMPLETED" | "FAILED">("ALL");

  const fetchJobs = async () => {
    try {
      const res = await fetch("/api/publish/schedule");
      if (res.ok) {
        const data = await res.json();
        const loadedJobs = (data.jobs || []).map((j: any) => ({
          ...j,
          createdAt: new Date(j.createdAt),
          scheduledFor: new Date(j.scheduledFor),
          startedAt: j.startedAt ? new Date(j.startedAt) : undefined,
          completedAt: j.completedAt ? new Date(j.completedAt) : undefined,
          logs: (j.logs || []).map((log: any) => ({
            ...log,
            timestamp: new Date(log.timestamp),
          })),
        }));
        setJobs(loadedJobs);
      }
    } catch (err) {
      console.error("Failed to fetch scheduled jobs:", err);
    }
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 5000);
    return () => clearInterval(interval);
  }, []);

  const activeJob = useMemo(() => {
    return jobs.find(j => j.id === activeJobId) || null;
  }, [jobs, activeJobId]);

  const filteredJobs = useMemo(() => {
    switch (viewFilter) {
      case "UPCOMING":
        return jobs.filter(j => ["DRAFT", "SCHEDULED", "WAITING"].includes(j.status));
      case "RUNNING":
        return jobs.filter(j => j.status === "RUNNING");
      case "COMPLETED":
        return jobs.filter(j => j.status === "SUCCESS");
      case "FAILED":
        return jobs.filter(j => ["FAILED", "CANCELLED"].includes(j.status));
      default:
        return jobs;
    }
  }, [jobs, viewFilter]);

  const triggerJobAction = async (id: string, action: "cancel" | "retry" | "run_now") => {
    try {
      const res = await fetch("/api/publish/schedule", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, jobId: id }),
      });
      if (res.ok) {
        await fetchJobs();
      }
    } catch (err) {
      console.error(`Failed to trigger ${action} on job ${id}:`, err);
    }
  };

  const cancelJob = (id: string) => triggerJobAction(id, "cancel");
  const retryJob = (id: string) => triggerJobAction(id, "retry");
  const runNow = (id: string) => triggerJobAction(id, "run_now");

  return {
    jobs: filteredJobs,
    allJobs: jobs,
    activeJobId,
    setActiveJobId,
    activeJob,
    viewFilter,
    setViewFilter,
    cancelJob,
    retryJob,
    runNow,
  };
}
