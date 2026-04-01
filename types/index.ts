// Re-export all types
export * from "./database";

// ─── Database row aliases ────────────────────────────────────────────────────

export type Project = import("./database").Database["folio_app"]["Tables"]["projects"]["Row"];
export type ProjectPhase = import("./database").Database["folio_app"]["Tables"]["project_phases"]["Row"];
export type ProjectStep = import("./database").Database["folio_app"]["Tables"]["project_steps"]["Row"];
export type Client = import("./database").Database["folio_app"]["Tables"]["clients"]["Row"];
export type ClientContact = import("./database").Database["folio_app"]["Tables"]["client_contacts"]["Row"];

// ─── Composite / UI types ─────────────────────────────────────────────────────

export interface ProjectWithPhases {
  project: import("./database").Project;
  phases: PhaseWithSteps[];
}

export interface PhaseWithSteps {
  phase: import("./database").ProjectPhase;
  steps: import("./database").ProjectStep[];
}

export interface ClientWithContacts {
  client: import("./database").Client;
  contacts: import("./database").ClientContact[];
}

// Nav items
export interface NavItem {
  href: string;
  label: string;
  icon: string;
}
