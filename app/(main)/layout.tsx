import { Header } from "@/components/layout/Header";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden" style={{ background: "var(--bg-base)" }}>
      {/* ── Background blobs (fixed, non-interactive) ──────────────────── */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        {/* Top-left large blob */}
        <div
          className="absolute rounded-full"
          style={{
            width: 520,
            height: 520,
            top: -140,
            left: -100,
            background: "radial-gradient(circle, rgba(122,184,236,0.55) 0%, transparent 70%)",
            filter: "blur(2px)",
          }}
        />
        {/* Bottom-right blob */}
        <div
          className="absolute rounded-full"
          style={{
            width: 480,
            height: 480,
            bottom: -100,
            right: -80,
            background: "radial-gradient(circle, rgba(122,184,236,0.45) 0%, transparent 70%)",
            filter: "blur(2px)",
          }}
        />
        {/* Centre-left mid blob */}
        <div
          className="absolute rounded-full"
          style={{
            width: 320,
            height: 320,
            top: "38%",
            left: "18%",
            background: "radial-gradient(circle, rgba(145,198,242,0.30) 0%, transparent 70%)",
            filter: "blur(4px)",
          }}
        />
        {/* Top-right small blob */}
        <div
          className="absolute rounded-full"
          style={{
            width: 240,
            height: 240,
            top: 60,
            right: "22%",
            background: "radial-gradient(circle, rgba(108,170,220,0.35) 0%, transparent 70%)",
            filter: "blur(2px)",
          }}
        />
      </div>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <Header />

      {/* ── Page content ───────────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
