import { useState, useEffect, useMemo, useCallback } from "react";
import { CalendarService } from "./calendar-service";
import type { CalendarView, CalendarEvent, CalendarTask, EventCategory } from "./types";

export type CalendarState = ReturnType<typeof useCalendar>;

export function useCalendar() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [view, setView] = useState<CalendarView>("MONTH");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [tasks, setTasks] = useState<CalendarTask[]>([]);
  const [activeFilters, setActiveFilters] = useState<Set<EventCategory>>(new Set(["PERSONAL", "CONTENT", "EMAIL", "RESEARCH", "AI_JOB"]));
  
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const service = useMemo(() => CalendarService.getInstance(), []);

  const refresh = useCallback(() => {
    setEvents(service.getEvents());
    setTasks(service.getTasks());
  }, [service]);

  useEffect(() => {
    // Initial load
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
    
    // Subscribe to updates
    const unsubscribe = service.subscribe(() => {
      refresh();
    });
    return () => { unsubscribe(); };
  }, [service, refresh]);

  const toggleFilter = (category: EventCategory) => {
    const newFilters = new Set(activeFilters);
    if (newFilters.has(category)) {
      newFilters.delete(category);
    } else {
      newFilters.add(category);
    }
    setActiveFilters(newFilters);
  };

  const filteredEvents = useMemo(() => events.filter(e => activeFilters.has(e.category)), [events, activeFilters]);
  const filteredTasks = useMemo(() => tasks.filter(t => activeFilters.has(t.category)), [tasks, activeFilters]);

  const activeEvent = useMemo(() => events.find(e => e.id === selectedEventId) || null, [events, selectedEventId]);
  const activeTask = useMemo(() => tasks.find(t => t.id === selectedTaskId) || null, [tasks, selectedTaskId]);

  return {
    currentDate,
    setCurrentDate,
    view,
    setView,
    events: filteredEvents,
    tasks: filteredTasks,
    activeFilters,
    toggleFilter,
    selectedEventId,
    setSelectedEventId,
    selectedTaskId,
    setSelectedTaskId,
    activeEvent,
    activeTask,
    
    // Actions
    toggleTaskCompletion: (id: string) => service.toggleTaskCompletion(id),
    addEvent: (t: string, s: Date, e: Date, c: EventCategory, a?: boolean) => service.addEvent(t, s, e, c, a),
  };
}
