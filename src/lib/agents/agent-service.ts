import type { AgentDefinition, AgentExecutionState } from "./types";

export class AgentService {
  private static instance: AgentService;

  private constructor() {}

  public static getInstance(): AgentService {
    if (!AgentService.instance) {
      AgentService.instance = new AgentService();
    }
    return AgentService.instance;
  }

  // Simulate agent execution with streaming logs and progress
  public async executeAgent(
    agent: AgentDefinition,
    onStateUpdate: (state: AgentExecutionState) => void
  ) {
    const delay = agent.mockDelayMs || 5000;
    const intervalTime = delay / 4; // 4 distinct steps

    const currentState: AgentExecutionState = {
      status: 'running',
      progress: 0,
      logs: [{ id: Date.now().toString(), timestamp: new Date(), level: 'info', message: `Initializing ${agent.name}...` }]
    };
    
    onStateUpdate({ ...currentState });

    // Step 1
    await new Promise(r => setTimeout(r, intervalTime));
    currentState.progress = 25;
    currentState.logs.push({ id: Date.now().toString(), timestamp: new Date(), level: 'info', message: "Fetching required context from Knowledge Hub..." });
    onStateUpdate({ ...currentState });

    // Step 2
    await new Promise(r => setTimeout(r, intervalTime));
    currentState.progress = 50;
    currentState.logs.push({ id: Date.now().toString(), timestamp: new Date(), level: 'info', message: "Running LLM inference and reasoning loop..." });
    onStateUpdate({ ...currentState });

    // Step 3
    await new Promise(r => setTimeout(r, intervalTime));
    currentState.progress = 75;
    currentState.logs.push({ id: Date.now().toString(), timestamp: new Date(), level: 'success', message: "Generated structured payload." });
    onStateUpdate({ ...currentState });

    // Final Step
    await new Promise(r => setTimeout(r, intervalTime));
    currentState.progress = 100;
    currentState.status = 'success';
    currentState.result = `{\n  "status": "success",\n  "agent": "${agent.name}",\n  "output": "Simulated successful execution result."\n}`;
    currentState.logs.push({ id: Date.now().toString(), timestamp: new Date(), level: 'success', message: "Execution completed successfully." });
    
    onStateUpdate({ ...currentState });
  }
}
