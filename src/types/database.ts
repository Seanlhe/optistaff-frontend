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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      assignments: {
        Row: {
          assignment_id: string
          break_hours: number | null
          check_in_time: string | null
          check_out_time: string | null
          created_at: string
          shift_id: string
          status: string | null
          user_id: string
        }
        Insert: {
          assignment_id?: string
          break_hours?: number | null
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string
          shift_id: string
          status?: string | null
          user_id: string
        }
        Update: {
          assignment_id?: string
          break_hours?: number | null
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string
          shift_id?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["shift_id"]
          },
          {
            foreignKeyName: "assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "job_seekers"
            referencedColumns: ["user_id"]
          },
        ]
      }
      availability: {
        Row: {
          availability_id: string
          created_at: string
          end_time: string
          start_time: string
          submission_cycle: string | null
          user_id: string
        }
        Insert: {
          availability_id?: string
          created_at?: string
          end_time: string
          start_time: string
          submission_cycle?: string | null
          user_id: string
        }
        Update: {
          availability_id?: string
          created_at?: string
          end_time?: string
          start_time?: string
          submission_cycle?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "job_seekers"
            referencedColumns: ["user_id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          client_id: string
          company_name: string
          contact_email: string
          created_at: string
          first_name: string | null
          last_name: string | null
          office_number: string | null
          phone: string | null
          postal_code: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          client_id: string
          company_name: string
          contact_email: string
          created_at?: string
          first_name?: string | null
          last_name?: string | null
          office_number?: string | null
          phone?: string | null
          postal_code?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          client_id?: string
          company_name?: string
          contact_email?: string
          created_at?: string
          first_name?: string | null
          last_name?: string | null
          office_number?: string | null
          phone?: string | null
          postal_code?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          assignment_id: string
          comment: string | null
          created_at: string
          feedback_id: string
          rating_score: number
          review_type: string
          reviewee_id: string
          reviewer_id: string
        }
        Insert: {
          assignment_id: string
          comment?: string | null
          created_at?: string
          feedback_id?: string
          rating_score: number
          review_type: string
          reviewee_id: string
          reviewer_id: string
        }
        Update: {
          assignment_id?: string
          comment?: string | null
          created_at?: string
          feedback_id?: string
          rating_score?: number
          review_type?: string
          reviewee_id?: string
          reviewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["assignment_id"]
          },
        ]
      }
      job_seekers: {
        Row: {
          client_id_internal: string | null
          created_at: string
          date_of_birth: string | null
          first_name: string
          address_coordinates: string | null
          last_name: string
          phone_number: string | null
          postal_code: string | null
          rating: number | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          client_id_internal?: string | null
          created_at?: string
          date_of_birth?: string | null
          first_name: string
          address_coordinates?: string | null
          last_name: string
          phone_number?: string | null
          postal_code?: string | null
          rating?: number | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          client_id_internal?: string | null
          created_at?: string
          date_of_birth?: string | null
          first_name?: string
          address_coordinates?: string | null
          last_name?: string
          phone_number?: string | null
          postal_code?: string | null
          rating?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_seekers_client_id_internal_fkey"
            columns: ["client_id_internal"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["client_id"]
          },
        ]
      }
      payouts: {
        Row: {
          amount: number
          created_at: string
          end_period: string
          payout_id: string
          start_period: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          end_period: string
          payout_id?: string
          start_period: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          end_period?: string
          payout_id?: string
          start_period?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payouts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "job_seekers"
            referencedColumns: ["user_id"]
          },
        ]
      }
      preferences: {
        Row: {
          created_at: string
          desired_roles: Json | null
          max_travel_km: number | null
          min_pay_rate: number | null
          preference_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          desired_roles?: Json | null
          max_travel_km?: number | null
          min_pay_rate?: number | null
          preference_id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          desired_roles?: Json | null
          max_travel_km?: number | null
          min_pay_rate?: number | null
          preference_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "job_seekers"
            referencedColumns: ["user_id"]
          },
        ]
      }
      shifts: {
        Row: {
          break_duration: number | null
          client_id: string
          created_at: string
          description: string | null
          end_time: string
          job_location: string
          pay_rate: number
          shift_id: string
          staff_assigned: number | null
          staff_needed: number
          start_time: string
          status: number | null
          submission_cycle: string | null
          title: string
        }
        Insert: {
          break_duration?: number | null
          client_id: string
          created_at?: string
          description?: string | null
          end_time: string
          job_location: string
          pay_rate: number
          shift_id?: string
          staff_assigned?: number | null
          staff_needed: number
          start_time: string
          status?: number | null
          submission_cycle?: string | null
          title: string
        }
        Update: {
          break_duration?: number | null
          client_id?: string
          created_at?: string
          description?: string | null
          end_time?: string
          job_location?: string
          pay_rate?: number
          shift_id?: string
          staff_assigned?: number | null
          staff_needed?: number
          start_time?: string
          status?: number | null
          submission_cycle?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "shifts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["client_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_user_payout: {
        Args: {
          target_user_id: string
          period_start: string
          period_end: string
        }
        Returns: number
      }
      check_email_exists: {
        Args: { email_to_check: string }
        Returns: boolean
      }
      check_email_exists_comprehensive: {
        Args: { email_to_check: string }
        Returns: boolean
      }
      create_shift: {
        Args: {
          client_id: string
          title: string
          description: string
          start_time: string
          end_time: string
          pay_rate: number
          job_location: string
          staff_needed: number
          submission_cycle: string
          break_duration: number
        }
        Returns: string
      }
      get_earnings_breakdown: {
        Args: {
          target_user_id: string
          period_start: string
          period_end: string
        }
        Returns: {
          shift_id: string
          title: string
          work_date: string
          hours_worked: number
          pay_rate: number
          total_earned: number
        }[]
      }
      is_user_assigned_to_shift: {
        Args: { p_shift_id: string; p_user_id: string }
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
  public: {
    Enums: {},
  },
} as const

// Helper types for our application
export type JobSeeker = Tables<'job_seekers'>
export type Client = Tables<'clients'>
export type JobSeekerInsert = TablesInsert<'job_seekers'>
export type ClientInsert = TablesInsert<'clients'>
