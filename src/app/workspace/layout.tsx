/**
 * JARVIS Workspace Layout
 *
 * This layout specifically overrides the main AppLayout for the workspace
 * route to provide an immersive, edge-to-edge 3-pane experience.
 */

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-full bg-jarvis-bg-deepest flex overflow-hidden relative">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] size-[800px] rounded-full bg-jarvis-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] size-[600px] rounded-full bg-jarvis-secondary/5 blur-[100px]" />
        <div className="absolute inset-0 hud-grid opacity-[0.15]" />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex w-full h-full relative z-10">
        {children}
      </main>
    </div>
  );
}
