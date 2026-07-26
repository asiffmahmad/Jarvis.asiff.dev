"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/layout/app-layout";
import { Bot, Save, Loader2, Cpu, Activity, ShieldAlert, Key } from "lucide-react";
import { cn } from "@/lib/utils";

type Agent = {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  model: string;
  apiProvider: string;
  usageLeft: number;
  isActive: boolean;
};

export default function AgentSettingsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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
  };

  const handleChange = (field: keyof Agent, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!selectedAgentId) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/agents/registry", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedAgentId, ...formData })
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

  const activeAgent = agents.find(a => a.id === selectedAgentId);

  return (
    <AppLayout edgeToEdge>
      <div className="flex h-full w-full bg-jarvis-bg overflow-hidden text-jarvis-text selection:bg-jarvis-primary/30">
        
        {/* Left Column: Agent List */}
        <div className="w-[300px] border-r border-jarvis-panel/40 glass-strong bg-jarvis-panel/5 flex flex-col h-full relative z-10 shrink-0">
          <div className="p-6 border-b border-jarvis-panel/40 shrink-0">
            <h1 className="font-heading text-lg font-bold tracking-widest text-jarvis-primary uppercase text-glow flex items-center gap-2">
              <Cpu className="size-5" /> Agent Registry
            </h1>
            <p className="text-xs text-jarvis-text-muted mt-1 uppercase tracking-wider font-mono">
              System Operations
            </p>
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
                    {agent.model} • {agent.apiProvider}
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
                <div>
                  <h2 className="text-3xl font-heading font-bold text-white mb-2">{formData.name}</h2>
                  <p className="text-sm text-jarvis-text-muted">{formData.description || "No description provided."}</p>
                </div>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-jarvis-primary/10 hover:bg-jarvis-primary/20 text-jarvis-primary border border-jarvis-primary/30 px-6 py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(52,245,208,0.1)] font-bold uppercase text-xs tracking-widest disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  Save Configuration
                </button>
              </div>

              {/* Status and Usage Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Connection Details */}
                <div className="glass-strong border border-jarvis-panel rounded-2xl p-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Key className="size-20" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-jarvis-text-muted mb-4 flex items-center gap-2">
                    <Activity className="size-4" /> API Connection
                  </h3>
                  
                  <div className="space-y-4 relative z-10">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-jarvis-text-muted block mb-1">Provider</label>
                      <input 
                        type="text" 
                        value={formData.apiProvider || ""}
                        onChange={(e) => handleChange("apiProvider", e.target.value)}
                        className="w-full bg-jarvis-bg/50 border border-jarvis-panel-border rounded-lg px-3 py-2 text-sm focus:border-jarvis-primary/50 outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-jarvis-text-muted block mb-1">Model Engine</label>
                      <input 
                        type="text" 
                        value={formData.model || ""}
                        onChange={(e) => handleChange("model", e.target.value)}
                        className="w-full bg-jarvis-bg/50 border border-jarvis-panel-border rounded-lg px-3 py-2 text-sm focus:border-jarvis-primary/50 outline-none transition-colors"
                      />
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
