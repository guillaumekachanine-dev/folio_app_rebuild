import {
  FolderKanban,
  CalendarDays,
  Users,
  Wallet,
  Newspaper,
  GraduationCap,
  Plus,
  Pencil,
} from "lucide-react";
import Link from "next/link";

// ─── Card shell ───────────────────────────────────────────────────────────────

function Card({
  children,
  href,
  tinted = false,
  style,
  className = "",
}: {
  children: React.ReactNode;
  href?: string;
  tinted?: boolean;
  style?: React.CSSProperties;
  className?: string;
}) {
  const base = [
    "rounded-[1.125rem] overflow-hidden flex flex-col",
    tinted
      ? "bg-white/50 backdrop-blur-md border border-white/40"
      : "bg-white border border-white/30 shadow-sm shadow-black/[0.06]",
    className,
  ].join(" ");

  return href ? (
    <Link href={href} className={base} style={style}>
      {children}
    </Link>
  ) : (
    <div className={base} style={style}>
      {children}
    </div>
  );
}

// ─── Card header (matching reference exactly) ─────────────────────────────────
// [Icon 44×44] [Title bold 20px / Subtitle 13px gray]   [Action]

function CardHead({
  icon: Icon,
  color,
  title,
  subtitle,
  action,
}: {
  icon: React.ElementType;
  color: string;
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 px-4 pt-4 pb-3">
      {/* Module icon */}
      <div
        className="w-11 h-11 rounded-[0.75rem] flex items-center justify-center flex-shrink-0 shadow-sm"
        style={{ backgroundColor: color }}
      >
        <Icon size={22} color="#fff" strokeWidth={1.75} />
      </div>

      {/* Title stack */}
      <div className="flex-1 min-w-0">
        <p
          className="text-[var(--foreground)] font-bold leading-tight truncate"
          style={{ fontSize: 17 }}
        >
          {title}
        </p>
        <p
          className="text-[var(--foreground-muted)] leading-tight truncate mt-0.5"
          style={{ fontSize: 12 }}
        >
          {subtitle}
        </p>
      </div>

      {/* Action */}
      {action && (
        <div className="flex-shrink-0 text-[var(--foreground-muted)]">{action}</div>
      )}
    </div>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────

function Divider() {
  return <div className="mx-4" style={{ height: 1, backgroundColor: "var(--divider)" }} />;
}

// ─── Row item (list row inside a card) ───────────────────────────────────────

function Row({ primary, secondary }: { primary: string; secondary?: string }) {
  return (
    <div className="px-4 py-2.5">
      <p className="text-[var(--foreground)] font-medium" style={{ fontSize: 14 }}>
        {primary}
      </p>
      {secondary && (
        <p className="text-[var(--foreground-muted)]" style={{ fontSize: 12 }}>
          {secondary}
        </p>
      )}
    </div>
  );
}

// ─── Plus / Edit action buttons ───────────────────────────────────────────────

function ActionPlus() {
  return <Plus size={18} strokeWidth={2} />;
}
function ActionEdit() {
  return <Pencil size={15} strokeWidth={1.75} />;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <div
      className="p-3 md:p-4"
      style={{ height: "calc(100vh - 44px)" }}
    >
      {/*
        Grid 3 × 3
        R1 : [Photo 1col] [Projets  2col]
        R2 : [Planning   2col] [Formation + Budget stacked 1col]
        R3 : [Prospection 1col] [AI News 2col]
      */}
      <div
        className="grid h-full gap-3"
        style={{
          gridTemplateColumns: "1fr 1fr 1fr",
          gridTemplateRows: "1fr 1fr 1fr",
        }}
      >

        {/* ── R1C1 : Photo / identité ──────────────────────────────────── */}
        <Card
          tinted
          style={{ gridColumn: "1", gridRow: "1" }}
          className="items-start justify-end p-5 bg-gradient-to-br from-[#5b93d4]/60 to-[#7ab8ec]/70"
        >
          {/* Avatar placeholder */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#4f6ef7] to-[#af52de] mb-3 shadow-md" />
          <p className="text-white font-bold leading-tight" style={{ fontSize: 18 }}>
            Folio
          </p>
          <p className="text-white/70 leading-tight mt-0.5" style={{ fontSize: 13 }}>
            Votre espace
          </p>
          <span
            className="mt-2 inline-block px-2 py-0.5 rounded-md text-white font-semibold"
            style={{ fontSize: 11, backgroundColor: "rgba(255,255,255,0.22)" }}
          >
            Dashboard
          </span>
        </Card>

        {/* ── R1C2-3 : Projets ─────────────────────────────────────────── */}
        <Card
          href="/projets"
          style={{ gridColumn: "2 / 4", gridRow: "1" }}
        >
          <CardHead
            icon={FolderKanban}
            color="var(--c-projets)"
            title="Projets"
            subtitle="Perso & Pro"
            action={<ActionEdit />}
          />
          <Divider />
          <div className="flex flex-1 min-h-0">
            {/* Perso column */}
            <div className="flex-1 min-w-0 py-1">
              <p
                className="px-4 pt-1.5 pb-1 font-semibold text-[var(--foreground-muted)] uppercase tracking-wide"
                style={{ fontSize: 10 }}
              >
                Perso
              </p>
              <Divider />
              <Row primary="Aucun projet" secondary="Créez votre premier projet" />
            </div>
            {/* Separator */}
            <div style={{ width: 1, backgroundColor: "var(--divider)" }} />
            {/* Pro column */}
            <div className="flex-1 min-w-0 py-1">
              <p
                className="px-4 pt-1.5 pb-1 font-semibold text-[var(--foreground-muted)] uppercase tracking-wide"
                style={{ fontSize: 10 }}
              >
                Pro
              </p>
              <Divider />
              <Row primary="Aucun projet" secondary="Créez votre premier projet" />
            </div>
          </div>
        </Card>

        {/* ── R2C1-2 : Planning ────────────────────────────────────────── */}
        <Card
          href="/planning"
          style={{ gridColumn: "1 / 3", gridRow: "2" }}
        >
          <CardHead
            icon={CalendarDays}
            color="var(--c-planning)"
            title="Planning"
            subtitle="Toute l'activité"
            action={<ActionEdit />}
          />
          <Divider />
          <div className="flex-1 flex items-center justify-center px-4 pb-4">
            <div className="w-full h-full rounded-xl flex items-center justify-center" style={{ backgroundColor: "#f2f2f7" }}>
              <p className="text-[var(--foreground-light)]" style={{ fontSize: 13 }}>
                Aucune activité planifiée
              </p>
            </div>
          </div>
        </Card>

        {/* ── R2C3 : Formation + Budget ────────────────────────────────── */}
        <div
          style={{ gridColumn: "3", gridRow: "2" }}
          className="flex flex-col gap-3"
        >
          {/* Formation */}
          <Card href="/planning" className="flex-1">
            <CardHead
              icon={GraduationCap}
              color="var(--c-formation)"
              title="Formation"
              subtitle="Prochaine session"
              action={<ActionPlus />}
            />
            <Divider />
            <div className="flex flex-1 items-center justify-center px-3 pb-3">
              <p className="text-[var(--foreground-light)]" style={{ fontSize: 12 }}>
                Aucune formation
              </p>
            </div>
          </Card>

          {/* Budget */}
          <Card href="/budget" className="flex-1">
            <CardHead
              icon={Wallet}
              color="var(--c-budget)"
              title="Budget"
              subtitle="Solde du compte"
              action={<ActionPlus />}
            />
            <Divider />
            <div className="px-4 pb-3 pt-2">
              <p
                className="text-[var(--foreground)] font-bold"
                style={{ fontSize: 22, letterSpacing: "-0.5px" }}
              >
                —
              </p>
            </div>
          </Card>
        </div>

        {/* ── R3C1 : Prospection ───────────────────────────────────────── */}
        <Card
          href="/prospection"
          style={{ gridColumn: "1", gridRow: "3" }}
        >
          <CardHead
            icon={Users}
            color="var(--c-prospection)"
            title="Prospection"
            subtitle="Derniers prospects"
            action={<ActionEdit />}
          />
          <Divider />
          <div className="flex-1 px-4 pb-4 pt-3 min-h-0">
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: "#f2f2f7" }}
                >
                  <Users size={16} color="var(--foreground-light)" strokeWidth={1.5} />
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* ── R3C2-3 : AI News ─────────────────────────────────────────── */}
        <Card
          href="/ai-news"
          style={{ gridColumn: "2 / 4", gridRow: "3" }}
        >
          <CardHead
            icon={Newspaper}
            color="var(--c-ai-news)"
            title="AI News"
            subtitle="Synthèses du jour"
            action={<ActionEdit />}
          />
          <Divider />
          <div className="flex flex-1 min-h-0 gap-0">
            {(["Business", "LLM"] as const).map((cat, i) => (
              <div key={cat} className="flex-1 min-w-0">
                {i > 0 && (
                  <div
                    className="absolute"
                    style={{ width: 1, top: 0, bottom: 0, backgroundColor: "var(--divider)" }}
                  />
                )}
                <div className={i > 0 ? "border-l border-[var(--divider)]" : ""}>
                  <p
                    className="px-4 pt-2 pb-1 font-semibold text-[var(--foreground-muted)] uppercase tracking-wide"
                    style={{ fontSize: 10 }}
                  >
                    {cat}
                  </p>
                  <Divider />
                  <div className="px-4 py-2.5">
                    <p className="text-[var(--foreground-light)]" style={{ fontSize: 13 }}>
                      Aucun article aujourd'hui
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </div>
  );
}
