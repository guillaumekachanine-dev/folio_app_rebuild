// Auto-generated types for Supabase schema: folio_app
// Run `supabase gen types typescript` to regenerate after migrations

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type StepStatus = "backlog" | "planifie" | "en_cours" | "en_validation" | "termine";
export type ProjectType = "perso" | "pro" | "formation";
export type BudgetTransactionType = "income" | "expense";
export type PlanningMode = "kanban" | "gantt" | "liste";
export type AiNewsCategory = "business" | "llm" | "frontier" | "youtube";

// ─── Projects ────────────────────────────────────────────────────────────────

export interface Project {
  id: string;
  name: string;
  type: ProjectType;
  description: string | null;
  objective: string | null;
  context: string | null;
  means: string | null;
  activities: string | null;
  client_id: string | null;
  cover_image_url: string | null;
  is_active: boolean;
  kpis: Json | null;
  color: string | null;
  charge_hours: number | null;
  priority: number;
  deadline: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectPhase {
  id: string;
  project_id: string;
  name: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectStep {
  id: string;
  phase_id: string;
  project_id: string;
  name: string;
  order_index: number;
  status: StepStatus;
  start_date: string | null;
  deadline: string | null;
  charge_hours: number | null;
  priority: number; // 1-5
  deliverables: string | null;
  notes: string | null;
  is_sub_project: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubProject {
  id: string;
  parent_step_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubProjectStep {
  id: string;
  sub_project_id: string;
  name: string;
  order_index: number;
  status: StepStatus;
  start_date: string | null;
  deadline: string | null;
  charge_hours: number | null;
  priority: number;
  deliverables: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectDocument {
  id: string;
  project_id: string;
  step_id: string | null;
  name: string;
  url: string;
  type: "upload" | "link";
  created_at: string;
}

// ─── Prospection ─────────────────────────────────────────────────────────────

export interface Client {
  id: string;
  name: string;
  sector: string | null;
  segment: string | null;
  logo_url: string | null;
  website: string | null;
  status: "prospect" | "contact" | "proposal" | "won" | "lost" | "inactive";
  notes: string | null;
  business_lines: string | null;
  hq: string | null;
  revenue: number | null;
  employee_count: number | null;
  brand_color: string | null;
  potential_score: number | null;
  analysis_status: string | null;
  analysis_data: Json | null;
  ai_analysis: Json | null;
  ai_sector_analysis: Json | null;
  last_contacted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientContact {
  id: string;
  client_id: string;
  first_name: string;
  last_name: string;
  role: string | null;
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContactActivity {
  id: string;
  contact_id: string;
  client_id: string;
  type: "call" | "email" | "meeting" | "note" | "proposal";
  summary: string;
  date: string;
  created_at: string;
}

export interface ProspectPhaseResult {
  id: string;
  client_id: string;
  phase: number;
  result: Json | null;
  created_at: string;
  updated_at: string;
}

export interface ProspectMission {
  id: string;
  client_id: string;
  mission_id: string;
  created_at: string;
}

// ─── Budget ───────────────────────────────────────────────────────────────────

export interface BudgetCategory {
  id: string;
  name: string;
  type: BudgetTransactionType;
  color: string | null;
  icon: string | null;
  created_at: string;
}

export interface BudgetTransaction {
  id: string;
  category_id: string | null;
  label: string;
  amount: number;
  type: BudgetTransactionType;
  date: string;
  is_recurring: boolean;
  recurrence_interval: "weekly" | "monthly" | "yearly" | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Planning ─────────────────────────────────────────────────────────────────

export interface PlanningSchedule {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  all_day: boolean;
  category: "projet" | "formation" | "perso" | "pro";
  source_type: "step" | "formation" | "manual";
  source_id: string | null;
  status: StepStatus;
  created_at: string;
  updated_at: string;
}

// ─── Formations ───────────────────────────────────────────────────────────────

export interface Formation {
  id: string;
  name: string;
  description: string | null;
  provider: string | null;
  start_date: string | null;
  end_date: string | null;
  status: StepStatus;
  url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface FormationDocument {
  id: string;
  formation_id: string;
  name: string;
  url: string;
  type: "upload" | "link";
  created_at: string;
}

// ─── AI News ──────────────────────────────────────────────────────────────────

export interface AiNewsArticle {
  id: string;
  title: string;
  url: string | null;
  summary: string;
  category: AiNewsCategory;
  source: string | null;
  published_at: string | null;
  ingested_at: string;
  digest_id: string | null;
}

export interface AiNewsDigest {
  id: string;
  date: string;
  category: AiNewsCategory;
  content: string;
  article_count: number;
  created_at: string;
}

// ─── Misc ─────────────────────────────────────────────────────────────────────

export interface ActivityEvent {
  id: string;
  type: string;
  entity_type: string;
  entity_id: string;
  summary: string | null;
  metadata: Json | null;
  created_at: string;
}

export interface ItemCustomization {
  id: string;
  entity_type: string;
  entity_id: string;
  cover_image_url: string | null;
  color: string | null;
  icon: string | null;
  updated_at: string;
}
