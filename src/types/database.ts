/**
 * Database Types
 * @description TypeScript types for Supabase database schema
 */

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          first_name: string | null;
          last_name: string | null;
          phone: string | null;
          role: 'jobseeker' | 'employer';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          role: 'jobseeker' | 'employer';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          role?: 'jobseeker' | 'employer';
          created_at?: string;
          updated_at?: string;
        };
      };
      job_seekers: {
        Row: {
          id: string;
          user_id: string;
          skills: string[];
          experience_years: number;
          desired_pay_rate: number;
          max_travel_distance: number;
          rating: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          skills?: string[];
          experience_years?: number;
          desired_pay_rate?: number;
          max_travel_distance?: number;
          rating?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          skills?: string[];
          experience_years?: number;
          desired_pay_rate?: number;
          max_travel_distance?: number;
          rating?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      employers: {
        Row: {
          id: string;
          user_id: string;
          company_name: string;
          company_description: string | null;
          industry: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          company_name: string;
          company_description?: string | null;
          industry?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          company_name?: string;
          company_description?: string | null;
          industry?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      shifts: {
        Row: {
          id: string;
          employer_id: string;
          title: string;
          description: string;
          required_skills: string[];
          pay_rate: number;
          location_lat: number;
          location_lng: number;
          start_time: string;
          end_time: string;
          date: string;
          status: 'available' | 'assigned' | 'completed';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          employer_id: string;
          title: string;
          description: string;
          required_skills?: string[];
          pay_rate: number;
          location_lat: number;
          location_lng: number;
          start_time: string;
          end_time: string;
          date: string;
          status?: 'available' | 'assigned' | 'completed';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          employer_id?: string;
          title?: string;
          description?: string;
          required_skills?: string[];
          pay_rate?: number;
          location_lat?: number;
          location_lng?: number;
          start_time?: string;
          end_time?: string;
          date?: string;
          status?: 'available' | 'assigned' | 'completed';
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: 'jobseeker' | 'employer';
      shift_status: 'available' | 'assigned' | 'completed';
    };
  };
}
