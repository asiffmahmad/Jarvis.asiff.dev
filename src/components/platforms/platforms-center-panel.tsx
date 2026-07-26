"use client";

import {
  Link2, AlertCircle, ExternalLink, CheckCircle2, Loader2, Play
} from "lucide-react";
import { useState, useEffect } from "react";
import type { PlatformsState } from "@/lib/platforms/use-platforms";

interface CenterPanelProps {
  state: PlatformsState;
}

const connectionGuides: Record<string, { steps: string[]; docsUrl: string }> = {
  linkedin: {
    steps: [
      "Go to LinkedIn Developer Portal (https://developer.linkedin.com)",
      "Create a new app or select existing one",
      "Add the 'w_member_social' product to your app",
      "Copy your Client ID and Client Secret",
      "Add LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET to your .env file",
      "Set LINKEDIN_ACCESS_TOKEN after OAuth handshake"
    ],
    docsUrl: "https://learn.microsoft.com/en-us/linkedin/marketing/"
  },
  instagram: {
    steps: [
      "Go to Meta for Developers (https://developers.facebook.com)",
      "Create a Facebook App with Instagram Graph API",
      "Get a long-lived Page Access Token",
      "Add INSTAGRAM_ACCESS_TOKEN to your .env file",
      "Your Instagram Business or Creator account must be connected to the Facebook Page"
    ],
    docsUrl: "https://developers.facebook.com/docs/instagram-api/"
  },
  x: {
    steps: [
      "Go to X Developer Portal (https://developer.x.com)",
      "Create a new Project and App",
      "Generate API Key and API Secret (Consumer Keys)",
      "Add X_API_KEY and X_API_SECRET to your .env file",
      "Generate Access Token and Secret for your account"
    ],
    docsUrl: "https://developer.x.com/en/docs/twitter-api"
  },
  gmail: {
    steps: [
      "Ensure you have configured GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file",
      "Sign out of the Admin panel using the bottom left avatar profile card",
      "Log back in using the 'Sign in with Google' button",
      "This will automatically save and link your Gmail OAuth session to the database",
      "The automated background Email Agent will now monitor your inbox for billing updates"
    ],
    docsUrl: "https://developers.google.com/gmail/api/reference/rest"
  }
};

const platformInstructions: Record<string, string> = {
  linkedin: "Share professional content, articles, and industry insights on LinkedIn. Connect your LinkedIn account to publish posts directly.",
  instagram: "Share visual content, stories, and carousels on Instagram. Connect your Instagram Business or Creator account.",
  x: "Share short-form content, threads, and engage with your audience on X (Twitter).",
  gmail: "Analyze invoice and receipt emails, extracting transaction totals and populating your expense pivot report automatically."
};

export function PlatformsCenterPanel({ state }: CenterPanelProps) {
  const { activeProvider } = state;

  const [statuses, setStatuses] = useState<Record<string, boolean>>({});
  const [loadingStatus, setLoadingStatus] = useState(true);

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Fetch connection statuses on mount
  useEffect(() => {
    fetch("/api/platforms/status")
      .then(res => res.json())
      .then(data => {
        setStatuses(data);
        setLoadingStatus(false);
      })
      .catch(err => {
        console.error("Failed to fetch connection statuses", err);
        setLoadingStatus(false);
      });
  }, []);

  // Clear test result when switching providers
  useEffect(() => {
    setTestResult(null);
  }, [activeProvider?.id]);

  const handleTestConnection = async () => {
    if (!activeProvider) return;
    
    setTesting(true);
    setTestResult(null);
    
    try {
      const res = await fetch("/api/platforms/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platformId: activeProvider.id }),
      });
      const data = await res.json();
      
      setTestResult({
        success: res.ok && data.success,
        message: data.message || (res.ok ? "Connection successful" : "Connection failed")
      });

      // Update the status visually if it was successfully connected
      if (res.ok && data.success) {
        setStatuses(prev => ({ ...prev, [activeProvider.id]: true }));
      }
    } catch (err) {
      setTestResult({ success: false, message: "An unexpected error occurred." });
    } finally {
      setTesting(false);
    }
  };

  if (!activeProvider) {
    return (
      <div className="flex-[2] flex flex-col items-center justify-center relative h-full bg-jarvis-bg-deepest/50 border-r border-jarvis-panel/50 p-8">
        <Link2 className="size-16 mb-4 text-jarvis-text-muted opacity-50" />
        <h2 className="text-lg font-heading tracking-widest uppercase text-jarvis-text-muted opacity-50">Select a Platform</h2>
        <p className="text-xs text-jarvis-text-muted/50 mt-2 font-mono">Choose a platform from the sidebar to view connection details</p>
      </div>
    );
  }

  const isConnected = statuses[activeProvider.id] || false;

  return (
    <div className="flex-[2] flex flex-col relative h-full bg-jarvis-bg-deepest/50 border-r border-jarvis-panel/50 p-8 overflow-y-auto">
      
      <div className="mb-6 flex justify-between items-start">
        <h1 className="text-2xl font-heading font-bold text-jarvis-text uppercase tracking-widest flex items-center gap-3">
          <div className="w-8 h-8 rounded flex items-center justify-center font-bold text-sm text-white shadow-lg" style={{ backgroundColor: activeProvider.brandColor }}>
            {activeProvider.id.charAt(0).toUpperCase()}
          </div>
          {activeProvider.name}
        </h1>
        
        <button 
          onClick={handleTestConnection}
          disabled={testing || loadingStatus}
          className="flex items-center gap-2 px-4 py-2 bg-jarvis-panel border border-jarvis-panel-border rounded-lg text-sm text-jarvis-text font-bold uppercase tracking-wider hover:bg-jarvis-panel-border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {testing ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Play className="size-4" />
          )}
          {testing ? "Testing..." : "Test Connection"}
        </button>
      </div>

      <div className="space-y-8">
        {loadingStatus ? (
          <div className="bg-jarvis-panel/30 border border-jarvis-panel-border rounded-xl p-6 flex items-center justify-center">
            <Loader2 className="size-5 animate-spin text-jarvis-text-muted" />
          </div>
        ) : isConnected ? (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <CheckCircle2 className="size-5 text-green-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-green-400 uppercase tracking-wider">Connected</h3>
                <p className="text-xs text-green-400/70 mt-1 leading-relaxed">
                  {activeProvider.name} is properly configured and ready to be used.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-jarvis-panel/30 border border-jarvis-panel-border rounded-xl p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="size-5 text-jarvis-text-muted shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-jarvis-text uppercase tracking-wider">Not Connected</h3>
                <p className="text-xs text-jarvis-text-muted mt-1 leading-relaxed">
                  {platformInstructions[activeProvider.id] || `${activeProvider.name} is not yet connected.`}
                </p>
              </div>
            </div>
          </div>
        )}

        {testResult && (
          <div className={`p-4 rounded-lg border ${testResult.success ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
            <p className="text-sm font-mono">{testResult.message}</p>
          </div>
        )}

        <div>
          <h3 className="text-sm font-heading font-bold text-jarvis-text uppercase tracking-widest mb-4">
            How to Connect
          </h3>
          <div className="space-y-3">
            {(connectionGuides[activeProvider.id]?.steps || []).map((step, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-jarvis-primary/10 border border-jarvis-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold text-jarvis-primary">{i + 1}</span>
                </div>
                <p className="text-sm text-jarvis-text/80 leading-relaxed">{step}</p>
              </div>
            ))}
            {(!connectionGuides[activeProvider.id] || connectionGuides[activeProvider.id].steps.length === 0) && (
              <p className="text-sm text-jarvis-text-muted">No specific instructions available.</p>
            )}
          </div>
        </div>

        {connectionGuides[activeProvider.id] && (
          <a
            href={connectionGuides[activeProvider.id].docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-jarvis-primary/5 border border-jarvis-primary/20 text-xs font-bold text-jarvis-primary uppercase tracking-wider hover:bg-jarvis-primary/10 transition-colors"
          >
            <ExternalLink className="size-3" />
            Developer Documentation
          </a>
        )}
      </div>
    </div>
  );
}
