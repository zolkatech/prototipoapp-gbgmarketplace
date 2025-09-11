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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      client_animals: {
        Row: {
          age: number | null
          breed: string | null
          client_id: string
          color: string | null
          created_at: string
          id: string
          name: string
          observations: string | null
          species: string | null
          updated_at: string
          weight: number | null
        }
        Insert: {
          age?: number | null
          breed?: string | null
          client_id: string
          color?: string | null
          created_at?: string
          id?: string
          name: string
          observations?: string | null
          species?: string | null
          updated_at?: string
          weight?: number | null
        }
        Update: {
          age?: number | null
          breed?: string | null
          client_id?: string
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          observations?: string | null
          species?: string | null
          updated_at?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_client_animals_client"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "supplier_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_appointments: {
        Row: {
          animal_id: string | null
          appointment_date: string
          client_id: string
          created_at: string
          description: string | null
          id: string
          location: string | null
          observations: string | null
          price: number | null
          reminder_email_sent_at: string | null
          service_type: string
          status: string | null
          supplier_id: string
          updated_at: string
        }
        Insert: {
          animal_id?: string | null
          appointment_date: string
          client_id: string
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          observations?: string | null
          price?: number | null
          reminder_email_sent_at?: string | null
          service_type: string
          status?: string | null
          supplier_id: string
          updated_at?: string
        }
        Update: {
          animal_id?: string | null
          appointment_date?: string
          client_id?: string
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          observations?: string | null
          price?: number | null
          reminder_email_sent_at?: string | null
          service_type?: string
          status?: string | null
          supplier_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_client_appointments_animal"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "client_animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_client_appointments_client"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "supplier_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_client_appointments_supplier"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: Database["public"]["Enums"]["expense_category"]
          created_at: string
          description: string | null
          expense_date: string
          id: string
          sale_id: string | null
          supplier_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          category: Database["public"]["Enums"]["expense_category"]
          created_at?: string
          description?: string | null
          expense_date?: string
          id?: string
          sale_id?: string | null
          supplier_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: Database["public"]["Enums"]["expense_category"]
          created_at?: string
          description?: string | null
          expense_date?: string
          id?: string
          sale_id?: string | null
          supplier_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_favorites_product"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          product_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          product_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          product_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      product_likes: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string
          created_at: string
          delivers: boolean | null
          delivery_locations: string[] | null
          description: string | null
          discount_percentage: number | null
          id: string
          image_url: string | null
          images: string[] | null
          installment_options: Json | null
          name: string
          original_price: number | null
          price: number
          supplier_id: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          delivers?: boolean | null
          delivery_locations?: string[] | null
          description?: string | null
          discount_percentage?: number | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          installment_options?: Json | null
          name: string
          original_price?: number | null
          price: number
          supplier_id: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          delivers?: boolean | null
          delivery_locations?: string[] | null
          description?: string | null
          discount_percentage?: number | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          installment_options?: Json | null
          name?: string
          original_price?: number | null
          price?: number
          supplier_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          bio: string | null
          business_name: string | null
          cep: string | null
          city: string | null
          cpf_cnpj: string | null
          created_at: string
          email: string
          first_login: boolean | null
          full_name: string | null
          id: string
          instagram: string | null
          phone: string | null
          specialties: string[] | null
          state: string | null
          updated_at: string
          user_id: string
          user_type: string
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          business_name?: string | null
          cep?: string | null
          city?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          email: string
          first_login?: boolean | null
          full_name?: string | null
          id?: string
          instagram?: string | null
          phone?: string | null
          specialties?: string[] | null
          state?: string | null
          updated_at?: string
          user_id: string
          user_type: string
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          business_name?: string | null
          cep?: string | null
          city?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          email?: string
          first_login?: boolean | null
          full_name?: string | null
          id?: string
          instagram?: string | null
          phone?: string | null
          specialties?: string[] | null
          state?: string | null
          updated_at?: string
          user_id?: string
          user_type?: string
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      profiles_public: {
        Row: {
          avatar_url: string | null
          bio: string | null
          business_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          business_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          business_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          client_id: string
          comment: string | null
          created_at: string
          id: string
          rating: number
          supplier_id: string
        }
        Insert: {
          client_id: string
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          supplier_id: string
        }
        Update: {
          client_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          supplier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          appointment_id: string | null
          created_at: string
          id: string
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          product_name: string
          profit: number
          sale_value: number
          supplier_client_id: string | null
          supplier_id: string
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string
          id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          product_name: string
          profit: number
          sale_value: number
          supplier_client_id?: string | null
          supplier_id: string
        }
        Update: {
          appointment_id?: string | null
          created_at?: string
          id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          product_name?: string
          profit?: number
          sale_value?: number
          supplier_client_id?: string | null
          supplier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "client_appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_supplier_client_id_fkey"
            columns: ["supplier_client_id"]
            isOneToOne: false
            referencedRelation: "supplier_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_clients: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          supplier_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          supplier_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          supplier_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_supplier_clients_supplier"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_financial_settings: {
        Row: {
          created_at: string
          supplier_id: string
          tax_rate: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          supplier_id: string
          tax_rate?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          supplier_id?: string
          tax_rate?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_financial_settings_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_profile: {
        Args: Record<PropertyKey, never>
        Returns: {
          address: string | null
          avatar_url: string | null
          bio: string | null
          business_name: string | null
          cep: string | null
          city: string | null
          cpf_cnpj: string | null
          created_at: string
          email: string
          first_login: boolean | null
          full_name: string | null
          id: string
          instagram: string | null
          phone: string | null
          specialties: string[] | null
          state: string | null
          updated_at: string
          user_id: string
          user_type: string
          website: string | null
          whatsapp: string | null
        }
      }
      get_public_profile: {
        Args: { _id: string }
        Returns: {
          avatar_url: string
          bio: string
          business_name: string
          id: string
        }[]
      }
      is_supplier_owned: {
        Args: { _supplier_id: string }
        Returns: boolean
      }
      update_current_user_avatar: {
        Args: { p_avatar_url: string }
        Returns: undefined
      }
      update_current_user_profile: {
        Args:
          | {
              p_address?: string
              p_bio?: string
              p_business_name?: string
              p_cep?: string
              p_city?: string
              p_cpf_cnpj?: string
              p_full_name?: string
              p_instagram?: string
              p_phone?: string
              p_specialties?: string[]
              p_state?: string
              p_website?: string
              p_whatsapp?: string
            }
          | {
              p_address?: string
              p_bio?: string
              p_business_name?: string
              p_cep?: string
              p_city?: string
              p_full_name?: string
              p_instagram?: string
              p_phone?: string
              p_state?: string
              p_website?: string
              p_whatsapp?: string
            }
        Returns: undefined
      }
      update_first_login_status: {
        Args: { p_first_login?: boolean }
        Returns: undefined
      }
    }
    Enums: {
      expense_category:
        | "combustivel_deslocamento"
        | "material"
        | "alimentacao"
        | "impostos"
        | "outros"
      payment_method: "pix" | "dinheiro" | "cartao" | "boleto"
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
      expense_category: [
        "combustivel_deslocamento",
        "material",
        "alimentacao",
        "impostos",
        "outros",
      ],
      payment_method: ["pix", "dinheiro", "cartao", "boleto"],
    },
  },
} as const
