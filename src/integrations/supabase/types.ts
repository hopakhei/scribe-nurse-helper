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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      assessment_sections: {
        Row: {
          assessment_id: string | null
          completed: boolean | null
          created_at: string | null
          id: string
          section_id: string
          section_title: string
          updated_at: string | null
        }
        Insert: {
          assessment_id?: string | null
          completed?: boolean | null
          created_at?: string | null
          id?: string
          section_id: string
          section_title: string
          updated_at?: string | null
        }
        Update: {
          assessment_id?: string | null
          completed?: boolean | null
          created_at?: string | null
          id?: string
          section_id?: string
          section_title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_sections_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "patient_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      audio_transcripts: {
        Row: {
          assessment_id: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          processed: boolean | null
          transcript_text: string
          user_id: string | null
        }
        Insert: {
          assessment_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          processed?: boolean | null
          transcript_text: string
          user_id?: string | null
        }
        Update: {
          assessment_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          processed?: boolean | null
          transcript_text?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audio_transcripts_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "patient_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      form_field_values: {
        Row: {
          ai_source_text: string | null
          assessment_id: string | null
          created_at: string | null
          data_source: Database["public"]["Enums"]["data_source"]
          field_id: string
          field_label: string
          id: string
          section_id: string
          updated_at: string | null
          value: string | null
        }
        Insert: {
          ai_source_text?: string | null
          assessment_id?: string | null
          created_at?: string | null
          data_source?: Database["public"]["Enums"]["data_source"]
          field_id: string
          field_label: string
          id?: string
          section_id: string
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          ai_source_text?: string | null
          assessment_id?: string | null
          created_at?: string | null
          data_source?: Database["public"]["Enums"]["data_source"]
          field_id?: string
          field_label?: string
          id?: string
          section_id?: string
          updated_at?: string | null
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_field_values_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "patient_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_assessments: {
        Row: {
          assessment_date: string
          assessment_time: string
          completed_at: string | null
          created_at: string | null
          id: string
          patient_id: string | null
          status: Database["public"]["Enums"]["assessment_status"] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assessment_date?: string
          assessment_time?: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          patient_id?: string | null
          status?: Database["public"]["Enums"]["assessment_status"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assessment_date?: string
          assessment_time?: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          patient_id?: string | null
          status?: Database["public"]["Enums"]["assessment_status"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_assessments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          admission_date: string | null
          admission_type: Database["public"]["Enums"]["admission_type"] | null
          age: number | null
          bed: string | null
          created_at: string | null
          dept: string | null
          hospital_no: string
          id: string
          id_no: string | null
          name: string
          sex: string | null
          team: string | null
          updated_at: string | null
          ward: string | null
        }
        Insert: {
          admission_date?: string | null
          admission_type?: Database["public"]["Enums"]["admission_type"] | null
          age?: number | null
          bed?: string | null
          created_at?: string | null
          dept?: string | null
          hospital_no: string
          id?: string
          id_no?: string | null
          name: string
          sex?: string | null
          team?: string | null
          updated_at?: string | null
          ward?: string | null
        }
        Update: {
          admission_date?: string | null
          admission_type?: Database["public"]["Enums"]["admission_type"] | null
          age?: number | null
          bed?: string | null
          created_at?: string | null
          dept?: string | null
          hospital_no?: string
          id?: string
          id_no?: string | null
          name?: string
          sex?: string | null
          team?: string | null
          updated_at?: string | null
          ward?: string | null
        }
        Relationships: []
      }
      risk_scores: {
        Row: {
          assessment_id: string | null
          calculated_at: string | null
          description: string | null
          id: string
          max_score: number
          risk_level: Database["public"]["Enums"]["risk_level"]
          score_name: string
          score_value: number
        }
        Insert: {
          assessment_id?: string | null
          calculated_at?: string | null
          description?: string | null
          id?: string
          max_score: number
          risk_level: Database["public"]["Enums"]["risk_level"]
          score_name: string
          score_value: number
        }
        Update: {
          assessment_id?: string | null
          calculated_at?: string | null
          description?: string | null
          id?: string
          max_score?: number
          risk_level?: Database["public"]["Enums"]["risk_level"]
          score_name?: string
          score_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "risk_scores_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "patient_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_morse_fall_score: {
        Args: { assessment_id_param: string }
        Returns: number
      }
      cleanup_expired_transcripts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      admission_type: "A&E" | "Elective" | "Transfer" | "Readmission"
      assessment_status: "in_progress" | "completed" | "submitted"
      data_source: "pre-populated" | "ai-filled" | "manual"
      risk_level: "low" | "medium" | "high"
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
    Enums: {
      admission_type: ["A&E", "Elective", "Transfer", "Readmission"],
      assessment_status: ["in_progress", "completed", "submitted"],
      data_source: ["pre-populated", "ai-filled", "manual"],
      risk_level: ["low", "medium", "high"],
    },
  },
} as const
