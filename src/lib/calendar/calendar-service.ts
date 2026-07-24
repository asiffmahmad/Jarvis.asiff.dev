import type { CalendarEvent, CalendarTask, EventCategory } from "./types";

type Listener = () => void;

export class CalendarService {
  private static instance: CalendarService;
  
  private events: CalendarEvent[] = [];
  private tasks: CalendarTask[] = [];
  private listeners: Set<Listener> = new Set();

  private constructor() {}

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
}
