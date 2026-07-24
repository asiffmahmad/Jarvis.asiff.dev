"use client";

import { useMail } from "@/lib/mail/use-mail";
import { MailSidebarLeft } from "@/components/mail/mail-sidebar-left";
import { MailList } from "@/components/mail/mail-list";
import { MailReader } from "@/components/mail/mail-reader";
import { MailComposer } from "@/components/mail/mail-composer";
import { AppLayout } from "@/components/layout/app-layout";
import { useState } from "react";

export default function MailWorkspacePage() {
  const mailState = useMail();
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  return (
    <AppLayout edgeToEdge>
      <div className="h-full w-full flex flex-col relative overflow-hidden bg-jarvis-bg-deepest">
        {/* Background HUD Grid */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(52,245,208,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(52,245,208,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />

        <div className="flex-1 flex h-full relative z-10">
          <MailSidebarLeft mailState={mailState} onCompose={() => setIsComposerOpen(true)} />
          
          <MailList mailState={mailState} />
          
          <MailReader mailState={mailState} onReply={() => setIsComposerOpen(true)} />
        </div>

        {isComposerOpen && (
          <MailComposer 
            mailState={mailState} 
            onClose={() => setIsComposerOpen(false)} 
          />
        )}
      </div>
    </AppLayout>
  );
}
