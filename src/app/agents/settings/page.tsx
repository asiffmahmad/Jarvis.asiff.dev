"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/layout/app-layout";
import { Bot, Save, Loader2, Cpu, Activity, ShieldAlert, Key, Play } from "lucide-react";
import { cn } from "@/lib/utils";

type Agent = {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  model: string;
  apiProvider: string;
  apiKey?: string | null;
  usageLeft: number;
  isActive: boolean;
};

export default function AgentSettingsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{success?: boolean, error?: string} | null>(null);
  
  // Test Sandbox State
  const [testUserPrompt, setTestUserPrompt] = useState("");
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testExecutionResult, setTestExecutionResult] = useState<any>(null);
  const [testMediaResult, setTestMediaResult] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Agent>>({});

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/agents/registry");
      if (res.ok) {
        const data = await res.json();
        setAgents(data);
        if (data.length > 0 && !selectedAgentId) {
          handleSelectAgent(data[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch agents", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAgent = (agent: Agent) => {
    setSelectedAgentId(agent.id);
    setFormData(agent);
    setTestResult(null);
    setTestExecutionResult(null);
    setTestMediaResult(null);
    setTestUserPrompt("");
  };

  const handleCreateNew = () => {
    setSelectedAgentId(null);
    setFormData({
      name: "New Agent",
      description: "",
      systemPrompt: "",
      model: "gpt-4",
      apiProvider: "groq",
      apiKey: "",
      usageLeft: 1000,
      isActive: true
    });
    setTestResult(null);
  };

  const handleChange = (field: keyof Agent, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === "apiKey" || field === "apiProvider") {
      setTestResult(null); // Reset test result if credentials change
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const isNew = !selectedAgentId;
      const method = isNew ? "POST" : "PATCH";
      const payload = isNew ? formData : { id: selectedAgentId, ...formData };
      
      const res = await fetch("/api/agents/registry", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        await fetchAgents(); // refresh list
      }
    } catch (err) {
      console.error("Failed to save agent", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    // Ping the global router instead of individual agent settings
    const testProvider = "openrouter"; // We ping OpenRouter primarily to check internet out

    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/agents/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          apiProvider: testProvider, 
          apiKey: "", 
          model: "router-test"
        })
      });
      const data = await res.json();
      if (res.ok) {
        setTestResult({ success: true });
      } else {
        setTestResult({ error: data.error || "Connection failed" });
      }
    } catch (err) {
      setTestResult({ error: "Network error occurred" });
    } finally {
      setIsTesting(false);
    }
  };

  const handleRunAgentTest = async () => {
    setIsRunningTest(true);
    setTestExecutionResult(null);
    setTestMediaResult(null);
    try {
      const res = await fetch("/api/agents/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: selectedAgentId || "new",
          linkedPromptContent: formData.systemPrompt,
          runtimeVariables: { user_prompt: testUserPrompt },
        })
      });
      const data = await res.json();
      if (res.ok) {
        let parsedResult: any = data.text;
        try {
           let cleaned = data.text.trim();
           const startIdx = cleaned.indexOf("{");
           const endIdx = cleaned.lastIndexOf("}");
           if (startIdx !== -1 && endIdx !== -1) {
             cleaned = cleaned.substring(startIdx, endIdx + 1);
           }
           parsedResult = JSON.parse(cleaned);
           setTestExecutionResult(parsedResult);
           
           if (parsedResult.mediaType === "audio" && parsedResult.text) {
             const ttsRes = await fetch(`/api/tts/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: parsedResult.text, voice: parsedResult.voice })
             });
             
             if (ttsRes.ok) {
                const ttsData = await ttsRes.json();
                if (ttsData.success && ttsData.audioUrl) {
                  setTestMediaResult({ type: "audio", data: { url: ttsData.audioUrl }, status: "success" });
                } else {
                  setTestMediaResult({ type: "audio", error: ttsData.error || "Generation failed", status: "error" });
                }
             } else {
                let errText = "TTS Server Error";
                try {
                  const errData = await ttsRes.json();
                  errText = errData.error || errText;
                } catch(e) {}
                setTestMediaResult({ type: "audio", error: errText, status: "error" });
             }
           } else if (parsedResult.apiUrl) {
             let finalUrl = parsedResult.apiUrl;
             try {
               const urlObj = new URL(finalUrl);
               const q = urlObj.searchParams.get("q");
               if (q && q.length > 100) {
                 urlObj.searchParams.set("q", q.substring(0, 100));
                 finalUrl = urlObj.toString();
               }
             } catch (e) {
               // ignore invalid url parse errors
             }

             const mediaRes = await fetch(finalUrl);
             if (mediaRes.ok) {
               const mediaData = await mediaRes.json();
               setTestMediaResult({ type: parsedResult.mediaType, data: mediaData, status: "success" });
             } else {
               const errorText = await mediaRes.text();
               setTestMediaResult({ type: parsedResult.mediaType, error: errorText, status: "error" });
             }
           }
        } catch (e) {
           setTestExecutionResult(data.text);
        }
      } else {
        setTestExecutionResult({ error: data.error });
      }
    } catch (err) {
      setTestExecutionResult({ error: "Network error occurred" });
    } finally {
      setIsRunningTest(false);
    }
  };

  const activeAgent = agents.find(a => a.id === selectedAgentId) || (!selectedAgentId ? formData : null);

  return (
    <AppLayout edgeToEdge>
      <div className="flex h-full w-full bg-jarvis-bg overflow-hidden text-jarvis-text selection:bg-jarvis-primary/30">
        
        {/* Left Column: Agent List */}
        <div className="w-[300px] border-r border-jarvis-panel/40 glass-strong bg-jarvis-panel/5 flex flex-col h-full relative z-10 shrink-0">
          <div className="p-6 border-b border-jarvis-panel/40 shrink-0">
            <h1 className="font-heading text-lg font-bold tracking-widest text-jarvis-primary uppercase text-glow flex items-center gap-2">
              <Cpu className="size-5" /> Agent Registry
            </h1>
            <button 
              onClick={handleCreateNew}
              className="mt-4 w-full bg-jarvis-primary/10 hover:bg-jarvis-primary/20 text-jarvis-primary border border-jarvis-primary/30 px-4 py-2 rounded-lg transition-all text-xs font-bold uppercase tracking-widest"
            >
              + Create New Agent
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="size-6 animate-spin text-jarvis-primary/50" />
              </div>
            ) : (
              agents.map(agent => (
                <button
                  key={agent.id}
                  onClick={() => handleSelectAgent(agent)}
                  className={cn(
                    "w-full text-left p-4 rounded-xl transition-all duration-300 relative overflow-hidden group",
                    selectedAgentId === agent.id 
                      ? "bg-jarvis-primary/10 border border-jarvis-primary/30 shadow-[0_0_15px_rgba(52,245,208,0.1)]" 
                      : "bg-jarvis-panel/20 border border-jarvis-panel hover:bg-jarvis-panel/40"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm tracking-wide group-hover:text-jarvis-primary transition-colors">
                      {agent.name}
                    </span>
                    <div className={cn("size-2 rounded-full", agent.isActive ? "bg-[#34F5D0] shadow-[0_0_8px_#34F5D0]" : "bg-red-500")} />
                  </div>
                  <p className="text-[10px] text-jarvis-text-muted font-mono uppercase tracking-wider truncate">
                    Managed by JARVIS Router
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Agent Details */}
        <div className="flex-1 h-full overflow-y-auto relative bg-jarvis-bg-deepest/50">
          {/* Subtle Background Glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 size-[600px] bg-jarvis-primary/5 rounded-full blur-[100px] pointer-events-none" />
          
          {activeAgent ? (
            <div className="max-w-4xl mx-auto p-8 space-y-8 relative z-10">
              
              <div className="flex items-start justify-between">
                <div className="flex-1 mr-4">
                  <input
                    type="text"
                    value={formData.name || ""}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="text-3xl font-heading font-bold text-white mb-2 bg-transparent border-b border-transparent hover:border-jarvis-panel-border focus:border-jarvis-primary outline-none transition-colors w-full"
                    placeholder="Agent Name"
                  />
                  <input
                    type="text"
                    value={formData.description || ""}
                    onChange={(e) => handleChange("description", e.target.value)}
                    className="text-sm text-jarvis-text-muted bg-transparent border-b border-transparent hover:border-jarvis-panel-border focus:border-jarvis-primary outline-none transition-colors w-full"
                    placeholder="Brief description..."
                  />
                </div>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-jarvis-primary/10 hover:bg-jarvis-primary/20 text-jarvis-primary border border-jarvis-primary/30 px-6 py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(52,245,208,0.1)] font-bold uppercase text-xs tracking-widest disabled:opacity-50 shrink-0"
                >
                  {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  {selectedAgentId ? "Save Config" : "Create Agent"}
                </button>
              </div>

              {/* Status and Usage Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Connection Details / System Check */}
                <div className="glass-strong border border-jarvis-panel rounded-2xl p-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Key className="size-20" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-jarvis-text-muted mb-4 flex items-center gap-2">
                    <Activity className="size-4" /> Global AI Routing Engine
                  </h3>
                  
                  <div className="space-y-4 relative z-10">
                    <p className="text-xs text-jarvis-text-muted leading-relaxed">
                      This agent is powered by the central JARVIS Multi-Model Router. It automatically switches between Groq and OpenRouter's free tier (Llama 3.1 & Gemini) to ensure 100% uptime without requiring per-agent API keys.
                    </p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-jarvis-panel-border">
                      <button 
                        onClick={handleTestConnection}
                        disabled={isTesting}
                        className="flex items-center gap-2 bg-jarvis-panel hover:bg-jarvis-panel/80 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-colors disabled:opacity-50 border border-jarvis-panel-border"
                      >
                        {isTesting ? <Loader2 className="size-3 animate-spin" /> : <Activity className="size-3" />}
                        Ping Engine Status
                      </button>
                      
                      {testResult && (
                        <div className={cn(
                          "text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-md",
                          testResult.success ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                        )}>
                          {testResult.success ? "Engine Online" : "Engine Offline"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Resource Limits */}
                <div className="glass-strong border border-jarvis-panel rounded-2xl p-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <ShieldAlert className="size-20" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-jarvis-text-muted mb-4 flex items-center gap-2">
                    <Bot className="size-4" /> Operational Status
                  </h3>
                  
                  <div className="space-y-6 relative z-10">
                    <div className="flex items-center justify-between bg-jarvis-bg/50 border border-jarvis-panel-border p-3 rounded-lg">
                      <span className="text-xs uppercase tracking-widest font-bold">System Active</span>
                      <button 
                        onClick={() => handleChange("isActive", !formData.isActive)}
                        className={cn(
                          "w-12 h-6 rounded-full transition-colors relative",
                          formData.isActive ? "bg-jarvis-primary" : "bg-jarvis-panel"
                        )}
                      >
                        <motion.div 
                          layout
                          className="w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm"
                          animate={{ left: formData.isActive ? "calc(100% - 20px)" : "4px" }}
                        />
                      </button>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] uppercase tracking-widest text-jarvis-text-muted mb-2">
                        <span>Tokens Remaining</span>
                        <span className="text-jarvis-primary">{formData.usageLeft} / 1000</span>
                      </div>
                      <div className="h-2 w-full bg-jarvis-panel rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-jarvis-primary shadow-[0_0_10px_#34F5D0]"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.max(0, Math.min(100, ((formData.usageLeft || 0) / 1000) * 100))}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Core Directive (System Prompt) */}
              <div className="glass-strong border border-jarvis-panel rounded-2xl p-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-jarvis-text-muted mb-4">Core Directive (System Prompt)</h3>
                <textarea 
                  value={formData.systemPrompt || ""}
                  onChange={(e) => handleChange("systemPrompt", e.target.value)}
                  className="w-full h-64 bg-jarvis-bg/80 border border-jarvis-panel-border rounded-xl p-4 text-sm font-mono leading-relaxed focus:border-jarvis-primary/50 outline-none transition-colors resize-y shadow-inner"
                  placeholder="Define the agent's behavior..."
                />
              </div>

              {/* Agent Testing Sandbox */}
              <div className="glass-strong border border-jarvis-panel rounded-2xl p-6 relative overflow-hidden group mt-8">
                <h3 className="text-xs font-bold uppercase tracking-widest text-jarvis-text-muted mb-4 flex items-center gap-2">
                  <Play className="size-4" /> Agent Testing Sandbox
                </h3>
                <div className="space-y-4 relative z-10">
                  <textarea
                    value={testUserPrompt}
                    onChange={(e) => setTestUserPrompt(e.target.value)}
                    className="w-full bg-jarvis-bg/80 border border-jarvis-panel-border rounded-xl p-4 text-sm font-mono focus:border-jarvis-primary/50 outline-none transition-colors resize-none h-24"
                    placeholder="Enter user prompt to test (e.g., 'yellow flowers')..."
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleRunAgentTest}
                      disabled={isRunningTest || !testUserPrompt.trim()}
                      className="flex items-center gap-2 bg-jarvis-primary/10 hover:bg-jarvis-primary/20 text-jarvis-primary border border-jarvis-primary/30 px-6 py-2 rounded-xl transition-all shadow-[0_0_15px_rgba(52,245,208,0.1)] font-bold uppercase text-[10px] tracking-widest disabled:opacity-50 shrink-0"
                    >
                      {isRunningTest ? <Loader2 className="size-3 animate-spin" /> : <Play className="size-3 fill-current" />}
                      Execute Prompt
                    </button>
                  </div>
                  
                  {/* Results Display */}
                  {testExecutionResult && (
                    <div className="mt-6 border-t border-jarvis-panel-border pt-6">
                       <h4 className="text-[10px] uppercase font-bold text-jarvis-text-muted tracking-widest mb-2">Agent Output</h4>
                       <pre className="bg-jarvis-bg/50 p-4 rounded-xl border border-jarvis-panel-border text-xs text-jarvis-text/90 overflow-x-auto whitespace-pre-wrap">
                         {typeof testExecutionResult === "string" ? testExecutionResult : JSON.stringify(testExecutionResult, null, 2)}
                       </pre>
                       
                       {testMediaResult && (
                         <div className="mt-4 p-4 border border-jarvis-primary/20 rounded-xl bg-jarvis-primary/5">
                           <h4 className="text-[10px] uppercase font-bold text-jarvis-primary tracking-widest mb-3">Media Preview</h4>
                           
                           {testMediaResult.status === "error" && (
                             <div className="text-red-400 text-xs font-mono bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                               API Error: {testMediaResult.error}
                             </div>
                           )}

                           {testMediaResult.status === "success" && testMediaResult.type === "audio" && (
                             <audio controls src={testMediaResult.data.url} className="w-full mt-2" />
                           )}

                           {testMediaResult.status === "success" && testMediaResult.type !== "audio" && (!testMediaResult.data.hits || testMediaResult.data.hits.length === 0) && (
                             <div className="text-jarvis-text-muted text-xs font-mono">
                               No media results found for this query.
                             </div>
                           )}

                           {testMediaResult.status === "success" && testMediaResult.type !== "audio" && testMediaResult.data.hits && testMediaResult.data.hits.length > 0 && (
                             testMediaResult.type === "video" ? (
                               <video 
                                 controls 
                                 src={testMediaResult.data.hits[0].videos?.tiny?.url || testMediaResult.data.hits[0].videos?.small?.url || testMediaResult.data.hits[0].videos?.medium?.url} 
                                 className="w-full rounded-lg shadow-lg border border-jarvis-panel-border"
                               />
                             ) : (
                               <img 
                                 src={testMediaResult.data.hits[0].webformatURL || testMediaResult.data.hits[0].largeImageURL} 
                                 className="w-full rounded-lg shadow-lg border border-jarvis-panel-border object-contain max-h-[400px]"
                                 alt="Preview"
                               />
                             )
                           )}
                         </div>
                       )}
                    </div>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-jarvis-text-muted font-mono uppercase tracking-widest text-sm">
              Select an agent to view configurations
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
