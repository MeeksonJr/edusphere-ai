export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          category: string
          created_at: string | null
          description: string
          icon: string
          id: string
          name: string
          rarity: string
          requirement_type: string
          requirement_value: number
          xp_reward: number
        }
        Insert: {
          category: string
          created_at?: string | null
          description: string
          icon?: string
          id?: string
          name: string
          rarity?: string
          requirement_type: string
          requirement_value?: number
          xp_reward?: number
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          icon?: string
          id?: string
          name?: string
          rarity?: string
          requirement_type?: string
          requirement_value?: number
          xp_reward?: number
        }
        Relationships: []
      }
      ai_chats: {
        Row: {
          created_at: string | null
          id: string
          messages: Json
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          messages?: Json
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          messages?: Json
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          created_at: string | null
          id: string
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          revoked: boolean | null
          scopes: string[] | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name?: string
          revoked?: boolean | null
          scopes?: string[] | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          revoked?: boolean | null
          scopes?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      api_usage_logs: {
        Row: {
          api_key_id: string
          created_at: string | null
          endpoint: string
          id: string
          latency_ms: number | null
          method: string
          status_code: number | null
        }
        Insert: {
          api_key_id: string
          created_at?: string | null
          endpoint: string
          id?: string
          latency_ms?: number | null
          method?: string
          status_code?: number | null
        }
        Update: {
          api_key_id?: string
          created_at?: string | null
          endpoint?: string
          id?: string
          latency_ms?: number | null
          method?: string
          status_code?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "api_usage_logs_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      assignment_submissions: {
        Row: {
          assignment_id: string
          content: string | null
          created_at: string | null
          feedback: string | null
          files: Json | null
          grade: number | null
          graded_at: string | null
          id: string
          rubric_scores: Json | null
          user_id: string
        }
        Insert: {
          assignment_id: string
          content?: string | null
          created_at?: string | null
          feedback?: string | null
          files?: Json | null
          grade?: number | null
          graded_at?: string | null
          id?: string
          rubric_scores?: Json | null
          user_id: string
        }
        Update: {
          assignment_id?: string
          content?: string | null
          created_at?: string | null
          feedback?: string | null
          files?: Json | null
          grade?: number | null
          graded_at?: string | null
          id?: string
          rubric_scores?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignment_submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          ai_summary: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          grading_criteria: string | null
          id: string
          max_points: number | null
          priority: string | null
          rubric: Json | null
          status: string | null
          subject: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_summary?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          grading_criteria?: string | null
          id?: string
          max_points?: number | null
          priority?: string | null
          rubric?: Json | null
          status?: string | null
          subject?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_summary?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          grading_criteria?: string | null
          id?: string
          max_points?: number | null
          priority?: string | null
          rubric?: Json | null
          status?: string | null
          subject?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          all_day: boolean | null
          color: string | null
          created_at: string | null
          description: string | null
          end_time: string
          external_id: string | null
          id: string
          location: string | null
          source: string | null
          start_time: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          all_day?: boolean | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          end_time: string
          external_id?: string | null
          id?: string
          location?: string | null
          source?: string | null
          start_time: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          all_day?: boolean | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          end_time?: string
          external_id?: string | null
          id?: string
          location?: string | null
          source?: string | null
          start_time?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      calendar_feeds: {
        Row: {
          created_at: string | null
          id: string
          last_synced_at: string | null
          name: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_synced_at?: string | null
          name?: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_synced_at?: string | null
          name?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      calendar_integrations: {
        Row: {
          access_token: string | null
          created_at: string | null
          google_calendar_id: string | null
          id: string
          last_synced_at: string | null
          provider: string
          refresh_token: string | null
          sync_enabled: boolean | null
          sync_token: string | null
          token_expires_at: string | null
          user_id: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string | null
          google_calendar_id?: string | null
          id?: string
          last_synced_at?: string | null
          provider?: string
          refresh_token?: string | null
          sync_enabled?: boolean | null
          sync_token?: string | null
          token_expires_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string | null
          created_at?: string | null
          google_calendar_id?: string | null
          id?: string
          last_synced_at?: string | null
          provider?: string
          refresh_token?: string | null
          sync_enabled?: boolean | null
          sync_token?: string | null
          token_expires_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      certificates: {
        Row: {
          certificate_number: string
          course_id: string | null
          created_at: string | null
          description: string | null
          id: string
          issued_at: string | null
          metadata: Json | null
          pdf_url: string | null
          share_token: string | null
          skill_id: string | null
          template_id: string | null
          title: string
          user_id: string
          verified: boolean | null
        }
        Insert: {
          certificate_number: string
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          issued_at?: string | null
          metadata?: Json | null
          pdf_url?: string | null
          share_token?: string | null
          skill_id?: string | null
          template_id?: string | null
          title: string
          user_id: string
          verified?: boolean | null
        }
        Update: {
          certificate_number?: string
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          issued_at?: string | null
          metadata?: Json | null
          pdf_url?: string | null
          share_token?: string | null
          skill_id?: string | null
          template_id?: string | null
          title?: string
          user_id?: string
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      child_progress: {
        Row: {
          activity: string | null
          child_id: string
          created_at: string | null
          date: string | null
          id: string
          score: number | null
          subject: string
          time_spent_minutes: number | null
        }
        Insert: {
          activity?: string | null
          child_id: string
          created_at?: string | null
          date?: string | null
          id?: string
          score?: number | null
          subject: string
          time_spent_minutes?: number | null
        }
        Update: {
          activity?: string | null
          child_id?: string
          created_at?: string | null
          date?: string | null
          id?: string
          score?: number | null
          subject?: string
          time_spent_minutes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "child_progress_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_children"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          status: string | null
          subject: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          status?: string | null
          subject: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string | null
          subject?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      course_analytics: {
        Row: {
          course_id: string
          event_data: Json | null
          event_type: string
          id: string
          timestamp: string | null
          user_id: string
        }
        Insert: {
          course_id: string
          event_data?: Json | null
          event_type: string
          id?: string
          timestamp?: string | null
          user_id: string
        }
        Update: {
          course_id?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          timestamp?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_analytics_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_enrollments: {
        Row: {
          amount_paid_cents: number | null
          completed_at: string | null
          enrolled_at: string | null
          id: string
          listing_id: string
          payment_id: string | null
          progress_pct: number | null
          user_id: string
        }
        Insert: {
          amount_paid_cents?: number | null
          completed_at?: string | null
          enrolled_at?: string | null
          id?: string
          listing_id: string
          payment_id?: string | null
          progress_pct?: number | null
          user_id: string
        }
        Update: {
          amount_paid_cents?: number | null
          completed_at?: string | null
          enrolled_at?: string | null
          id?: string
          listing_id?: string
          payment_id?: string | null
          progress_pct?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      course_progress: {
        Row: {
          bookmarks: Json | null
          completed: boolean | null
          course_id: string
          created_at: string | null
          id: string
          last_position: number | null
          notes: string | null
          quiz_scores: Json | null
          slide_id: string | null
          time_spent: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bookmarks?: Json | null
          completed?: boolean | null
          course_id: string
          created_at?: string | null
          id?: string
          last_position?: number | null
          notes?: string | null
          quiz_scores?: Json | null
          slide_id?: string | null
          time_spent?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bookmarks?: Json | null
          completed?: boolean | null
          course_id?: string
          created_at?: string | null
          id?: string
          last_position?: number | null
          notes?: string | null
          quiz_scores?: Json | null
          slide_id?: string | null
          time_spent?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_questions: {
        Row: {
          chapter_id: string | null
          correct_answer: string
          course_id: string
          created_at: string | null
          difficulty: string | null
          explanation: string | null
          id: string
          options: Json | null
          order_index: number | null
          question: string
          question_type: string
          slide_id: string | null
          updated_at: string | null
        }
        Insert: {
          chapter_id?: string | null
          correct_answer: string
          course_id: string
          created_at?: string | null
          difficulty?: string | null
          explanation?: string | null
          id?: string
          options?: Json | null
          order_index?: number | null
          question: string
          question_type: string
          slide_id?: string | null
          updated_at?: string | null
        }
        Update: {
          chapter_id?: string | null
          correct_answer?: string
          course_id?: string
          created_at?: string | null
          difficulty?: string | null
          explanation?: string | null
          id?: string
          options?: Json | null
          order_index?: number | null
          question?: string
          question_type?: string
          slide_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_questions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_resources: {
        Row: {
          course_id: string
          created_at: string | null
          description: string | null
          id: string
          order_index: number | null
          resource_type: string
          slide_id: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          url: string | null
        }
        Insert: {
          course_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          order_index?: number | null
          resource_type: string
          slide_id?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          order_index?: number | null
          resource_type?: string
          slide_id?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_resources_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_reviews: {
        Row: {
          created_at: string | null
          helpful_count: number | null
          id: string
          listing_id: string
          rating: number
          review_text: string | null
          reviewer_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          listing_id: string
          rating: number
          review_text?: string | null
          reviewer_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          listing_id?: string
          rating?: number
          review_text?: string | null
          reviewer_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_reviews_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      course_slides: {
        Row: {
          audio_duration: number | null
          audio_url: string | null
          caption_data: Json | null
          chapter_id: string | null
          content: Json
          course_id: string
          created_at: string | null
          id: string
          order_index: number | null
          slide_id: string | null
          slide_type: string
          template_data: Json | null
          updated_at: string | null
        }
        Insert: {
          audio_duration?: number | null
          audio_url?: string | null
          caption_data?: Json | null
          chapter_id?: string | null
          content?: Json
          course_id: string
          created_at?: string | null
          id?: string
          order_index?: number | null
          slide_id?: string | null
          slide_type: string
          template_data?: Json | null
          updated_at?: string | null
        }
        Update: {
          audio_duration?: number | null
          audio_url?: string | null
          caption_data?: Json | null
          chapter_id?: string | null
          content?: Json
          course_id?: string
          created_at?: string | null
          id?: string
          order_index?: number | null
          slide_id?: string | null
          slide_type?: string
          template_data?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_slides_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string | null
          estimated_duration: number | null
          final_video_url: string | null
          id: string
          layout: Json
          status: string | null
          style: string | null
          thumbnail_url: string | null
          title: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          estimated_duration?: number | null
          final_video_url?: string | null
          id?: string
          layout?: Json
          status?: string | null
          style?: string | null
          thumbnail_url?: string | null
          title: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          estimated_duration?: number | null
          final_video_url?: string | null
          id?: string
          layout?: Json
          status?: string | null
          style?: string | null
          thumbnail_url?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      creator_payouts: {
        Row: {
          amount_cents: number
          completed_at: string | null
          created_at: string | null
          creator_id: string
          currency: string | null
          id: string
          payout_method: string | null
          period_end: string | null
          period_start: string | null
          reference_id: string | null
          status: string | null
        }
        Insert: {
          amount_cents: number
          completed_at?: string | null
          created_at?: string | null
          creator_id: string
          currency?: string | null
          id?: string
          payout_method?: string | null
          period_end?: string | null
          period_start?: string | null
          reference_id?: string | null
          status?: string | null
        }
        Update: {
          amount_cents?: number
          completed_at?: string | null
          created_at?: string | null
          creator_id?: string
          currency?: string | null
          id?: string
          payout_method?: string | null
          period_end?: string | null
          period_start?: string | null
          reference_id?: string | null
          status?: string | null
        }
        Relationships: []
      }
      flashcard_sets: {
        Row: {
          cards: Json
          created_at: string | null
          description: string | null
          id: string
          subject: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cards?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          subject?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cards?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          subject?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      learning_path_items: {
        Row: {
          created_at: string | null
          description: string | null
          estimated_minutes: number | null
          id: string
          item_id: string | null
          item_type: string
          order_index: number | null
          path_id: string
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          estimated_minutes?: number | null
          id?: string
          item_id?: string | null
          item_type: string
          order_index?: number | null
          path_id: string
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          estimated_minutes?: number | null
          id?: string
          item_id?: string | null
          item_type?: string
          order_index?: number | null
          path_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_path_items_path_id_fkey"
            columns: ["path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_paths: {
        Row: {
          category: string
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty: string | null
          estimated_hours: number | null
          icon: string | null
          id: string
          is_public: boolean | null
          skill_ids: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty?: string | null
          estimated_hours?: number | null
          icon?: string | null
          id?: string
          is_public?: boolean | null
          skill_ids?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty?: string | null
          estimated_hours?: number | null
          icon?: string | null
          id?: string
          is_public?: boolean | null
          skill_ids?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      live_sessions: {
        Row: {
          course_id: string | null
          created_at: string | null
          duration_seconds: number | null
          ended_at: string | null
          feedback: Json | null
          id: string
          quality_rating: number | null
          session_type: string
          skill_id: string | null
          status: string | null
          topic: string | null
          transcript: Json | null
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          feedback?: Json | null
          id?: string
          quality_rating?: number | null
          session_type: string
          skill_id?: string | null
          status?: string | null
          topic?: string | null
          transcript?: Json | null
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          feedback?: Json | null
          id?: string
          quality_rating?: number | null
          session_type?: string
          skill_id?: string | null
          status?: string | null
          topic?: string | null
          transcript?: Json | null
          user_id?: string
          xp_earned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "live_sessions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_sessions_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_listings: {
        Row: {
          avg_rating: number | null
          category: string | null
          course_id: string
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          metadata: Json | null
          preview_modules: number | null
          price_cents: number | null
          published_at: string | null
          rating_count: number | null
          seller_id: string
          status: string | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          total_enrollments: number | null
          updated_at: string | null
        }
        Insert: {
          avg_rating?: number | null
          category?: string | null
          course_id: string
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          preview_modules?: number | null
          price_cents?: number | null
          published_at?: string | null
          rating_count?: number | null
          seller_id: string
          status?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          total_enrollments?: number | null
          updated_at?: string | null
        }
        Update: {
          avg_rating?: number | null
          category?: string | null
          course_id?: string
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          preview_modules?: number | null
          price_cents?: number | null
          published_at?: string | null
          rating_count?: number | null
          seller_id?: string
          status?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          total_enrollments?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_listings_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      note_folders: {
        Row: {
          color: string | null
          created_at: string | null
          icon: string | null
          id: string
          name: string
          order_index: number | null
          parent_folder_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          name: string
          order_index?: number | null
          parent_folder_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          name?: string
          order_index?: number | null
          parent_folder_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "note_folders_parent_folder_id_fkey"
            columns: ["parent_folder_id"]
            isOneToOne: false
            referencedRelation: "note_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          ai_summary: string | null
          ai_tags: string[] | null
          content: string | null
          course_id: string | null
          created_at: string | null
          folder_id: string | null
          id: string
          is_favorite: boolean | null
          is_pinned: boolean | null
          last_edited_at: string | null
          skill_id: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string
          word_count: number | null
        }
        Insert: {
          ai_summary?: string | null
          ai_tags?: string[] | null
          content?: string | null
          course_id?: string | null
          created_at?: string | null
          folder_id?: string | null
          id?: string
          is_favorite?: boolean | null
          is_pinned?: boolean | null
          last_edited_at?: string | null
          skill_id?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id: string
          word_count?: number | null
        }
        Update: {
          ai_summary?: string | null
          ai_tags?: string[] | null
          content?: string | null
          course_id?: string | null
          created_at?: string | null
          folder_id?: string | null
          id?: string
          is_favorite?: boolean | null
          is_pinned?: boolean | null
          last_edited_at?: string | null
          skill_id?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "notes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "note_folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          data: Json | null
          icon: string | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          data?: Json | null
          icon?: string | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          data?: Json | null
          icon?: string | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      parent_children: {
        Row: {
          avatar_url: string | null
          child_name: string
          created_at: string | null
          grade_level: string | null
          id: string
          parent_id: string
          subjects: Json | null
        }
        Insert: {
          avatar_url?: string | null
          child_name: string
          created_at?: string | null
          grade_level?: string | null
          id?: string
          parent_id: string
          subjects?: Json | null
        }
        Update: {
          avatar_url?: string | null
          child_name?: string
          created_at?: string | null
          grade_level?: string | null
          id?: string
          parent_id?: string
          subjects?: Json | null
        }
        Relationships: []
      }
      podcasts: {
        Row: {
          audio_url: string | null
          created_at: string | null
          duration: number | null
          error_message: string | null
          id: string
          script: string | null
          status: string
          title: string
          topic: string
          updated_at: string | null
          user_id: string
          voice_id: string | null
          voice_provider: string | null
        }
        Insert: {
          audio_url?: string | null
          created_at?: string | null
          duration?: number | null
          error_message?: string | null
          id?: string
          script?: string | null
          status?: string
          title: string
          topic: string
          updated_at?: string | null
          user_id: string
          voice_id?: string | null
          voice_provider?: string | null
        }
        Update: {
          audio_url?: string | null
          created_at?: string | null
          duration?: number | null
          error_message?: string | null
          id?: string
          script?: string | null
          status?: string
          title?: string
          topic?: string
          updated_at?: string | null
          user_id?: string
          voice_id?: string | null
          voice_provider?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          ai_requests_count: number | null
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          current_streak: number | null
          daily_goal_minutes: number | null
          full_name: string | null
          id: string
          is_developer: boolean | null
          last_active_at: string | null
          learning_goals: string[] | null
          level: number | null
          longest_streak: number | null
          onboarding_completed: boolean | null
          preferred_ai_voice: string | null
          preferred_language: string | null
          stripe_customer_id: string | null
          subscription_id: string | null
          subscription_last_updated: string | null
          subscription_status: string | null
          subscription_tier: string | null
          timezone: string | null
          total_xp: number | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          ai_requests_count?: number | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          current_streak?: number | null
          daily_goal_minutes?: number | null
          full_name?: string | null
          id: string
          is_developer?: boolean | null
          last_active_at?: string | null
          learning_goals?: string[] | null
          level?: number | null
          longest_streak?: number | null
          onboarding_completed?: boolean | null
          preferred_ai_voice?: string | null
          preferred_language?: string | null
          stripe_customer_id?: string | null
          subscription_id?: string | null
          subscription_last_updated?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          timezone?: string | null
          total_xp?: number | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          ai_requests_count?: number | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          current_streak?: number | null
          daily_goal_minutes?: number | null
          full_name?: string | null
          id?: string
          is_developer?: boolean | null
          last_active_at?: string | null
          learning_goals?: string[] | null
          level?: number | null
          longest_streak?: number | null
          onboarding_completed?: boolean | null
          preferred_ai_voice?: string | null
          preferred_language?: string | null
          stripe_customer_id?: string | null
          subscription_id?: string | null
          subscription_last_updated?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          timezone?: string | null
          total_xp?: number | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      render_jobs: {
        Row: {
          completed_at: string | null
          course_id: string
          created_at: string | null
          error_message: string | null
          id: string
          progress: number | null
          render_id: string | null
          started_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          progress?: number | null
          render_id?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          progress?: number | null
          render_id?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "render_jobs_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          difficulty_level: number | null
          icon: string
          id: string
          name: string
          parent_skill_id: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          difficulty_level?: number | null
          icon?: string
          id?: string
          name: string
          parent_skill_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          difficulty_level?: number | null
          icon?: string
          id?: string
          name?: string
          parent_skill_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "skills_parent_skill_id_fkey"
            columns: ["parent_skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      study_guides: {
        Row: {
          content: string
          created_at: string | null
          id: string
          subject: string | null
          title: string
          topic: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          subject?: string | null
          title: string
          topic?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          subject?: string | null
          title?: string
          topic?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      study_resources: {
        Row: {
          ai_generated: boolean | null
          content: string
          created_at: string | null
          description: string | null
          id: string
          resource_type: string | null
          subject: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_generated?: boolean | null
          content: string
          created_at?: string | null
          description?: string | null
          id?: string
          resource_type?: string | null
          subject?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_generated?: boolean | null
          content?: string
          created_at?: string | null
          description?: string | null
          id?: string
          resource_type?: string | null
          subject?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          created_at: string | null
          id: string
          notified: boolean | null
          progress: number | null
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          created_at?: string | null
          id?: string
          notified?: boolean | null
          progress?: number | null
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          created_at?: string | null
          id?: string
          notified?: boolean | null
          progress?: number | null
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_learning_paths: {
        Row: {
          completed_at: string | null
          created_at: string | null
          current_item_index: number | null
          id: string
          path_id: string
          progress: number | null
          started_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          current_item_index?: number | null
          id?: string
          path_id: string
          progress?: number | null
          started_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          current_item_index?: number | null
          id?: string
          path_id?: string
          progress?: number | null
          started_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_learning_paths_path_id_fkey"
            columns: ["path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          created_at: string | null
          id: string
          settings: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          settings?: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          settings?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_skills: {
        Row: {
          created_at: string | null
          ease_factor: number | null
          id: string
          last_practiced: string | null
          level: number | null
          mastery_score: number | null
          next_review_date: string | null
          skill_id: string
          total_practice_time: number | null
          updated_at: string | null
          user_id: string
          xp: number | null
        }
        Insert: {
          created_at?: string | null
          ease_factor?: number | null
          id?: string
          last_practiced?: string | null
          level?: number | null
          mastery_score?: number | null
          next_review_date?: string | null
          skill_id: string
          total_practice_time?: number | null
          updated_at?: string | null
          user_id: string
          xp?: number | null
        }
        Update: {
          created_at?: string | null
          ease_factor?: number | null
          id?: string
          last_practiced?: string | null
          level?: number | null
          mastery_score?: number | null
          next_review_date?: string | null
          skill_id?: string
          total_practice_time?: number | null
          updated_at?: string | null
          user_id?: string
          xp?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      user_streaks: {
        Row: {
          activities_today: Json | null
          created_at: string | null
          current_streak: number | null
          daily_goal_xp: number | null
          daily_xp_today: number | null
          id: string
          last_activity_date: string | null
          level: number | null
          longest_streak: number | null
          streak_freezes_remaining: number | null
          total_xp: number | null
          updated_at: string | null
          user_id: string
          weekly_xp: Json | null
        }
        Insert: {
          activities_today?: Json | null
          created_at?: string | null
          current_streak?: number | null
          daily_goal_xp?: number | null
          daily_xp_today?: number | null
          id?: string
          last_activity_date?: string | null
          level?: number | null
          longest_streak?: number | null
          streak_freezes_remaining?: number | null
          total_xp?: number | null
          updated_at?: string | null
          user_id: string
          weekly_xp?: Json | null
        }
        Update: {
          activities_today?: Json | null
          created_at?: string | null
          current_streak?: number | null
          daily_goal_xp?: number | null
          daily_xp_today?: number | null
          id?: string
          last_activity_date?: string | null
          level?: number | null
          longest_streak?: number | null
          streak_freezes_remaining?: number | null
          total_xp?: number | null
          updated_at?: string | null
          user_id?: string
          weekly_xp?: Json | null
        }
        Relationships: []
      }
      xp_history: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          source: string
          source_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          source: string
          source_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          source?: string
          source_id?: string | null
          user_id?: string
        }
        Relationships: []
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
  public: {
    Enums: {},
  },
} as const

