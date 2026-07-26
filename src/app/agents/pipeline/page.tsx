"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout/app-layout";
import { Route, Save, Loader2, Plus, X, Lock, Cpu, Trash2, PenTool } from "lucide-react";
import { cn } from "@/lib/utils";

type Agent = {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  model: string;
  isActive: boolean;
};

type PipelineConfig = {
  id: string;
  name: string;
  flow: string[];
};

export default function PipelineSettingsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [pipelines, setPipelines] = useState<PipelineConfig[]>([]);
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>("default");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setErrorText("");
    try {
      const registryRes = await fetch("/api/agents/registry");
      const configRes = await fetch("/api/pipeline/config");
      
      const regText = await registryRes.text();
      const confText = await configRes.text();
      
      if (!registryRes.ok || !configRes.ok) {
        setErrorText(`Error loading API. Registry: ${registryRes.status} | Config: ${configRes.status}`);
        return;
      }
      
      try {
        const registryData = JSON.parse(regText);
        const configData = JSON.parse(confText);
        setAgents(registryData);
        setPipelines(configData.pipelines || []);
        if (configData.pipelines && configData.pipelines.length > 0) {
          setSelectedPipelineId(configData.pipelines[0].id);
        }
      } catch (e: any) {
        setErrorText("Failed to parse JSON: " + e.message);
      }
    } catch (err: any) {
      setErrorText("Network Error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/pipeline/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pipelines })
      });
      if (res.ok) {
        // success
      }
    } catch (err) {
      console.error("Failed to save pipelines", err);
    } finally {
      setIsSaving(false);
    }
  };

  const currentPipeline = pipelines.find(p => p.id === selectedPipelineId);
  const pipelineFlow = currentPipeline ? currentPipeline.flow : [];

  const updateCurrentPipelineFlow = (newFlow: string[]) => {
    setPipelines(prev => prev.map(p => p.id === selectedPipelineId ? { ...p, flow: newFlow } : p));
  };

  const addAgentToPipeline = (agentId: string) => {
    updateCurrentPipelineFlow([...pipelineFlow, agentId]);
  };

  const removeAgentFromPipeline = (index: number) => {
    updateCurrentPipelineFlow(pipelineFlow.filter((_, i) => i !== index));
  };

  const createNewPipeline = () => {
    const id = Math.random().toString(36).substring(7);
    const newPipeline = { id, name: "New Pipeline", flow: [] };
    setPipelines([...pipelines, newPipeline]);
    setSelectedPipelineId(id);
  };

  const deleteCurrentPipeline = () => {
    if (pipelines.length <= 1) return; // don't delete the last one
    const newPipelines = pipelines.filter(p => p.id !== selectedPipelineId);
    setPipelines(newPipelines);
    setSelectedPipelineId(newPipelines[0].id);
  };

  const renameCurrentPipeline = (name: string) => {
    setPipelines(prev => prev.map(p => p.id === selectedPipelineId ? { ...p, name } : p));
  };

  const jarvis = agents.find(a => a.name === "JARVIS");
  const availableAgents = agents.filter(a => a.name !== "JARVIS" && a.isActive);

  return (
    <AppLayout edgeToEdge>
      <div className="flex h-full w-full bg-jarvis-bg overflow-hidden text-jarvis-text selection:bg-jarvis-primary/30">
        
        {/* Left Column: Available Agents */}
        <div className="w-[350px] border-r border-jarvis-panel/40 glass-strong bg-jarvis-panel/5 flex flex-col h-full relative z-10 shrink-0">
          <div className="p-6 border-b border-jarvis-panel/40 shrink-0">
            <h1 className="font-heading text-lg font-bold tracking-widest text-jarvis-primary uppercase text-glow flex items-center gap-2">
              <Cpu className="size-5" /> Available Agents
            </h1>
            <p className="text-xs text-jarvis-text-muted mt-1 uppercase tracking-wider font-mono">
              Click to add to sequence
            </p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {errorText && (
              <div className="p-4 bg-red-500/20 border border-red-500 text-red-400 text-xs rounded-xl break-all">
                {errorText}
              </div>
            )}
            {isLoading ? (
              <div className="flex justify-center h-32 items-center">
                <Loader2 className="size-6 animate-spin text-jarvis-primary/50" />
              </div>
            ) : availableAgents.length === 0 ? (
              <div className="text-center text-xs text-jarvis-text-muted mt-8 uppercase tracking-widest">
                No active agents found
              </div>
            ) : (
              availableAgents.map(agent => (
                <button
                  key={agent.id}
                  onClick={() => addAgentToPipeline(agent.id)}
                  className="w-full text-left p-4 rounded-xl transition-all duration-300 relative overflow-hidden group bg-jarvis-panel/20 border border-jarvis-panel hover:bg-jarvis-panel/60 hover:border-jarvis-primary/50"
                  disabled={!currentPipeline}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm tracking-wide text-white group-hover:text-jarvis-primary transition-colors">
                      {agent.name}
                    </span>
                    <Plus className="size-4 text-jarvis-text-muted group-hover:text-jarvis-primary" />
                  </div>
                  <p className="text-[10px] text-jarvis-text-muted font-mono uppercase tracking-wider truncate">
                    {agent.model}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Pipeline Sequence */}
        <div className="flex-1 h-full overflow-y-auto relative bg-jarvis-bg-deepest/50">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 size-[600px] bg-jarvis-primary/5 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="max-w-4xl mx-auto p-8 space-y-8 relative z-10">
            <div className="flex items-start justify-between">
              <div className="flex-1 mr-8">
                <div className="flex items-center gap-4 mb-4">
                  <select
                    value={selectedPipelineId}
                    onChange={(e) => setSelectedPipelineId(e.target.value)}
                    className="bg-jarvis-panel border border-jarvis-panel-border rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-jarvis-primary w-64"
                  >
                    {pipelines.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={createNewPipeline}
                    className="text-xs text-jarvis-primary uppercase tracking-widest font-bold flex items-center gap-1 hover:text-white transition-colors"
                  >
                    <Plus className="size-3" /> New Pipeline
                  </button>
                </div>

                {currentPipeline && (
                  <div className="flex items-center gap-4 mt-2">
                    <div className="relative w-full max-w-md group">
                      <input
                        type="text"
                        value={currentPipeline.name}
                        onChange={(e) => renameCurrentPipeline(e.target.value)}
                        placeholder="Enter Pipeline Name..."
                        className="text-3xl font-heading font-bold text-white mb-2 bg-transparent border-b-2 border-jarvis-panel-border/50 hover:border-jarvis-primary/50 focus:border-jarvis-primary outline-none transition-colors w-full pb-1 pr-10"
                      />
                      <PenTool className="absolute right-2 top-3 size-5 text-jarvis-text-muted group-hover:text-jarvis-primary transition-colors pointer-events-none opacity-50" />
                    </div>
                    {pipelines.length > 1 && (
                      <button onClick={deleteCurrentPipeline} className="text-red-400 hover:text-red-300 transition-colors p-2 bg-red-500/10 rounded-lg" title="Delete Pipeline">
                        <Trash2 className="size-5" />
                      </button>
                    )}
                  </div>
                )}
                <p className="text-sm text-jarvis-text-muted">
                  Configure the order of automation execution for this pipeline.
                </p>
              </div>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 bg-jarvis-primary/10 hover:bg-jarvis-primary/20 text-jarvis-primary border border-jarvis-primary/30 px-6 py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(52,245,208,0.1)] font-bold uppercase text-xs tracking-widest disabled:opacity-50 shrink-0"
              >
                {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                Save Config
              </button>
            </div>

            <div className="space-y-4 py-8">
              {pipelineFlow.map((agentId, index) => {
                const agent = agents.find(a => a.id === agentId);
                if (!agent) return null;
                
                return (
                  <motion.div 
                    layout
                    key={`${agentId}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-strong border border-jarvis-panel rounded-2xl p-4 flex items-center gap-6 relative group"
                  >
                    <div className="size-10 rounded-full bg-jarvis-bg border border-jarvis-panel flex items-center justify-center font-heading font-bold text-jarvis-primary text-sm shadow-[0_0_15px_rgba(52,245,208,0.1)]">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-white">{agent.name}</h3>
                      <p className="text-[10px] text-jarvis-text-muted uppercase tracking-widest">{agent.description || "Custom Node"}</p>
                    </div>
                    <button 
                      onClick={() => removeAgentFromPipeline(index)}
                      className="p-2 text-jarvis-text-muted hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X className="size-5" />
                    </button>
                    
                    {/* Connecting Line to next node */}
                    <div className="absolute left-9 top-14 w-0.5 h-6 bg-jarvis-panel-border -z-10" />
                  </motion.div>
                );
              })}

              {/* Final Fixed Node (JARVIS) */}
              {jarvis && (
                <motion.div 
                  layout
                  className="glass-strong border border-jarvis-primary/50 bg-jarvis-primary/5 rounded-2xl p-4 flex items-center gap-6 relative"
                >
                  <div className="size-10 rounded-full bg-jarvis-primary/20 border border-jarvis-primary flex items-center justify-center text-jarvis-primary shadow-[0_0_15px_rgba(52,245,208,0.4)]">
                    <Lock className="size-4" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-jarvis-primary text-glow">{jarvis.name}</h3>
                    <p className="text-[10px] text-jarvis-text-muted uppercase tracking-widest">{jarvis.description}</p>
                  </div>
                  <div className="px-3 py-1 bg-jarvis-bg rounded-md border border-jarvis-panel text-[10px] uppercase tracking-widest text-jarvis-text-muted font-bold">
                    Fixed Output
                  </div>
                </motion.div>
              )}
              
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
