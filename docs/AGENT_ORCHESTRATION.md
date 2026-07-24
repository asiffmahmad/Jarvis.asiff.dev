# Agent Orchestration Architecture

*This is a planned architecture document for the future JARVIS Multi-Agent execution environment.*

## Core Philosophy
JARVIS operates not as a single monolithic LLM, but as a society of specialized, context-aware agents working in concert. 

## Architectural Components

1. **The Supervisor**
   - The master router. It receives an intent, breaks it down into a DAG (Directed Acyclic Graph) of subtasks, and assigns them to specialized agents.
   
2. **Specialized Agents**
   - Discrete LLM profiles wrapped with specific tools and system prompts.
   - Examples: `ResearchAgent`, `CopywriterAgent`, `SchedulerAgent`.

3. **Shared Memory Store**
   - A Redis/Postgres-backed KV store.
   - Agents write their intermediate outputs here rather than passing massive context windows around.
   - E.g., `ResearchAgent` writes to `memory:research_123`, and `CopywriterAgent` is told to read from `memory:research_123`.

4. **Tool Registry**
   - Centralized manifest of all callable functions (API interactions, database reads).
   - Tools are injected dynamically into an agent's context only when required.

5. **Task Queue (Worker Pool)**
   - A robust background job queue (e.g., BullMQ) managing agent executions.
   - Supports retries, timeouts, and parallel fan-out execution.

## Execution Flow
1. Intent Received by Supervisor.
2. Supervisor creates Execution Plan (DAG).
3. Task Queue receives Step 1 (e.g., Research).
4. `ResearchAgent` runs, uses tools, writes to Shared Memory.
5. Supervisor observes Step 1 completion.
6. Task Queue receives Step 2 (e.g., Write Draft).
7. `CopywriterAgent` runs, reads Shared Memory, outputs Draft.
8. Event Bus broadcasts `workflow:completed`.
