export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          email: string
          password_hash: string
          first_name: string
          last_name: string
          role: 'admin' | 'manager' | 'planner' | 'operator' | 'viewer'
          department: string | null
          phone: string | null
          is_active: boolean | null
          last_login: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          username: string
          email: string
          password_hash: string
          first_name: string
          last_name: string
          role: 'admin' | 'manager' | 'planner' | 'operator' | 'viewer'
          department?: string | null
          phone?: string | null
          is_active?: boolean | null
          last_login?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          username?: string
          email?: string
          password_hash?: string
          first_name?: string
          last_name?: string
          role?: 'admin' | 'manager' | 'planner' | 'operator' | 'viewer'
          department?: string | null
          phone?: string | null
          is_active?: boolean | null
          last_login?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      materials: {
        Row: {
          id: string
          code: string
          name: string
          description: string | null
          category: string
          unit: string
          current_stock: number | null
          min_stock_level: number | null
          max_stock_level: number | null
          unit_price: number | null
          supplier: string | null
          location: string | null
          barcode: string | null
          image_path: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          code: string
          name: string
          description?: string | null
          category: string
          unit: string
          current_stock?: number | null
          min_stock_level?: number | null
          max_stock_level?: number | null
          unit_price?: number | null
          supplier?: string | null
          location?: string | null
          barcode?: string | null
          image_path?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          code?: string
          name?: string
          description?: string | null
          category?: string
          unit?: string
          current_stock?: number | null
          min_stock_level?: number | null
          max_stock_level?: number | null
          unit_price?: number | null
          supplier?: string | null
          location?: string | null
          barcode?: string | null
          image_path?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      machines: {
        Row: {
          id: string
          code: string
          name: string
          category: string
          model: string | null
          manufacturer: string | null
          year: number | null
          status: 'active' | 'maintenance' | 'inactive'
          location: string | null
          specifications: string | null
          maintenance_schedule: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          code: string
          name: string
          category: string
          model?: string | null
          manufacturer?: string | null
          year?: number | null
          status: 'active' | 'maintenance' | 'inactive'
          location?: string | null
          specifications?: string | null
          maintenance_schedule?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          code?: string
          name?: string
          category?: string
          model?: string | null
          manufacturer?: string | null
          year?: number | null
          status?: 'active' | 'maintenance' | 'inactive'
          location?: string | null
          specifications?: string | null
          maintenance_schedule?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      work_orders: {
        Row: {
          id: string
          order_number: string
          title: string
          description: string | null
          machine_id: string
          machine_name: string
          quantity: number
          status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
          priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
          planned_start_date: string | null
          planned_end_date: string | null
          actual_start_date: string | null
          actual_end_date: string | null
          customer_name: string | null
          customer_contact: string | null
          assigned_to: string | null
          estimated_hours: number | null
          actual_hours: number | null
          estimated_duration: number | null
          actual_duration: number | null
          notes: string | null
          created_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          order_number: string
          title: string
          description?: string | null
          machine_id: string
          machine_name: string
          quantity?: number
          status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
          priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
          planned_start_date?: string | null
          planned_end_date?: string | null
          actual_start_date?: string | null
          actual_end_date?: string | null
          customer_name?: string | null
          customer_contact?: string | null
          assigned_to?: string | null
          estimated_hours?: number | null
          actual_hours?: number | null
          estimated_duration?: number | null
          actual_duration?: number | null
          notes?: string | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          order_number?: string
          title?: string
          description?: string | null
          machine_id?: string
          machine_name?: string
          quantity?: number
          status?: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
          priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
          planned_start_date?: string | null
          planned_end_date?: string | null
          actual_start_date?: string | null
          actual_end_date?: string | null
          customer_name?: string | null
          customer_contact?: string | null
          assigned_to?: string | null
          estimated_hours?: number | null
          actual_hours?: number | null
          estimated_duration?: number | null
          actual_duration?: number | null
          notes?: string | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      material_movements: {
        Row: {
          id: string
          material_id: string
          material_code: string
          material_name: string
          type: 'IN' | 'OUT'
          quantity: number
          unit: string
          unit_price: number | null
          total_price: number | null
          reason: string | null
          reference: string | null
          location: string | null
          performed_by: string | null
          work_order_id: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          material_id: string
          material_code: string
          material_name: string
          type: 'IN' | 'OUT'
          quantity: number
          unit: string
          unit_price?: number | null
          total_price?: number | null
          reason?: string | null
          reference?: string | null
          location?: string | null
          performed_by?: string | null
          work_order_id?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          material_id?: string
          material_code?: string
          material_name?: string
          type?: 'IN' | 'OUT'
          quantity?: number
          unit?: string
          unit_price?: number | null
          total_price?: number | null
          reason?: string | null
          reference?: string | null
          location?: string | null
          performed_by?: string | null
          work_order_id?: string | null
          created_at?: string | null
        }
      }
      bom_items: {
        Row: {
          id: string
          machine_id: string
          material_id: string
          material_code: string
          material_name: string
          quantity: number
          unit: string
          unit_price: number | null
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          machine_id: string
          material_id: string
          material_code: string
          material_name: string
          quantity: number
          unit: string
          unit_price?: number | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          machine_id?: string
          material_id?: string
          material_code?: string
          material_name?: string
          quantity?: number
          unit?: string
          unit_price?: number | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      suppliers: {
        Row: {
          id: number
          name: string
          contact_person: string | null
          email: string | null
          phone: string | null
          address: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          name: string
          contact_person?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          name?: string
          contact_person?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      system_logs: {
        Row: {
          id: string
          timestamp: string | null
          level: 'info' | 'warning' | 'error'
          category: string
          message: string
          user_id: string | null
          ip_address: string | null
          user_agent: string | null
          details: Json | null
          error_details: string | null
        }
        Insert: {
          id?: string
          timestamp?: string | null
          level: 'info' | 'warning' | 'error'
          category: string
          message: string
          user_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          details?: Json | null
          error_details?: string | null
        }
        Update: {
          id?: string
          timestamp?: string | null
          level?: 'info' | 'warning' | 'error'
          category?: string
          message?: string
          user_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          details?: Json | null
          error_details?: string | null
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}