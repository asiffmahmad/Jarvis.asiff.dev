import type { Node, Edge } from '@xyflow/react';

export type NodeType = 'trigger' | 'action' | 'condition' | 'utility' | 'ai';

export interface WorkflowNodeData extends Record<string, unknown> {
  label: string;
  type: NodeType;
  description?: string;
  icon?: string;
  status?: 'idle' | 'running' | 'success' | 'error';
}

export type AppNode = Node<WorkflowNodeData>;

export interface ExecutionLog {
  id: string;
  timestamp: Date;
  nodeId: string;
  status: 'success' | 'error' | 'info';
  message: string;
}

export interface Workflow {
  id: string;
  name: string;
  nodes: AppNode[];
  edges: Edge[];
  status: 'draft' | 'active' | 'disabled';
}
