import { useState, useCallback, useMemo } from 'react';
import { 
  addEdge, 
  applyNodeChanges, 
  applyEdgeChanges,
  type NodeChange,
  type EdgeChange,
  type Connection,
  type Edge,
} from '@xyflow/react';
import { AutomationService } from './automation-service';
import type { AppNode, ExecutionLog } from './types';

export type AutomationState = ReturnType<typeof useAutomation>;

const initialNodes: AppNode[] = [
  {
    id: 'node-1',
    type: 'jarvisNode',
    position: { x: 250, y: 150 },
    data: { label: 'Manual Trigger', type: 'trigger', description: 'Starts workflow manually' },
  },
];

export function useAutomation() {
  const [nodes, setNodes] = useState<AppNode[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [logs, setLogs] = useState<ExecutionLog[]>([]);

  const service = useMemo(() => AutomationService.getInstance(), []);

  const onNodesChange = useCallback(
    (changes: NodeChange<AppNode>[]) => setNodes((nds) => applyNodeChanges(changes, nds) as AppNode[]),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange<Edge>[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#34F5D0', strokeWidth: 2 } }, eds)),
    []
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: AppNode) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const saveWorkflow = () => {
    service.saveWorkflow(nodes, edges);
  };

  const executeWorkflow = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setLogs([]);
    
    // Reset statuses
    setNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, status: 'idle' } })));

    await service.executeWorkflow(
      nodes, 
      edges, 
      (nodeId, status) => {
        setNodes(nds => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, status } } : n));
      },
      (log) => {
        setLogs(prev => [...prev, log]);
      }
    );

    setIsExecuting(false);
  };

  const activeNode = nodes.find(n => n.id === selectedNodeId) || null;

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodeClick,
    onPaneClick,
    setNodes,
    activeNode,
    saveWorkflow,
    executeWorkflow,
    isExecuting,
    logs
  };
}
