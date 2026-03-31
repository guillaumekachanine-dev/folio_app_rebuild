export type Prospect = {
  id: string;
  company_name: string;
  sector: string | null;
  segment: string | null;
  location?: string | null;
  business_lines?: string | null;
  site_web?: string | null;
  headquarters_address?: string | null;
  revenue?: string | null;
  employee_count?: string | null;
  brand_color?: string | null;
  potential_score?: number | null;
  analysis_status?: string | null;
  analysis_data?: any | null;
  logo_url?: string | null;
  status?: string | null;
};

export type ProspectContact = {
  id: string;
  prospect_id: string;
  first_name: string;
  last_name: string;
  full_name?: string | null;
  company_name?: string | null;
  gender?: string | null;
  role?: string | null;
  job_title?: string | null;
  email?: string | null;
  phone?: string | null;
  linkedin_url?: string | null;
  notes?: string | null;
  last_activity?: string | null;
  activity_note?: string | null;
};

export type PhaseStatus = {
  phase: number;
  status: 'missing' | 'ready' | 'done' | 'running' | 'error';
  updated_at?: string | null;
};
