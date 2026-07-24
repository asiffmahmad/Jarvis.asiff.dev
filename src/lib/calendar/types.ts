export type CalendarView = "MONTH" | "WEEK" | "DAY" | "AGENDA";

export type EventCategory = 
  | "PERSONAL"
  | "CONTENT"
  | "EMAIL"
  | "RESEARCH"
  | "AI_JOB";

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  category: EventCategory;
  isAllDay: boolean;
  metadata?: unknown; // E.g., linked QueueEngine Job ID
  color?: string; // hex override
}

export interface CalendarTask {
  id: string;
  title: string;
  dueDate: Date;
  category: EventCategory;
  isCompleted: boolean;
  priority: "LOW" | "MEDIUM" | "HIGH";
}

// Future architecture for external sync
export interface ICalendarProvider {
  name: string;
  syncEvents: () => Promise<CalendarEvent[]>;
  createEvent: (event: Partial<CalendarEvent>) => Promise<CalendarEvent>;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => Promise<CalendarEvent>;
  deleteEvent: (id: string) => Promise<boolean>;
}
