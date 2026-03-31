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
    <div
      className="relative min-h-screen flex flex-col overflow-x-hidden"
      style={{ background: "#FFFFFF" }}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <Header />

      {/* ── Page content ───────────────────────────────────────────────── */}
      <main
        className="relative z-10 flex-1 overflow-auto"
        style={{ paddingTop: '32px' }}
      >
        {children}
      </main>
    </div>
  );
}
