"use client";

import {
  Link2, AlertCircle, ExternalLink
} from "lucide-react";
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
  }
};

const platformInstructions: Record<string, string> = {
  linkedin: "Share professional content, articles, and industry insights on LinkedIn. Connect your LinkedIn account to publish posts directly.",
  instagram: "Share visual content, stories, and carousels on Instagram. Connect your Instagram Business or Creator account.",
  x: "Share short-form content, threads, and engage with your audience on X (Twitter)."
};

export function PlatformsCenterPanel({ state }: CenterPanelProps) {
  const { activeProvider } = state;

  if (!activeProvider) {
    return (
      <div className="flex-[2] flex flex-col items-center justify-center relative h-full bg-jarvis-bg-deepest/50 border-r border-jarvis-panel/50 p-8">
        <Link2 className="size-16 mb-4 text-jarvis-text-muted opacity-50" />
        <h2 className="text-lg font-heading tracking-widest uppercase text-jarvis-text-muted opacity-50">Select a Platform</h2>
        <p className="text-xs text-jarvis-text-muted/50 mt-2 font-mono">Choose a platform from the sidebar to view connection details</p>
      </div>
    );
  }

  return (
    <div className="flex-[2] flex flex-col relative h-full bg-jarvis-bg-deepest/50 border-r border-jarvis-panel/50 p-8 overflow-y-auto">
      
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-jarvis-text uppercase tracking-widest flex items-center gap-3">
          <div className="w-8 h-8 rounded flex items-center justify-center font-bold text-sm text-white shadow-lg" style={{ backgroundColor: activeProvider.brandColor }}>
            {activeProvider.id.charAt(0).toUpperCase()}
          </div>
          {activeProvider.name}
        </h1>
      </div>

      <div className="space-y-8">
        <div className="bg-jarvis-panel/30 border border-jarvis-panel-border rounded-xl p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="size-5 text-jarvis-text-muted shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-jarvis-text">Not Connected</h3>
              <p className="text-xs text-jarvis-text-muted mt-1 leading-relaxed">
                {platformInstructions[activeProvider.id] || `${activeProvider.name} is not yet connected.`}
              </p>
            </div>
          </div>
        </div>

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
