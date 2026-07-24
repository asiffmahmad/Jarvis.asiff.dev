"use client";

import { useRef, useCallback } from 'react';
import { ReactFlow, Background, BackgroundVariant, ReactFlowProvider, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { JarvisNode } from './nodes/jarvis-node';
import type { AutomationState } from '@/lib/automation/use-automation';
import type { NodeType } from '@/lib/automation/types';

const nodeTypes = {
  jarvisNode: JarvisNode,
};

interface CenterPanelProps {
  state: AutomationState;
}

function FlowCanvas({ state }: CenterPanelProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();
  
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodeClick,
    onPaneClick,
    setNodes
  } = state;

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow/type') as NodeType;
      const label = event.dataTransfer.getData('application/reactflow/label');

      if (!type) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newNode: any = {
        id: `node_${Date.now()}`,
        type: 'jarvisNode',
        position,
        data: { label, type, description: 'Newly added node configuration.' },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes],
  );

  return (
    <div className="flex-1 h-full relative" ref={reactFlowWrapper}>
      <ReactFlow
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        nodes={nodes as any}
        edges={edges}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onNodesChange={onNodesChange as any}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onNodeClick={onNodeClick as any}
        onPaneClick={onPaneClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        fitView
        className="bg-jarvis-bg-deepest"
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={24} 
          size={1} 
          color="rgba(52,245,208,0.2)" 
        />
      </ReactFlow>
    </div>
  );
}

export function AutomationCenterPanel({ state }: CenterPanelProps) {
  return (
    <div className="flex-[2] flex flex-col relative h-full bg-jarvis-bg-deepest/50 border-r border-jarvis-panel/50">
      
      <div className="h-16 border-b border-jarvis-panel/30 flex items-center px-6 shrink-0 z-10 backdrop-blur-md absolute top-0 left-0 w-full pointer-events-none">
        <h2 className="text-lg font-bold text-jarvis-text drop-shadow-md">Orchestrator Canvas</h2>
      </div>

      <ReactFlowProvider>
        <FlowCanvas state={state} />
      </ReactFlowProvider>

    </div>
  );
}
