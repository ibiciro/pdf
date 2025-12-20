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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      content: {
        Row: {
          allow_download: boolean | null
          content_body: string | null
          content_type: string
          created_at: string
          creator_id: string
          description: string | null
          download_price_cents: number | null
          id: string
          pdf_url: string | null
          price_cents: number
          session_duration_minutes: number
          status: string
          thumbnail_url: string | null
          title: string
          total_earnings_cents: number
          total_reads: number
          updated_at: string | null
        }
        Insert: {
          allow_download?: boolean | null
          content_body?: string | null
          content_type: string
          created_at?: string
          creator_id: string
          description?: string | null
          download_price_cents?: number | null
          id?: string
          pdf_url?: string | null
          price_cents?: number
          session_duration_minutes?: number
          status?: string
          thumbnail_url?: string | null
          title: string
          total_earnings_cents?: number
          total_reads?: number
          updated_at?: string | null
        }
        Update: {
          allow_download?: boolean | null
          content_body?: string | null
          content_type?: string
          created_at?: string
          creator_id?: string
          description?: string | null
          download_price_cents?: number | null
          id?: string
          pdf_url?: string | null
          price_cents?: number
          session_duration_minutes?: number
          status?: string
          thumbnail_url?: string | null
          title?: string
          total_earnings_cents?: number
          total_reads?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      content_categories: {
        Row: {
          category_id: string
          content_id: string
        }
        Insert: {
          category_id: string
          content_id: string
        }
        Update: {
          category_id?: string
          content_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_categories_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
        ]
      }
      content_downloads: {
        Row: {
          amount_paid_cents: number
          content_id: string
          download_token: string
          downloaded_at: string
          id: string
          user_id: string
          watermark_data: Json
        }
        Insert: {
          amount_paid_cents?: number
          content_id: string
          download_token: string
          downloaded_at?: string
          id?: string
          user_id: string
          watermark_data: Json
        }
        Update: {
          amount_paid_cents?: number
          content_id?: string
          download_token?: string
          downloaded_at?: string
          id?: string
          user_id?: string
          watermark_data?: Json
        }
        Relationships: [
          {
            foreignKeyName: "content_downloads_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_downloads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      likes: {
        Row: {
          content_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          content_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          content_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_cents: number
          content_id: string
          created_at: string
          creator_id: string
          id: string
          payer_id: string
          session_id: string | null
          status: string
          stripe_payment_intent_id: string | null
        }
        Insert: {
          amount_cents: number
          content_id: string
          created_at?: string
          creator_id: string
          id?: string
          payer_id: string
          session_id?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
        }
        Update: {
          amount_cents?: number
          content_id?: string
          created_at?: string
          creator_id?: string
          id?: string
          payer_id?: string
          session_id?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_payer_id_fkey"
            columns: ["payer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "reading_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      quality_ratings: {
        Row: {
          content_id: string
          created_at: string
          id: string
          rating_type: string
          user_id: string
        }
        Insert: {
          content_id: string
          created_at?: string
          id?: string
          rating_type: string
          user_id: string
        }
        Update: {
          content_id?: string
          created_at?: string
          id?: string
          rating_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quality_ratings_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quality_ratings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reading_sessions: {
        Row: {
          amount_paid_cents: number
          content_id: string
          created_at: string
          expires_at: string
          extended_count: number
          id: string
          pages_read: number | null
          reader_id: string
          started_at: string
          status: string
        }
        Insert: {
          amount_paid_cents: number
          content_id: string
          created_at?: string
          expires_at: string
          extended_count?: number
          id?: string
          pages_read?: number | null
          reader_id: string
          started_at?: string
          status?: string
        }
        Update: {
          amount_paid_cents?: number
          content_id?: string
          created_at?: string
          expires_at?: string
          extended_count?: number
          id?: string
          pages_read?: number | null
          reader_id?: string
          started_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "reading_sessions_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_sessions_reader_id_fkey"
            columns: ["reader_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          content_id: string
          created_at: string
          id: string
          rating: number
          reader_id: string
          review_text: string | null
          session_id: string | null
        }
        Insert: {
          content_id: string
          created_at?: string
          id?: string
          rating: number
          reader_id: string
          review_text?: string | null
          session_id?: string | null
        }
        Update: {
          content_id?: string
          created_at?: string
          id?: string
          rating?: number
          reader_id?: string
          review_text?: string | null
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reader_id_fkey"
            columns: ["reader_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "reading_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          image: string | null
          name: string | null
          role: string | null
          token_identifier: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          image?: string | null
          name?: string | null
          role?: string | null
          token_identifier: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          image?: string | null
          name?: string | null
          role?: string | null
          token_identifier?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_content_avg_rating: {
        Args: { content_uuid: string }
        Returns: number
      }
      get_content_like_count: {
        Args: { content_uuid: string }
        Returns: number
      }
      get_content_review_count: {
        Args: { content_uuid: string }
        Returns: number
      }
      get_quality_rating_counts: {
        Args: { content_uuid: string }
        Returns: Json
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
