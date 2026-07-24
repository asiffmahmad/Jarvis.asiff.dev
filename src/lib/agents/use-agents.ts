import { useState, useMemo } from "react";
import { AgentRegistry } from "./agent-registry";
import { AgentService } from "./agent-service";
import type { AgentDefinition, AgentExecutionState } from "./types";

export type AgentsState = ReturnType<typeof useAgents>;

export function useAgents() {
  const registry = useMemo(() => AgentRegistry.getInstance(), []);
  const service = useMemo(() => AgentService.getInstance(), []);

  const [agents, setAgents] = useState<AgentDefinition[]>(() => registry.getAgents());
  const [activeAgentId, setActiveAgentId] = useState<string | null>(() => registry.getAgents()[0]?.id || null);
  const [executionState, setExecutionState] = useState<AgentExecutionState>({
    status: 'idle',
    progress: 0,
    logs: []
  });

  const activeAgent = useMemo(() => agents.find(a => a.id === activeAgentId) || null, [agents, activeAgentId]);

  const executeAgent = async () => {
    if (!activeAgent || executionState.status === 'running') return;
    
    await service.executeAgent(activeAgent, (newState) => {
      setExecutionState(newState);
    });
  };

  const stopExecution = () => {
    if (executionState.status !== 'running') return;
    
    setExecutionState(prev => ({
      ...prev,
      status: 'error',
      logs: [...prev.logs, { id: Date.now().toString(), timestamp: new Date(), level: 'error', message: 'Execution cancelled by user.' }]
    }));
  };

  const resetExecution = () => {
    setExecutionState({
      status: 'idle',
      progress: 0,
      logs: []
    });
  };

  return {
    agents,
    activeAgent,
    activeAgentId,
    setActiveAgentId,
    executionState,
    executeAgent,
    stopExecution,
    resetExecution
  };
}
