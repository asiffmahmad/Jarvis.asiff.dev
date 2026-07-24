import { useState, useEffect } from 'react';
import { globalEventBus, SystemEvent, SystemEventType } from './event-bus';

export function useEventStream(filterType?: SystemEventType) {
  const [events, setEvents] = useState<SystemEvent[]>(() => {
    const history = globalEventBus.getHistory();
    return filterType ? history.filter(e => e.type === filterType) : history;
  });

  useEffect(() => {
    const targetType = filterType || '*';
    const unsubscribe = globalEventBus.subscribe(targetType, (newEvent) => {
      setEvents(prev => {
        const updated = [newEvent, ...prev];
        if (updated.length > 500) updated.pop();
        return updated;
      });
    });

    return () => unsubscribe();
  }, [filterType]);

  return events;
}

export function useAgentStatus(agentId: string) {
  const [status, setStatus] = useState<'idle' | 'thinking' | 'executing' | 'failed' | 'completed'>('idle');
  const [currentTask, setCurrentTask] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = globalEventBus.subscribe('*', (event) => {
      if (event.source !== agentId && event.metadata?.targetAgent !== agentId) return;

      switch (event.type) {
        case 'agent:started':
        case 'workflow:started':
          setStatus('idle');
          break;
        case 'agent:thinking':
          setStatus('thinking');
          setCurrentTask(event.message);
          break;
        case 'agent:executing':
        case 'tool:called':
        case 'data:read':
        case 'data:write':
          setStatus('executing');
          setCurrentTask(event.message);
          break;
        case 'agent:completed':
          setStatus('completed');
          setCurrentTask(null);
          break;
        case 'agent:failed':
          setStatus('failed');
          setCurrentTask(null);
          break;
      }
    });

    return () => unsubscribe();
  }, [agentId]);

  return { status, currentTask };
}
