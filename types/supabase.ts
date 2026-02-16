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
          subscription_id: string | null
          subscription_status: string | null
          subscription_last_updated: string | null
          ai_requests_count: number
        }
        Insert: {
          id: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          subscription_tier?: "free" | "pro" | "ultimate" | null
          subscription_id?: string | null
          subscription_status?: string | null
          subscription_last_updated?: string | null
          ai_requests_count?: number
        }
        Update: {
          id?: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          subscription_tier?: "free" | "pro" | "ultimate" | null
          subscription_id?: string | null
          subscription_status?: string | null
          subscription_last_updated?: string | null
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
      courses: {
        Row: {
          id: string
          created_at: string
          updated_at: string | null
          user_id: string
          title: string
          type: string | null
          style: string | null
          status: string | null
          layout: Json | null
          estimated_duration: number | null
          enhanced: boolean | null
          enhanced_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string | null
          user_id: string
          title: string
          type?: string | null
          style?: string | null
          status?: string | null
          layout?: Json | null
          estimated_duration?: number | null
          enhanced?: boolean | null
          enhanced_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string | null
          user_id?: string
          title?: string
          type?: string | null
          style?: string | null
          status?: string | null
          layout?: Json | null
          estimated_duration?: number | null
          enhanced?: boolean | null
          enhanced_at?: string | null
        }
      }
      course_analytics: {
        Row: {
          id: string
          timestamp: string
          course_id: string
          user_id: string
          event_type: string
          event_data: Json | null
        }
        Insert: {
          id?: string
          timestamp?: string
          course_id: string
          user_id: string
          event_type: string
          event_data?: Json | null
        }
        Update: {
          id?: string
          timestamp?: string
          course_id?: string
          user_id?: string
          event_type?: string
          event_data?: Json | null
        }
      }
      course_progress: {
        Row: {
          id: string
          updated_at: string
          user_id: string
          course_id: string
          slide_id: string | null
          completed: boolean
          time_spent: number | null
          last_position: number | null
          quiz_scores: Json | null
          notes: string | null
          bookmarks: string[] | null
        }
        Insert: {
          id?: string
          updated_at?: string
          user_id: string
          course_id: string
          slide_id?: string | null
          completed?: boolean
          time_spent?: number | null
          last_position?: number | null
          quiz_scores?: Json | null
          notes?: string | null
          bookmarks?: string[] | null
        }
        Update: {
          id?: string
          updated_at?: string
          user_id?: string
          course_id?: string
          slide_id?: string | null
          completed?: boolean
          time_spent?: number | null
          last_position?: number | null
          quiz_scores?: Json | null
          notes?: string | null
          bookmarks?: string[] | null
        }
      }
      course_questions: {
        Row: {
          id: string
          created_at: string
          course_id: string
          slide_id: string | null
          chapter_id: string | null
          question_type: string
          question: string
          options: string[] | null
          correct_answer: string
          explanation: string | null
          difficulty: string | null
          order_index: number
        }
        Insert: {
          id?: string
          created_at?: string
          course_id: string
          slide_id?: string | null
          chapter_id?: string | null
          question_type: string
          question: string
          options?: string[] | null
          correct_answer: string
          explanation?: string | null
          difficulty?: string | null
          order_index: number
        }
        Update: {
          id?: string
          created_at?: string
          course_id?: string
          slide_id?: string | null
          chapter_id?: string | null
          question_type?: string
          question?: string
          options?: string[] | null
          correct_answer?: string
          explanation?: string | null
          difficulty?: string | null
          order_index?: number
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
