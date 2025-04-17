export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          updated_at: string | null
          username: string | null
          full_name: string | null
          avatar_url: string | null
          subscription_tier: "free" | "pro" | "ultimate" | null
          ai_requests_count: number
        }
        Insert: {
          id: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          subscription_tier?: "free" | "pro" | "ultimate" | null
          ai_requests_count?: number
        }
        Update: {
          id?: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          subscription_tier?: "free" | "pro" | "ultimate" | null
          ai_requests_count?: number
        }
      }
      assignments: {
        Row: {
          id: string
          created_at: string
          user_id: string
          title: string
          description: string | null
          due_date: string | null
          subject: string | null
          priority: "low" | "medium" | "high" | null
          status: "ongoing" | "completed" | null
          ai_summary: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          title: string
          description?: string | null
          due_date?: string | null
          subject?: string | null
          priority?: "low" | "medium" | "high" | null
          status?: "ongoing" | "completed" | null
          ai_summary?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          title?: string
          description?: string | null
          due_date?: string | null
          subject?: string | null
          priority?: "low" | "medium" | "high" | null
          status?: "ongoing" | "completed" | null
          ai_summary?: string | null
        }
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
  }
}
