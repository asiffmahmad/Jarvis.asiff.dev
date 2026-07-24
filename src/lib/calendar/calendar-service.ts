import type { CalendarEvent, CalendarTask, EventCategory } from "./types";

type Listener = () => void;

/**
 * Mock Calendar Service
 * Acts as the unified aggregator pulling from internal states and (in the future) external providers.
 */
export class CalendarService {
  private static instance: CalendarService;
  
  private events: CalendarEvent[] = [];
  private tasks: CalendarTask[] = [];
  private listeners: Set<Listener> = new Set();

  private constructor() {
    this.seedMockData();
  }

  public static getInstance(): CalendarService {
    if (!CalendarService.instance) {
      CalendarService.instance = new CalendarService();
    }
    return CalendarService.instance;
  }

  public subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  public getEvents(): CalendarEvent[] {
    return [...this.events];
  }

  public getTasks(): CalendarTask[] {
    return [...this.tasks];
  }

  // --- Mock Methods ---
  
  public addEvent(title: string, startDate: Date, endDate: Date, category: EventCategory, isAllDay = false) {
    const event: CalendarEvent = {
      id: `evt_${Date.now()}`,
      title,
      startDate,
      endDate,
      category,
      isAllDay,
    };
    this.events.push(event);
    this.notify();
    return event;
  }

  public addTask(title: string, dueDate: Date, category: EventCategory, priority: "LOW"|"MEDIUM"|"HIGH" = "MEDIUM") {
    const task: CalendarTask = {
      id: `tsk_${Date.now()}`,
      title,
      dueDate,
      category,
      priority,
      isCompleted: false,
    };
    this.tasks.push(task);
    this.notify();
    return task;
  }

  public toggleTaskCompletion(id: string) {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      task.isCompleted = !task.isCompleted;
      this.notify();
    }
  }

  private seedMockData() {
    const now = new Date();
    
    // Seed events
    const e1Start = new Date(now);
    e1Start.setHours(10, 0, 0, 0);
    const e1End = new Date(now);
    e1End.setHours(11, 0, 0, 0);
    this.addEvent("Team Sync", e1Start, e1End, "PERSONAL");

    const e2Start = new Date(now);
    e2Start.setHours(14, 0, 0, 0);
    const e2End = new Date(now);
    e2End.setHours(14, 30, 0, 0);
    this.addEvent("Review Content Strategy", e2Start, e2End, "CONTENT");

    const e3Start = new Date(now);
    e3Start.setDate(e3Start.getDate() + 1);
    this.addEvent("Q3 Planning Full Day", e3Start, e3Start, "PERSONAL", true);

    // Seed tasks
    this.addTask("Finalize Q3 Budget", new Date(now.getTime() + 86400000), "PERSONAL", "HIGH");
    this.addTask("Run Web Scraper AI", new Date(now.getTime() + 3600000), "AI_JOB", "MEDIUM");
  }
}
