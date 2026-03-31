"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutGrid,
  BriefcaseBusiness,
  Target,
  GraduationCap,
  Wallet,
  Sparkles,
  SlidersHorizontal,
  CalendarDays,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard",   label: "Dashboard",   Icon: LayoutGrid },
  { href: "/projets",     label: "Projets",      Icon: BriefcaseBusiness },
  { href: "/prospection", label: "Prospection",  Icon: Target },
  { href: "/planning",    label: "Planning",     Icon: CalendarDays },
  { href: "/budget",      label: "Budget",       Icon: Wallet },
  { href: "/ai-news",     label: "AI News",      Icon: Sparkles },
  { href: "/parametres",  label: "Paramètres",   Icon: SlidersHorizontal },
] as const;

// Per-page accent color for the active pill
const PAGE_COLORS: Record<string, string> = {
  "/dashboard":   "#FF6B35",   // vibrant orange
  "/projets":     "#FF9500",   // orange
  "/prospection": "#0052CC",   // blue
  "/planning":    "#0052CC",   // blue
  "/budget":      "#FFD60A",   // yellow
  "/ai-news":     "#003A7D",   // dark blue
  "/parametres":  "#00B4D8",   // cyan
};

export function Header() {
  const pathname = usePathname();
  const currentRoot = "/" + pathname.split("/")[1];

  return (
    <header className="relative z-20 w-full border-b border-white/5" style={{ background: 'linear-gradient(90deg, #1a1f3a 0%, #2d1b4e 50%, #1a1f3a 100%)', backdropFilter: 'blur(12px)' }}>
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-3 px-8">
        {/* Nav */}
        <nav className="flex items-center gap-6" style={{ marginLeft: '32px' }}>
          {NAV_ITEMS.map(({ href, label, Icon }) => {
            const active = currentRoot === href;
            const color = PAGE_COLORS[href] ?? "#fff";

            return (
              <Link
                key={href}
                href={href}
                title={label}
                className={cn(
                  "flex items-center gap-2 transition-all duration-200",
                  active
                    ? "rounded-2xl px-3.5 py-2 font-semibold text-white shadow-sm"
                    : "rounded-2xl p-2.5 text-white/55 hover:bg-white/12 hover:text-white"
                )}
                style={active ? { backgroundColor: color } : {}}
              >
                <Icon size={17} strokeWidth={1.6} className="flex-shrink-0" />
                {active && (
                  <span className="whitespace-nowrap text-sm leading-none">
                    {label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
