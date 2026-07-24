/**
 * JARVIS Login Layout
 *
 * Dedicated layout for the authentication flow.
 * Removes the main application shell (sidebar, top nav)
 * to provide an immersive, full-screen login experience.
 */

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-jarvis-bg-deepest relative overflow-hidden flex flex-col items-center justify-center">
      {/* Ambient background glows */}
      <div className="absolute top-[-20%] left-[-10%] size-[600px] rounded-full bg-jarvis-primary/5 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] size-[600px] rounded-full bg-jarvis-secondary/5 blur-[120px]" />

      {/* Grid overlay */}
      <div className="absolute inset-0 hud-grid opacity-50" />

      {/* Main content area */}
      <main className="relative z-10 w-full">{children}</main>
    </div>
  );
}
