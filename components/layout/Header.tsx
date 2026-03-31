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
  { href: "/dashboard",   label: "Dashboard",   Icon: LayoutDashboard },
  { href: "/projets",     label: "Projets",      Icon: FolderKanban },
  { href: "/prospection", label: "Prospection",  Icon: Users },
  { href: "/planning",    label: "Planning",     Icon: CalendarDays },
  { href: "/budget",      label: "Budget",       Icon: Wallet },
  { href: "/ai-news",     label: "AI News",      Icon: Newspaper },
  { href: "/parametres",  label: "Paramètres",   Icon: Settings },
] as const;

export function Header() {
  const pathname = usePathname();

  return (
    <header className="relative z-20 flex items-center gap-1 px-4 py-2">
      <span className="mr-4 text-white font-bold tracking-[0.2em] select-none font-[var(--font-geist-mono)] text-sm drop-shadow-sm">
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
                "p-2 rounded-xl transition-all duration-150",
                active
                  ? "bg-white/25 text-white shadow-sm"
                  : "text-white/60 hover:text-white hover:bg-white/15"
              )}
            >
              <Icon size={16} strokeWidth={active ? 2 : 1.75} />
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
