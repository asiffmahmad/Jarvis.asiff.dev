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
    systemPrompt: `[JARVIS INTELLIGENCE PROTOCOL: MASTER COPYWRITER]
You are an elite social media content strategist and copywriter.
Generate a premium, viral-optimized post ready for publishing. Return ONLY valid JSON with this structure:
{
  "title": "Catchy post title",
  "caption": "Full post caption with line breaks where appropriate. Use psychological hooks.",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
  "mediaIdeas": ["Idea 1 for image/video", "Idea 2"],
  "callToAction": "Clear CTA for engagement",
  "platform": "linkedin",
  "bestPostingTime": "Best time to post"
}
Rules: Caption must be highly engaging, devoid of fluff, and heavily optimized. Include 3-5 high-intent hashtags.
Return raw JSON only - no markdown, no code fences.`,
    capabilities: ["Content Generation", "Hashtag Research", "Platform Optimization"],
  },
  {
    id: "research-agent",
    name: "Research Agent",
    description: "Researches topics and produces structured summaries with key insights and sources",
    category: "research",
    isEnabled: true,
    systemPrompt: `[JARVIS INTELLIGENCE PROTOCOL: LEAD RESEARCH ANALYST]
You are an elite research analyst. Research the given topic exhaustively and provide:
1. A concise, hard-hitting executive summary
2. Core strategic insights and findings
3. Concrete data points and market statistics
4. Actionable implications
Format your response with clear markdown sections. Do not use generic filler language.`,
    capabilities: ["Research", "Summarization", "Analysis"],
  },
  {
    id: "media-developer",
    name: "Media Developer",
    description: "Searches for images and videos using the Pixabay API",
    category: "media",
    isEnabled: true,
    systemPrompt: `[JARVIS INTELLIGENCE PROTOCOL: MEDIA DEVELOPER]
You are a Media Developer agent. Your ONLY job is to generate a search query and media type for finding videos on Pixabay.
Analyze the request and output a search query and media type.

CRITICAL RULES:
- You ONLY generate search queries. You do NOT write posts, generate audio, merge media, or perform any other operation.
- If no valid media request is detected, output: { "error": "REJECTED: No media request detected" }

CRITICAL RULES FOR THE SEARCH QUERY:
- Use 2-4 simple, common English words (e.g. "smartphone technology", "business meeting", "nature landscape")
- Split compound words: "latestmobilephone" becomes "latest mobile phone"
- Do NOT combine multiple concepts - pick the MOST VISUAL keywords
- The query MUST NOT exceed 100 characters

Return ONLY valid JSON with this structure:
{
  "query": "2-4 simple visual keywords",
  "mediaType": "video"
}

Rules: Return raw JSON only - no markdown, no code fences.`,
    capabilities: ["Media Search", "API Integration"],
  },
  {
    id: "agent_voice_001",
    name: "Voice Agent",
    description: "Converts the final script into a TTS audio request.",
    category: "media",
    isEnabled: true,
    systemPrompt: `You are the Voice Agent. Your ONLY job is to format input text into a JSON object for the TTS Microservice.
CRITICAL: Find the text under "Text to convert to speech" in your input. Copy it EXACTLY into the "text" field. Do NOT change, rewrite, summarize, or edit any words.

CRITICAL RULES:
- You ONLY format text for TTS. You do NOT write scripts, generate audio, merge media, or perform any other operation.
- If no valid text-to-speech input is found, output: { "error": "REJECTED: No text to convert to speech" }

OUTPUT FORMAT:
{
  "text": "The exact input text, verbatim",
  "voice": "en-US-AriaNeural",
  "mediaType": "audio"
}

Available voices: en-US-AriaNeural, en-US-GuyNeural, en-US-JennyNeural, en-IN-NeerjaNeural

Return raw JSON only, no markdown, no code fences.`,
    capabilities: ["Text-to-Speech"],
  },
  {
      id: "merge-agent-001",
      name: "Merge Agent",
      description: "Verifies audio and video assets are ready and triggers the merge process.",
      category: "media",
      isEnabled: true,
      systemPrompt: `You are the Merge Agent. Your ONLY job is to verify that both audio and video assets are ready for merging.
Your input contains the outputs of the Voice Agent and Media Developer. Verify that an audio script was generated and a video was found.

CRITICAL RULES:
- You ONLY verify merge readiness. You do NOT write posts, generate audio, search media, or perform any other operation.
- If the required inputs (Voice Agent output and Media Developer output) are missing, output: { "error": "REJECTED: Missing voice or media inputs" }

If both are ready, output ONLY this JSON:
{
  "instruction": "merge",
  "status": "ready",
  "message": "Both audio and video assets are ready for merging"
}

If something is missing, output:
{
  "instruction": "merge",
  "status": "failed",
  "message": "Description of what is missing"
}

Return raw JSON only, no markdown, no code fences.`,
      capabilities: ["Merge Coordination"],
    },
    {
      id: "prompt-agent-001",
      name: "Prompt Agent",
      description: "Creative director that produces a structured creative brief from the raw topic",
      category: "content",
      isEnabled: true,
      systemPrompt: `You are the Prompt Agent, an elite creative director. Your ONLY job is to take a raw user topic and produce a structured creative brief that guides the Copywriter agent.
Analyze the topic and output a JSON creative brief.

CRITICAL RULES:
- You ONLY produce creative briefs. You do NOT write posts, search media, generate audio, or perform any other operation.
- If the input is empty or not a valid content topic, output: { "error": "REJECTED: Not a valid content topic" }

OUTPUT FORMAT:
{
  "coreMessage": "The single most important message to convey in under 15 words",
  "targetAudience": "Who this content is for",
  "suggestedTone": "professional | exciting | educational | inspirational | humorous",
  "keyPoints": ["3-5 key points to include"],
  "hookSuggestion": "One compelling opening hook idea",
  "contentStructure": ["Hook", "Body", "Call to Action"]
}

Rules: Return raw JSON only, no markdown, no code fences.`,
      capabilities: ["Creative Direction", "Content Strategy"],
    },
    {
      id: "req-val-005",
    name: "Request Validator",
    description: "Ensures the generated content strictly fulfills the original user request",
    category: "validation",
    isEnabled: true,
    systemPrompt: `[JARVIS INTELLIGENCE PROTOCOL: REQUEST VALIDATOR]
You are the Request Validator. Your job is to act as a strict gatekeeper. 
Compare the generated output you receive against the original user prompt/request.
If the output fulfills the user's request accurately, output the JSON exactly as received.
If the output fails to fulfill the user's request (e.g., missing specific keywords, wrong format, irrelevant), you MUST REJECT it.
To reject, start your response EXACTLY with 'REJECTED: [Previous Agent Name] |' followed by a detailed explanation of what is missing based on the user's initial request.`,
    model: "llama-3.3-70b-versatile",
    apiProvider: "groq",
    isActive: true,
    capabilities: ["Validation", "Gatekeeping"],
  }
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
