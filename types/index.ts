// Re-export all types
export * from "./database";

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
