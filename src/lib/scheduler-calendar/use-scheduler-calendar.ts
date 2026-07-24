"use client";

import { useState, useEffect, useMemo } from "react";
import { QueueEngine } from "@/lib/scheduler/queue-engine";
import type { ScheduledJob } from "@/lib/scheduler/types";

export type SchedulerCalendarState = ReturnType<typeof useSchedulerCalendar>;

export function useSchedulerCalendar() {
  const [jobs, setJobs] = useState<ScheduledJob[]>([]);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [viewFilter, setViewFilter] = useState<"ALL" | "UPCOMING" | "RUNNING" | "COMPLETED" | "FAILED">("ALL");

  const engine = useMemo(() => QueueEngine.getInstance(), []);

  useEffect(() => {
    const unsubscribe = engine.subscribe((updatedJobs) => {
      setJobs(updatedJobs);
    });
    return () => { unsubscribe(); };
  }, [engine]);

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

  const cancelJob = (id: string) => engine.cancelJob(id);
  const retryJob = (id: string) => engine.retryJob(id);
  const runNow = (id: string) => engine.runNow(id);

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
