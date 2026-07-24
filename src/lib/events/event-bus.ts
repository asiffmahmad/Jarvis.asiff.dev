export type SystemEventType = 
  | 'system:ready'
  | 'system:alert'
  | 'agent:started'
  | 'agent:thinking'
  | 'agent:executing'
  | 'agent:completed'
  | 'agent:failed'
  | 'workflow:started'
  | 'workflow:completed'
  | 'data:read'
  | 'data:write'
  | 'tool:called';

export interface SystemEvent {
  id: string;
  type: SystemEventType;
  timestamp: Date;
  source: string;
  message: string;
  metadata?: Record<string, unknown>;
}

type EventCallback = (event: SystemEvent) => void;

class EventBus {
  private listeners: Map<SystemEventType | '*', Set<EventCallback>> = new Map();
  private history: SystemEvent[] = [];
  private readonly MAX_HISTORY = 1000;

  constructor() {
    this.listeners.set('*', new Set());
  }

  subscribe(type: SystemEventType | '*', callback: EventCallback): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(type)?.delete(callback);
    };
  }

  publish(type: SystemEventType, source: string, message: string, metadata?: Record<string, unknown>) {
    const event: SystemEvent = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      timestamp: new Date(),
      source,
      message,
      metadata
    };

    // Store in history
    this.history.unshift(event);
    if (this.history.length > this.MAX_HISTORY) {
      this.history.pop();
    }

    // Notify specific listeners
    this.listeners.get(type)?.forEach(cb => cb(event));
    
    // Notify wildcard listeners
    this.listeners.get('*')?.forEach(cb => cb(event));
  }

  getHistory(): SystemEvent[] {
    return [...this.history];
  }
}

export const globalEventBus = new EventBus();
