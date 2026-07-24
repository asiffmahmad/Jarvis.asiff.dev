export type AgentStatus = 'idle' | 'running' | 'success' | 'error';
export type AgentCategory = 'research' | 'content' | 'email' | 'social' | 'seo' | 'automation' | 'support' | 'coding';

export interface AgentDefinition {
  id: string;
  name: string;
  description: string;
  category: AgentCategory;
  isEnabled: boolean;
  capabilities: string[];
  mockDelayMs?: number;
}

export interface AgentExecutionLog {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
}

export interface AgentExecutionState {
  status: AgentStatus;
  progress: number; // 0-100
  logs: AgentExecutionLog[];
  result?: string;
  error?: string;
}

// FUTURE MCP PLACEHOLDERS - ARCHITECTURE ONLY
export interface MCPServerContext {
  serverId: string;
  tools: string[];
  resources: string[];
}

export interface MultiAgentPlan {
  planId: string;
  tasks: string[];
  assignedAgents: string[];
}
