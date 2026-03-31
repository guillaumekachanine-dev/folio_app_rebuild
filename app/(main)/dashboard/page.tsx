import {
  FolderKanban,
  CalendarDays,
  Users,
  Wallet,
  Newspaper,
  GraduationCap,
  Plus,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

// ─── Bento Card ───────────────────────────────────────────────────────────────

function BentoCard({
  children,
  className = "",
  href,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  href?: string;
  style?: React.CSSProperties;
}) {
  const base =
    "bg-white/80 backdrop-blur-sm border border-white/70 rounded-2xl shadow-sm overflow-hidden";
  if (href) {
    return (
      <Link
        href={href}
        className={`${base} ${className} hover:shadow-md hover:shadow-indigo-100/60 transition-shadow`}
        style={style}
      >
        {children}
      </Link>
    );
  }
  return (
    <div className={`${base} ${className}`} style={style}>
      {children}
    </div>
  );
}

function CardHeader({
  icon: Icon,
  label,
  color,
  action,
}: {
  icon: React.ElementType;
  label: string;
  color: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
      <div className="flex items-center gap-2">
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: color + "20" }}
        >
          <Icon size={13} style={{ color }} strokeWidth={2} />
        </div>
        <span className="text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
          {label}
        </span>
      </div>
      {action}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <div className="p-4 md:p-5" style={{ height: "calc(100vh - 45px)" }}>
      {/*
        3-col × 3-row bento
        Row 1 : [Photo 1col] [Projets  2col]
        Row 2 : [Planning   2col] [Formation+Budget 1col stacked]
        Row 3 : [Prospection 1col] [AI News 2col]
      */}
      <div
        className="grid h-full gap-3"
        style={{
          gridTemplateColumns: "1fr 1fr 1fr",
          gridTemplateRows: "1fr 1fr 1fr",
        }}
      >
        {/* ── PHOTO ─── row1, col1 */}
        <BentoCard
          style={{ gridColumn: "1", gridRow: "1" }}
          className="flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 border-0"
        >
          <span className="text-white/25 font-bold font-[var(--font-geist-mono)] text-3xl tracking-widest select-none">
            FOLIO
          </span>
          <p className="text-white/40 text-xs mt-1">Votre espace</p>
        </BentoCard>

        {/* ── PROJETS ─── row1, col2-3 */}
        <BentoCard
          href="/projets"
          style={{ gridColumn: "2 / 4", gridRow: "1" }}
          className="flex flex-col"
        >
          <CardHeader
            icon={FolderKanban}
            label="Projets"
            color="#6366f1"
            action={<ArrowRight size={13} className="text-[var(--muted-foreground)]" />}
          />
          <div className="flex flex-1 gap-3 px-4 pb-4 min-h-0">
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-1.5">
                Perso
              </p>
              <div className="text-xs text-[var(--muted-foreground)] bg-[var(--secondary)] rounded-xl px-3 py-2">
                Aucun projet
              </div>
            </div>
            <div className="w-px bg-[var(--border)]" />
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-1.5">
                Pro
              </p>
              <div className="text-xs text-[var(--muted-foreground)] bg-[var(--secondary)] rounded-xl px-3 py-2">
                Aucun projet
              </div>
            </div>
          </div>
        </BentoCard>

        {/* ── PLANNING ─── row2, col1-2 */}
        <BentoCard
          href="/planning"
          style={{ gridColumn: "1 / 3", gridRow: "2" }}
          className="flex flex-col"
        >
          <CardHeader
            icon={CalendarDays}
            label="Planning"
            color="#0ea5e9"
            action={<ArrowRight size={13} className="text-[var(--muted-foreground)]" />}
          />
          <div className="flex-1 px-4 pb-4 min-h-0">
            <div className="h-full rounded-xl bg-[var(--secondary)] flex items-center justify-center">
              <p className="text-xs text-[var(--muted-foreground)]">
                Aucune activité planifiée
              </p>
            </div>
          </div>
        </BentoCard>

        {/* ── FORMATION + BUDGET stacked ─── row2, col3 */}
        <div
          style={{ gridColumn: "3", gridRow: "2" }}
          className="flex flex-col gap-3"
        >
          <BentoCard href="/planning" className="flex-1 flex flex-col">
            <CardHeader icon={GraduationCap} label="Formation" color="#f97316" />
            <div className="flex flex-1 items-center justify-center px-4 pb-3">
              <p className="text-xs text-[var(--muted-foreground)]">Aucune formation</p>
            </div>
          </BentoCard>

          <BentoCard href="/budget" className="flex-1 flex flex-col">
            <CardHeader
              icon={Wallet}
              label="Budget"
              color="#10b981"
              action={
                <button className="w-5 h-5 rounded-full bg-[var(--secondary)] flex items-center justify-center hover:bg-[var(--accent)] transition-colors">
                  <Plus size={10} className="text-[var(--muted-foreground)]" />
                </button>
              }
            />
            <div className="px-4 pb-3">
              <p className="text-lg font-bold text-[var(--foreground)] leading-none">—</p>
              <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5">Solde du compte</p>
            </div>
          </BentoCard>
        </div>

        {/* ── PROSPECTION ─── row3, col1 */}
        <BentoCard
          href="/prospection"
          style={{ gridColumn: "1", gridRow: "3" }}
          className="flex flex-col"
        >
          <CardHeader
            icon={Users}
            label="Prospection"
            color="#f59e0b"
            action={<ArrowRight size={13} className="text-[var(--muted-foreground)]" />}
          />
          <div className="flex-1 px-4 pb-4 min-h-0">
            <div className="grid grid-cols-4 gap-1.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-xl bg-[var(--secondary)] flex items-center justify-center"
                >
                  <Users size={12} className="text-[var(--border)]" />
                </div>
              ))}
            </div>
          </div>
        </BentoCard>

        {/* ── AI NEWS ─── row3, col2-3 */}
        <BentoCard
          href="/ai-news"
          style={{ gridColumn: "2 / 4", gridRow: "3" }}
          className="flex flex-col"
        >
          <CardHeader
            icon={Newspaper}
            label="AI News"
            color="#8b5cf6"
            action={<ArrowRight size={13} className="text-[var(--muted-foreground)]" />}
          />
          <div className="flex-1 px-4 pb-4 min-h-0 flex gap-3">
            {(["Business", "LLM"] as const).map((cat) => (
              <div key={cat} className="flex-1 bg-[var(--secondary)] rounded-xl p-3 min-w-0">
                <p className="text-[9px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-1">
                  {cat}
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Aucun article aujourd'hui
                </p>
              </div>
            ))}
          </div>
        </BentoCard>
      </div>
    </div>
  );
}
