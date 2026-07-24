import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import type { AgentDefinition, AgentExecutionState } from "./types";

export type AgentsState = ReturnType<typeof useAgents>;

const BUILT_IN_AGENTS: AgentDefinition[] = [
  {
    id: "content-publisher",
    name: "Content Publisher",
    description: "Generates complete, platform-optimized social media posts with captions, hashtags, and media ideas",
    category: "content",
    isEnabled: true,
    systemPrompt: `You are a social media content strategist and copywriter.
Generate a complete post ready for publishing. Return ONLY valid JSON with this structure:
{
  "title": "Catchy post title",
  "caption": "Full post caption with line breaks where appropriate",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
  "mediaIdeas": ["Idea 1 for image/video", "Idea 2"],
  "callToAction": "Clear CTA for engagement",
  "platform": "linkedin",
  "bestPostingTime": "Best time to post"
}
Rules: Caption must be substantive and engaging. Include 3-5 relevant hashtags.
Return raw JSON only - no markdown, no code fences.`,
    capabilities: ["Content Generation", "Hashtag Research", "Platform Optimization"],
  },
  {
    id: "research-agent",
    name: "Research Agent",
    description: "Researches topics and produces structured summaries with key insights and sources",
    category: "research",
    isEnabled: true,
    systemPrompt: `You are a research analyst. Research the given topic thoroughly and provide:
1. A concise executive summary
2. Key findings and insights
3. Relevant data points and statistics
4. Potential implications
Format your response with clear markdown sections.`,
    capabilities: ["Research", "Summarization", "Analysis"],
  },
];

export function useAgents() {
  const [agents, setAgents] = useState<AgentDefinition[]>(BUILT_IN_AGENTS);
  const [isLoadingAgents, setIsLoadingAgents] = useState(true);
  const [activeAgentId, setActiveAgentId] = useState<string | null>(BUILT_IN_AGENTS[0].id);
  const [prompt, setPrompt] = useState("");
  const [executionState, setExecutionState] = useState<AgentExecutionState>({
    status: "idle",
    progress: 0,
    logs: [],
  });
  const abortRef = useRef<AbortController | null>(null);

  const loadAgents = useCallback(async () => {
    setIsLoadingAgents(true);
    try {
      const res = await fetch("/api/agents/registry");
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          const mapped: AgentDefinition[] = data.map((a: {
            id: string;
            name: string;
            description: string;
            systemPrompt?: string;
          }) => ({
            ...a,
            category: "general",
            isEnabled: true,
            capabilities: ["General AI"],
          }));
          setAgents(mapped);
          setActiveAgentId((prev) => prev ?? mapped[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load agents from DB, using built-in:", err);
    } finally {
      setIsLoadingAgents(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    loadAgents().then(() => {
      if (!active) return;
    });
    return () => {
      active = false;
    };
  }, [loadAgents]);

  const activeAgent = useMemo(
    () => agents.find((a) => a.id === activeAgentId) || agents[0] || null,
    [agents, activeAgentId]
  );

  const executeAgent = useCallback(async () => {
    if (!activeAgent || executionState.status === "running") return;

    const userPrompt = prompt.trim() || "Execute your primary objective.";

    abortRef.current = new AbortController();

    setExecutionState({
      status: "running",
      progress: 10,
      result: "",
      logs: [
        {
          id: Date.now().toString(),
          timestamp: new Date(),
          level: "info",
          message: `Initializing ${activeAgent.name}...`,
        },
      ],
    });

    try {
      const res = await fetch("/api/agents/execute", {
        signal: abortRef.current.signal,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: activeAgent.id,
          linkedPromptContent: activeAgent.systemPrompt,
          runtimeVariables: { user_prompt: userPrompt },
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      setExecutionState((prev) => ({
        ...prev,
        progress: 30,
        logs: [
          ...prev.logs,
          {
            id: Date.now().toString(),
            timestamp: new Date(),
            level: "info",
            message: `Connected to AI. ${activeAgent.name} is thinking...`,
          },
        ],
      }));

      // Read the stream and update progress live
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullOutput = "";
      let chunkCount = 0;

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunkCount++;
          const chunk = decoder.decode(value, { stream: true });

          for (const line of chunk.split("\n")) {
            if (line.startsWith("0:")) {
              try {
                const text = JSON.parse(line.slice(2));
                fullOutput += text;
              } catch {
                // skip unparseable lines
              }
            }
          }

          // Live progress: scale from 30 to 90 based on chunks received
          const liveProgress = Math.min(30 + Math.min(chunkCount, 60) * 1, 90);
          setExecutionState((prev) => ({
            ...prev,
            progress: liveProgress,
            result: fullOutput,
            logs: fullOutput.length > 100 && prev.logs.length < 4
              ? [
                  ...prev.logs,
                  {
                    id: Date.now().toString(),
                    timestamp: new Date(),
                    level: "info",
                    message: `Generating response... (${fullOutput.length} chars so far)`,
                  },
                ]
              : prev.logs,
          }));
        }
      }

      setExecutionState({
        status: "success",
        progress: 100,
        result: fullOutput || "(No output returned)",
        logs: [
          {
            id: Date.now().toString(),
            timestamp: new Date(),
            level: "success",
            message: fullOutput
              ? `Completed — generated ${fullOutput.length} characters`
              : "Execution completed successfully.",
          },
        ],
      });
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        setExecutionState((prev) => ({
          ...prev,
          status: "error",
          logs: [
            ...prev.logs,
            {
              id: Date.now().toString(),
              timestamp: new Date(),
              level: "error",
              message: "Execution cancelled by user.",
            },
          ],
        }));
        return;
      }
      console.error("Agent execution failed:", err);
      setExecutionState({
        status: "error",
        progress: 0,
        result: undefined,
        logs: [
          {
            id: Date.now().toString(),
            timestamp: new Date(),
            level: "error",
            message: `Execution failed: ${(err as Error).message}`,
          },
        ],
      });
    }
  }, [activeAgent, executionState.status, prompt]);

  const stopExecution = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  }, []);

  const resetExecution = useCallback(() => {
    setExecutionState({ status: "idle", progress: 0, logs: [] });
    setPrompt("");
  }, []);

  return {
    agents,
    isLoadingAgents,
    activeAgent,
    activeAgentId,
    setActiveAgentId,
    prompt,
    setPrompt,
    executionState,
    executeAgent,
    stopExecution,
    resetExecution,
  };
}
