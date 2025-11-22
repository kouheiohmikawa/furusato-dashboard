/**
 * Supabase Database Types
 *
 * データベーススキーマに基づいた型定義
 * これらの型は、Supabaseクライアントとの型安全な通信を保証します。
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          prefecture: string | null;
          manual_limit: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          prefecture?: string | null;
          manual_limit?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          prefecture?: string | null;
          manual_limit?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      donations: {
        Row: {
          id: string;
          user_id: string;
          municipality_name: string | null;
          prefecture: string | null;
          municipality: string | null;
          amount: number;
          donation_date: string;
          donation_type: string | null;
          payment_method: string | null;
          portal_site: string | null;
          receipt_number: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          municipality_name?: string | null;
          prefecture?: string | null;
          municipality?: string | null;
          amount: number;
          donation_date: string;
          donation_type?: string | null;
          payment_method?: string | null;
          portal_site?: string | null;
          receipt_number?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          municipality_name?: string | null;
          prefecture?: string | null;
          municipality?: string | null;
          amount?: number;
          donation_date?: string;
          donation_type?: string | null;
          payment_method?: string | null;
          portal_site?: string | null;
          receipt_number?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      simulation_history: {
        Row: {
          id: string;
          user_id: string;
          simulation_type: 'simple' | 'detailed';
          input_data: Json;
          result_data: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          simulation_type: 'simple' | 'detailed';
          input_data: Json;
          result_data: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          simulation_type?: 'simple' | 'detailed';
          input_data?: Json;
          result_data?: Json;
          created_at?: string;
        };
      };
      municipalities: {
        Row: {
          id: string;
          name: string;
          prefecture: string;
          code: string | null;
          description: string | null;
          website_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          prefecture: string;
          code?: string | null;
          description?: string | null;
          website_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          prefecture?: string;
          code?: string | null;
          description?: string | null;
          website_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_authenticated: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      is_owner: {
        Args: {
          owner_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// ヘルパー型定義
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

// テーブルごとのエイリアス
export type Profile = Tables<'profiles'>;
export type Donation = Tables<'donations'>;
export type SimulationHistory = Tables<'simulation_history'>;
export type Municipality = Tables<'municipalities'>;

export type ProfileInsert = Inserts<'profiles'>;
export type DonationInsert = Inserts<'donations'>;
export type SimulationHistoryInsert = Inserts<'simulation_history'>;
export type MunicipalityInsert = Inserts<'municipalities'>;

export type ProfileUpdate = Updates<'profiles'>;
export type DonationUpdate = Updates<'donations'>;
export type SimulationHistoryUpdate = Updates<'simulation_history'>;
export type MunicipalityUpdate = Updates<'municipalities'>;
