export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  folio_app: {
    Tables: {
      activity_events: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          metadata: Json | null
          summary: string | null
          type: string
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          metadata?: Json | null
          summary?: string | null
          type: string
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          metadata?: Json | null
          summary?: string | null
          type?: string
        }
        Relationships: []
      }
      ai_news_articles: {
        Row: {
          article_url: string | null
          category: string
          digest_id: string | null
          featured_image_url: string | null
          id: string
          ingested_at: string
          published_at: string | null
          rank: number | null
          selection_date: string | null
          source: string | null
          source_name: string | null
          source_url: string | null
          summary: string
          title: string
          updated_at: string | null
          url: string | null
        }
        Insert: {
          article_url?: string | null
          category: string
          digest_id?: string | null
          featured_image_url?: string | null
          id?: string
          ingested_at?: string
          published_at?: string | null
          rank?: number | null
          selection_date?: string | null
          source?: string | null
          source_name?: string | null
          source_url?: string | null
          summary: string
          title: string
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          article_url?: string | null
          category?: string
          digest_id?: string | null
          featured_image_url?: string | null
          id?: string
          ingested_at?: string
          published_at?: string | null
          rank?: number | null
          selection_date?: string | null
          source?: string | null
          source_name?: string | null
          source_url?: string | null
          summary?: string
          title?: string
          updated_at?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_news_articles_digest_id_fkey"
            columns: ["digest_id"]
            isOneToOne: false
            referencedRelation: "ai_news_digests"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_news_digests: {
        Row: {
          article_count: number
          category: string
          content: string
          created_at: string
          date: string
          id: string
          key_insights: string[] | null
          summary: string | null
          updated_at: string | null
        }
        Insert: {
          article_count?: number
          category: string
          content: string
          created_at?: string
          date: string
          id?: string
          key_insights?: string[] | null
          summary?: string | null
          updated_at?: string | null
        }
        Update: {
          article_count?: number
          category?: string
          content?: string
          created_at?: string
          date?: string
          id?: string
          key_insights?: string[] | null
          summary?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      budget_categories: {
        Row: {
          color: string | null
          created_at: string
          icon: string | null
          id: string
          name: string
          type: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          type: string
        }
        Update: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          type?: string
        }
        Relationships: []
      }
      budget_transactions: {
        Row: {
          amount: number
          category_id: string | null
          created_at: string
          date: string
          id: string
          is_recurring: boolean
          label: string
          notes: string | null
          recurrence_interval: string | null
          type: string
          updated_at: string
        }
        Insert: {
          amount: number
          category_id?: string | null
          created_at?: string
          date: string
          id?: string
          is_recurring?: boolean
          label: string
          notes?: string | null
          recurrence_interval?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          category_id?: string | null
          created_at?: string
          date?: string
          id?: string
          is_recurring?: boolean
          label?: string
          notes?: string | null
          recurrence_interval?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "budget_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      client_contacts: {
        Row: {
          client_id: string
          created_at: string
          email: string | null
          first_name: string
          id: string
          last_name: string
          linkedin_url: string | null
          notes: string | null
          phone: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          email?: string | null
          first_name: string
          id?: string
          last_name: string
          linkedin_url?: string | null
          notes?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          linkedin_url?: string | null
          notes?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_contacts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          ai_analysis: Json | null
          ai_sector_analysis: Json | null
          analysis_data: Json | null
          analysis_status: string | null
          brand_color: string | null
          business_lines: string | null
          created_at: string
          employee_count: number | null
          hq: string | null
          id: string
          last_contacted_at: string | null
          logo_url: string | null
          name: string
          notes: string | null
          potential_score: number | null
          revenue: number | null
          sector: string | null
          segment: string | null
          status: string
          updated_at: string
          website: string | null
        }
        Insert: {
          ai_analysis?: Json | null
          ai_sector_analysis?: Json | null
          analysis_data?: Json | null
          analysis_status?: string | null
          brand_color?: string | null
          business_lines?: string | null
          created_at?: string
          employee_count?: number | null
          hq?: string | null
          id?: string
          last_contacted_at?: string | null
          logo_url?: string | null
          name: string
          notes?: string | null
          potential_score?: number | null
          revenue?: number | null
          sector?: string | null
          segment?: string | null
          status?: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          ai_analysis?: Json | null
          ai_sector_analysis?: Json | null
          analysis_data?: Json | null
          analysis_status?: string | null
          brand_color?: string | null
          business_lines?: string | null
          created_at?: string
          employee_count?: number | null
          hq?: string | null
          id?: string
          last_contacted_at?: string | null
          logo_url?: string | null
          name?: string
          notes?: string | null
          potential_score?: number | null
          revenue?: number | null
          sector?: string | null
          segment?: string | null
          status?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      contact_activities: {
        Row: {
          client_id: string
          contact_id: string
          created_at: string
          date: string
          id: string
          summary: string
          type: string
        }
        Insert: {
          client_id: string
          contact_id: string
          created_at?: string
          date: string
          id?: string
          summary: string
          type: string
        }
        Update: {
          client_id?: string
          contact_id?: string
          created_at?: string
          date?: string
          id?: string
          summary?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_activities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_activities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "client_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      formations: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          name: string
          notes: string | null
          provider: string | null
          start_date: string | null
          status: string
          updated_at: string
          url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          notes?: string | null
          provider?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          notes?: string | null
          provider?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      formations_documents: {
        Row: {
          created_at: string
          formation_id: string
          id: string
          name: string
          type: string
          url: string
        }
        Insert: {
          created_at?: string
          formation_id: string
          id?: string
          name: string
          type?: string
          url: string
        }
        Update: {
          created_at?: string
          formation_id?: string
          id?: string
          name?: string
          type?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "formations_documents_formation_id_fkey"
            columns: ["formation_id"]
            isOneToOne: false
            referencedRelation: "formations"
            referencedColumns: ["id"]
          },
        ]
      }
      item_customizations: {
        Row: {
          color: string | null
          cover_image_url: string | null
          entity_id: string
          entity_type: string
          icon: string | null
          id: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          cover_image_url?: string | null
          entity_id: string
          entity_type: string
          icon?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          cover_image_url?: string | null
          entity_id?: string
          entity_type?: string
          icon?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      planning_schedule: {
        Row: {
          all_day: boolean
          category: string
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          source_id: string | null
          source_type: string | null
          start_date: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          all_day?: boolean
          category?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          source_id?: string | null
          source_type?: string | null
          start_date: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          all_day?: boolean
          category?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          source_id?: string | null
          source_type?: string | null
          start_date?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_documents: {
        Row: {
          created_at: string
          id: string
          name: string
          project_id: string
          step_id: string | null
          type: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          project_id: string
          step_id?: string | null
          type?: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          project_id?: string
          step_id?: string | null
          type?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_documents_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "project_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      project_phases: {
        Row: {
          created_at: string
          id: string
          name: string
          order_index: number
          project_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          order_index?: number
          project_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          order_index?: number
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_phases_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_steps: {
        Row: {
          charge_hours: number | null
          created_at: string
          deadline: string | null
          deliverables: string | null
          description: string | null
          id: string
          is_sub_project: boolean
          name: string
          order_index: number
          phase_id: string
          priority: number
          project_id: string
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          charge_hours?: number | null
          created_at?: string
          deadline?: string | null
          deliverables?: string | null
          description?: string | null
          id?: string
          is_sub_project?: boolean
          name: string
          order_index?: number
          phase_id: string
          priority?: number
          project_id: string
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          charge_hours?: number | null
          created_at?: string
          deadline?: string | null
          deliverables?: string | null
          description?: string | null
          id?: string
          is_sub_project?: boolean
          name?: string
          order_index?: number
          phase_id?: string
          priority?: number
          project_id?: string
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_steps_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "project_phases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_steps_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          activities: string | null
          charge_hours: number | null
          client_id: string | null
          color: string | null
          context: string | null
          cover_image_url: string | null
          created_at: string
          deadline: string | null
          deliverables: string | null
          description: string | null
          id: string
          is_active: boolean
          kpis: Json | null
          means: string | null
          name: string
          objective: string | null
          priority: number | null
          type: string
          updated_at: string
        }
        Insert: {
          activities?: string | null
          charge_hours?: number | null
          client_id?: string | null
          color?: string | null
          context?: string | null
          cover_image_url?: string | null
          created_at?: string
          deadline?: string | null
          deliverables?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          kpis?: Json | null
          means?: string | null
          name: string
          objective?: string | null
          priority?: number | null
          type: string
          updated_at?: string
        }
        Update: {
          activities?: string | null
          charge_hours?: number | null
          client_id?: string | null
          color?: string | null
          context?: string | null
          cover_image_url?: string | null
          created_at?: string
          deadline?: string | null
          deliverables?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          kpis?: Json | null
          means?: string | null
          name?: string
          objective?: string | null
          priority?: number | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      prospect_missions: {
        Row: {
          client_id: string
          created_at: string
          id: string
          mission_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          mission_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          mission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prospect_missions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      prospect_phase_results: {
        Row: {
          client_id: string
          created_at: string
          id: string
          phase: number
          result: Json | null
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          phase: number
          result?: Json | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          phase?: number
          result?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prospect_phase_results_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      sub_project_steps: {
        Row: {
          charge_hours: number | null
          created_at: string
          deadline: string | null
          deliverables: string | null
          id: string
          name: string
          notes: string | null
          order_index: number
          priority: number
          start_date: string | null
          status: string
          sub_project_id: string
          updated_at: string
        }
        Insert: {
          charge_hours?: number | null
          created_at?: string
          deadline?: string | null
          deliverables?: string | null
          id?: string
          name: string
          notes?: string | null
          order_index?: number
          priority?: number
          start_date?: string | null
          status?: string
          sub_project_id: string
          updated_at?: string
        }
        Update: {
          charge_hours?: number | null
          created_at?: string
          deadline?: string | null
          deliverables?: string | null
          id?: string
          name?: string
          notes?: string | null
          order_index?: number
          priority?: number
          start_date?: string | null
          status?: string
          sub_project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sub_project_steps_sub_project_id_fkey"
            columns: ["sub_project_id"]
            isOneToOne: false
            referencedRelation: "sub_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      sub_projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          parent_step_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          parent_step_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          parent_step_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sub_projects_parent_step_id_fkey"
            columns: ["parent_step_id"]
            isOneToOne: false
            referencedRelation: "project_steps"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  folio_app: {
    Enums: {},
  },
} as const

