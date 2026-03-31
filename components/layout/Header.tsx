"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  CalendarDays,
  Wallet,
  Newspaper,
  Settings,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/projets", label: "Projets", Icon: FolderKanban },
  { href: "/prospection", label: "Prospection", Icon: Users },
  { href: "/planning", label: "Planning", Icon: CalendarDays },
  { href: "/budget", label: "Budget", Icon: Wallet },
  { href: "/ai-news", label: "AI News", Icon: Newspaper },
  { href: "/parametres", label: "Paramètres", Icon: Settings },
] as const;

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 flex items-center gap-1 px-3 py-2 bg-[var(--card)] border-b border-[var(--border)]">
      {/* Logo mark */}
      <span className="mr-3 text-[var(--primary)] font-semibold tracking-tight select-none font-[var(--font-geist-mono)] text-sm">
        FOLIO
      </span>

      <nav className="flex items-center gap-0.5">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={cn(
                "p-2 rounded-lg transition-colors",
                active
                  ? "bg-[var(--accent)] text-[var(--foreground)]"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)]"
              )}
            >
              <Icon size={16} strokeWidth={1.5} />
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
