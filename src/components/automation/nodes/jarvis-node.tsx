import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Play, Settings, Zap, Network, Brain, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WorkflowNodeData, AppNode } from '@/lib/automation/types';

export const JarvisNode = memo(({ data, selected }: NodeProps<AppNode>) => {
  const nodeData = data as WorkflowNodeData;

  const getIcon = () => {
    switch (nodeData.type) {
      case 'trigger': return <Play className="size-4 text-[#34F5D0]" />;
      case 'action': return <Zap className="size-4 text-[#F5A623]" />;
      case 'condition': return <Network className="size-4 text-[#E834F5]" />;
      case 'ai': return <Brain className="size-4 text-[#34A4F5]" />;
      default: return <Settings className="size-4 text-jarvis-text-muted" />;
    }
  };

  const getStatusIcon = () => {
    switch (nodeData.status) {
      case 'running': return <Loader2 className="size-3 text-[#F5A623] animate-spin" />;
      case 'success': return <CheckCircle2 className="size-3 text-[#34F5D0]" />;
      case 'error': return <AlertCircle className="size-3 text-[#FF4D4D]" />;
      default: return null;
    }
  };

  return (
    <div className={cn(
      "min-w-[200px] bg-jarvis-panel/60 backdrop-blur-md border rounded-xl overflow-hidden transition-all shadow-lg",
      selected ? "border-jarvis-primary shadow-[0_0_20px_rgba(52,245,208,0.2)]" : "border-jarvis-panel-border/50",
      nodeData.status === 'running' && "border-[#F5A623] shadow-[0_0_20px_rgba(245,166,35,0.2)]"
    )}>
      
      {/* Input Handle */}
      {nodeData.type !== 'trigger' && (
        <Handle 
          type="target" 
          position={Position.Top} 
          className="w-3 h-3 bg-jarvis-bg-deepest border-2 border-jarvis-primary"
        />
      )}

      <div className="p-3 border-b border-jarvis-panel-border/30 flex items-center justify-between bg-jarvis-bg-deepest/50">
        <div className="flex items-center gap-2">
          {getIcon()}
          <span className="text-xs font-bold uppercase tracking-widest text-jarvis-text">
            {nodeData.type}
          </span>
        </div>
        {getStatusIcon()}
      </div>

      <div className="p-4">
        <h3 className="text-sm font-bold text-jarvis-text mb-1">{nodeData.label}</h3>
        {nodeData.description && (
          <p className="text-xs text-jarvis-text-muted">{nodeData.description}</p>
        )}
      </div>

      {/* Output Handle */}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 bg-jarvis-bg-deepest border-2 border-jarvis-primary"
      />
    </div>
  );
});
JarvisNode.displayName = 'JarvisNode';
