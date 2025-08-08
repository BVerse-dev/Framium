export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      ai_tasks: {
        Row: {
          completed_at: string | null
          created_at: string | null
          description: string | null
          id: string
          model: string
          progress: number | null
          result: Json | null
          status: string | null
          steps: Json | null
          title: string
          tokens_used: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          model: string
          progress?: number | null
          result?: Json | null
          status?: string | null
          steps?: Json | null
          title: string
          tokens_used?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          model?: string
          progress?: number | null
          result?: Json | null
          status?: string | null
          steps?: Json | null
          title?: string
          tokens_used?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_rules: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          prompt: string
          category: string | null
          enabled: boolean | null
          priority: number | null
          conditions: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          prompt: string
          category?: string | null
          enabled?: boolean | null
          priority?: number | null
          conditions?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          prompt?: string
          category?: string | null
          enabled?: boolean | null
          priority?: number | null
          conditions?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_rules_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_templates: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          steps: Json
          category: string | null
          enabled: boolean | null
          is_public: boolean | null
          usage_count: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          steps: Json
          category?: string | null
          enabled?: boolean | null
          is_public?: boolean | null
          usage_count?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          steps?: Json
          category?: string | null
          enabled?: boolean | null
          is_public?: boolean | null
          usage_count?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_templates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      finetuning_projects: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          base_model: string
          status: string | null
          progress: number | null
          training_data: Json | null
          model_config: Json | null
          deployed_model_id: string | null
          training_started_at: string | null
          completed_at: string | null
          error_message: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          base_model: string
          status?: string | null
          progress?: number | null
          training_data?: Json | null
          model_config?: Json | null
          deployed_model_id?: string | null
          training_started_at?: string | null
          completed_at?: string | null
          error_message?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          base_model?: string
          status?: string | null
          progress?: number | null
          training_data?: Json | null
          model_config?: Json | null
          deployed_model_id?: string | null
          training_started_at?: string | null
          completed_at?: string | null
          error_message?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "finetuning_projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      rule_executions: {
        Row: {
          id: string
          user_id: string
          rule_id: string
          context: Json | null
          input_prompt: string | null
          output_result: string | null
          tokens_used: number | null
          execution_time_ms: number | null
          success: boolean | null
          error_message: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          rule_id: string
          context?: Json | null
          input_prompt?: string | null
          output_result?: string | null
          tokens_used?: number | null
          execution_time_ms?: number | null
          success?: boolean | null
          error_message?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          rule_id?: string
          context?: Json | null
          input_prompt?: string | null
          output_result?: string | null
          tokens_used?: number | null
          execution_time_ms?: number | null
          success?: boolean | null
          error_message?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rule_executions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rule_executions_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "custom_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_executions: {
        Row: {
          id: string
          user_id: string
          workflow_id: string
          status: string | null
          current_step: number | null
          step_results: Json | null
          total_tokens_used: number | null
          started_at: string | null
          completed_at: string | null
          error_message: string | null
        }
        Insert: {
          id?: string
          user_id: string
          workflow_id: string
          status?: string | null
          current_step?: number | null
          step_results?: Json | null
          total_tokens_used?: number | null
          started_at?: string | null
          completed_at?: string | null
          error_message?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          workflow_id?: string
          status?: string | null
          current_step?: number | null
          step_results?: Json | null
          total_tokens_used?: number | null
          started_at?: string | null
          completed_at?: string | null
          error_message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_executions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_executions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflow_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_prompts: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          id: string
          is_public: boolean | null
          title: string
          updated_at: string | null
          usage_count: number | null
          user_id: string
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          title: string
          updated_at?: string | null
          usage_count?: number | null
          user_id: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          title?: string
          updated_at?: string | null
          usage_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_prompts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_prompts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan: string
          status: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan: string
          status?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: string
          status?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      token_usage: {
        Row: {
          cost_usd: number | null
          created_at: string | null
          id: string
          model: string
          request_type: string | null
          tokens_used: number
          user_id: string
        }
        Insert: {
          cost_usd?: number | null
          created_at?: string | null
          id?: string
          model: string
          request_type?: string | null
          tokens_used?: number
          user_id: string
        }
        Update: {
          cost_usd?: number | null
          created_at?: string | null
          id?: string
          model?: string
          request_type?: string | null
          tokens_used?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "token_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "token_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_api_keys: {
        Row: {
          created_at: string | null
          encrypted_key: string
          id: string
          is_active: boolean | null
          provider: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          encrypted_key: string
          id?: string
          is_active?: boolean | null
          provider: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          encrypted_key?: string
          id?: string
          is_active?: boolean | null
          provider?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_api_keys_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_api_keys_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          auto_save_enabled: boolean | null
          code_style: string | null
          created_at: string | null
          default_mode: string | null
          default_model: string | null
          id: string
          notifications_enabled: boolean | null
          theme: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_save_enabled?: boolean | null
          code_style?: string | null
          created_at?: string | null
          default_mode?: string | null
          default_model?: string | null
          id?: string
          notifications_enabled?: boolean | null
          theme?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_save_enabled?: boolean | null
          code_style?: string | null
          created_at?: string | null
          default_mode?: string | null
          default_model?: string | null
          id?: string
          notifications_enabled?: boolean | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          id: string
          name: string
          plan: string | null
          stripe_customer_id: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          id?: string
          name: string
          plan?: string | null
          stripe_customer_id?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          plan?: string | null
          stripe_customer_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      user_stats: {
        Row: {
          completed_tasks: number | null
          email: string | null
          id: string | null
          name: string | null
          plan: string | null
          saved_prompts_count: number | null
          total_cost: number | null
          total_tasks: number | null
          total_tokens_used: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      can_user_make_request: {
        Args: { user_uuid: string; requested_tokens: number }
        Returns: boolean
      }
      get_plan_features: {
        Args: { plan_name: string }
        Returns: Json
      }
      get_user_monthly_usage: {
        Args: { user_uuid: string }
        Returns: {
          total_tokens: number
          total_cost: number
          current_plan: string
        }[]
      }
      log_token_usage: {
        Args: {
          user_uuid: string
          model_name: string
          tokens: number
          cost: number
          request_type_param?: string
        }
        Returns: string
      }
      update_user_plan: {
        Args: { user_uuid: string; new_plan: string; stripe_sub_id?: string }
        Returns: boolean
      }
      get_active_rules_for_context: {
        Args: {
          user_uuid: string
          context_data?: Json
        }
        Returns: {
          id: string
          name: string
          prompt: string
          category: string
          priority: number
          conditions: Json
        }[]
      }
      log_rule_execution: {
        Args: {
          user_uuid: string
          rule_uuid: string
          context_data: Json
          input_text: string
          output_text: string
          tokens?: number
          execution_ms?: number
          is_success?: boolean
          error_text?: string
        }
        Returns: string
      }
      increment_workflow_usage: {
        Args: { workflow_uuid: string }
        Returns: boolean
      }
      can_user_create_finetuning: {
        Args: { user_uuid: string }
        Returns: boolean
      }
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
