import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isToday, isTomorrow, isPast } from "date-fns";
import { fr } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, pattern = "d MMM yyyy") {
  return format(new Date(date), pattern, { locale: fr });
}

export function formatRelative(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr });
}

export function getDateLabel(date: string | Date): string {
  const d = new Date(date);
  if (isToday(d)) return "Aujourd'hui";
  if (isTomorrow(d)) return "Demain";
  if (isPast(d)) return "En retard";
  return formatDate(d);
}

export const STEP_STATUS = {
  backlog: { label: "Backlog", color: "text-zinc-500" },
  planifie: { label: "Planifié", color: "text-blue-400" },
  en_cours: { label: "En cours", color: "text-yellow-400" },
  en_validation: { label: "En validation", color: "text-purple-400" },
  termine: { label: "Terminé", color: "text-green-400" },
} as const;

export type StepStatus = keyof typeof STEP_STATUS;

export function getStepStatusLabel(status: StepStatus) {
  return STEP_STATUS[status]?.label ?? status;
}

export function getProgressPercent(steps: { status: StepStatus }[]): number {
  if (!steps.length) return 0;
  const done = steps.filter((s) => s.status === "termine").length;
  return Math.round((done / steps.length) * 100);
}
