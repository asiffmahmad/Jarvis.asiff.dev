import type { Workflow, ExecutionLog, AppNode } from "./types";
import type { Edge } from "@xyflow/react";

export class AutomationService {
  private static instance: AutomationService;

  private currentWorkflow: Workflow = {
    id: "wf_1",
    name: "Default Draft",
    nodes: [],
    edges: [],
    status: "draft"
  };

  private logs: ExecutionLog[] = [];

  private constructor() {}

  public static getInstance(): AutomationService {
    if (!AutomationService.instance) {
      AutomationService.instance = new AutomationService();
    }
    return AutomationService.instance;
  }

  public saveWorkflow(nodes: AppNode[], edges: Edge[]) {
    this.currentWorkflow.nodes = nodes;
    this.currentWorkflow.edges = edges;
    console.log("Workflow saved", this.currentWorkflow);
  }

  public getWorkflow(): Workflow {
    return this.currentWorkflow;
  }

  public async executeWorkflow(
    nodes: AppNode[], 
    edges: Edge[], 
    onNodeStatusChange: (nodeId: string, status: 'running' | 'success' | 'error') => void,
    onLog: (log: ExecutionLog) => void
  ) {
    this.logs = [];
    
    // Find trigger node
    const triggers = nodes.filter(n => n.data.type === 'trigger');
    if (triggers.length === 0) {
      onLog({ id: Date.now().toString(), timestamp: new Date(), nodeId: "system", status: "error", message: "No trigger node found. Cannot execute." });
      return;
    }

    onLog({ id: Date.now().toString(), timestamp: new Date(), nodeId: "system", status: "info", message: "Starting execution..." });

    // Very naive sequential execution for prototype
    for (const node of nodes) {
      onNodeStatusChange(node.id, 'running');
      onLog({ id: Date.now().toString(), timestamp: new Date(), nodeId: node.id, status: "info", message: `Executing node: ${node.data.label}` });
      
      // Simulate work
      await new Promise(r => setTimeout(r, 800));
      
      onNodeStatusChange(node.id, 'success');
      onLog({ id: Date.now().toString(), timestamp: new Date(), nodeId: node.id, status: "success", message: `Node completed successfully.` });
    }

    onLog({ id: Date.now().toString(), timestamp: new Date(), nodeId: "system", status: "success", message: "Workflow completed!" });
  }
}
