import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../shared/database.types'

const supabaseUrl = process.env.SUPABASE_URL || 'https://kyetyztrcvxhgqbynfpc.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5ZXR5enRyY3Z4aGdxYnluZnBjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTU4NDU1MSwiZXhwIjoyMDcxMTYwNTUxfQ.R4tlgp1GwFggfq_ZNZPXlvb3-Q47pgn--gMEc9iCVuA'

// Backend uses service role key for full access
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Database operations for backend
export const dbAdmin = {
  // Users
  users: {
    getAll: async () => {
      const { data, error } = await supabaseAdmin.from('users').select('*')
      if (error) throw error
      return data
    },
    getById: async (id: string) => {
      const { data, error } = await supabaseAdmin.from('users').select('*').eq('id', id).single()
      if (error) throw error
      return data
    },
    getByEmail: async (email: string) => {
      const { data, error } = await supabaseAdmin.from('users').select('*').eq('email', email).single()
      if (error) throw error
      return data
    },
    getByUsername: async (username: string) => {
      const { data, error } = await supabaseAdmin.from('users').select('*').eq('username', username).single()
      if (error) throw error
      return data
    },
    create: async (user: any) => {
      const { data, error } = await supabaseAdmin.from('users').insert(user).select().single()
      if (error) throw error
      return data
    },
    update: async (id: string, updates: any) => {
      const { data, error } = await supabaseAdmin.from('users').update(updates).eq('id', id).select().single()
      if (error) throw error
      return data
    },
    delete: async (id: string) => {
      const { error } = await supabaseAdmin.from('users').delete().eq('id', id)
      if (error) throw error
    },
  },

  // Materials
  materials: {
    getAll: async () => {
      const { data, error } = await supabaseAdmin.from('materials').select('*')
      if (error) throw error
      return data
    },
    getById: async (id: string) => {
      const { data, error } = await supabaseAdmin.from('materials').select('*').eq('id', id).single()
      if (error) throw error
      return data
    },
    getByCode: async (code: string) => {
      const { data, error } = await supabaseAdmin.from('materials').select('*').eq('code', code).single()
      if (error) throw error
      return data
    },
    create: async (material: any) => {
      const { data, error } = await supabaseAdmin.from('materials').insert(material).select().single()
      if (error) throw error
      return data
    },
    update: async (id: string, updates: any) => {
      const { data, error } = await supabaseAdmin.from('materials').update(updates).eq('id', id).select().single()
      if (error) throw error
      return data
    },
    delete: async (id: string) => {
      console.log('DELETE operation - ID:', id)
      
      // First, delete all material movements for this material
      console.log('Deleting material movements for material:', id)
      const { error: movementsError } = await supabaseAdmin
        .from('material_movements')
        .delete()
        .eq('material_id', id)
      
      if (movementsError) {
        console.error('Error deleting material movements:', movementsError)
        throw movementsError
      }
      console.log('Material movements deleted successfully')
      
      // Then delete the material itself
      const { data, error, count } = await supabaseAdmin.from('materials').delete().eq('id', id).select()
      console.log('DELETE result - data:', data, 'error:', error, 'count:', count)
      if (error) {
        console.error('DELETE error details:', error)
        throw error
      }
      if (!data || data.length === 0) {
        console.log('No rows affected by DELETE operation')
        throw new Error('Material not found')
      }
      console.log('DELETE successful, deleted rows:', data.length)
      return data
    },
    search: async (query: string) => {
      const { data, error } = await supabaseAdmin.from('materials').select('*').or(`name.ilike.%${query}%,code.ilike.%${query}%`)
      if (error) throw error
      return data
    },
  },

  // Machines
  machines: {
    getAll: async () => {
      const { data, error } = await supabaseAdmin.from('machines').select('*')
      if (error) throw error
      return data
    },
    getById: async (id: string) => {
      const { data, error } = await supabaseAdmin.from('machines').select('*').eq('id', id).single()
      if (error) throw error
      return data
    },
    getByCode: async (code: string) => {
      const { data, error } = await supabaseAdmin.from('machines').select('*').eq('code', code).single()
      if (error) throw error
      return data
    },
    create: async (machine: any) => {
      const { data, error } = await supabaseAdmin.from('machines').insert(machine).select().single()
      if (error) throw error
      return data
    },
    update: async (id: string, updates: any) => {
      const { data, error } = await supabaseAdmin.from('machines').update(updates).eq('id', id).select().single()
      if (error) throw error
      return data
    },
    delete: async (id: string) => {
      const { error } = await supabaseAdmin.from('machines').delete().eq('id', id)
      if (error) throw error
    },
  },

  // Work Orders
  workOrders: {
    getAll: async () => {
      const { data, error } = await supabaseAdmin.from('work_orders').select('*')
      if (error) throw error
      return data
    },
    getById: async (id: string) => {
      const { data, error } = await supabaseAdmin.from('work_orders').select('*').eq('id', id).single()
      if (error) throw error
      return data
    },
    create: async (workOrder: any) => {
      const { data, error } = await supabaseAdmin.from('work_orders').insert(workOrder).select().single()
      if (error) throw error
      return data
    },
    update: async (id: string, updates: any) => {
      const { data, error } = await supabaseAdmin.from('work_orders').update(updates).eq('id', id).select().single()
      if (error) throw error
      return data
    },
    delete: async (id: string) => {
      const { error } = await supabaseAdmin.from('work_orders').delete().eq('id', id)
      if (error) throw error
    },
  },

  // Material Movements
  materialMovements: {
    getAll: async () => {
      const { data, error } = await supabaseAdmin.from('material_movements').select('*')
      if (error) throw error
      return data
    },
    getById: async (id: string) => {
      const { data, error } = await supabaseAdmin.from('material_movements').select('*').eq('id', id).single()
      if (error) throw error
      return data
    },
    getByMaterial: async (materialId: string) => {
      const { data, error } = await supabaseAdmin.from('material_movements').select('*').eq('material_id', materialId)
      if (error) throw error
      return data
    },
    create: async (movement: any) => {
      const { data, error } = await supabaseAdmin.from('material_movements').insert(movement).select().single()
      if (error) throw error
      return data
    },
    update: async (id: string, updates: any) => {
      const { data, error } = await supabaseAdmin.from('material_movements').update(updates).eq('id', id).select().single()
      if (error) throw error
      return data
    },
    delete: async (id: string) => {
      const { error } = await supabaseAdmin.from('material_movements').delete().eq('id', id)
      if (error) throw error
    },
  },

  // BOM Items
  bomItems: {
    getAll: async () => {
      const { data, error } = await supabaseAdmin.from('bom_items').select('*')
      if (error) throw error
      return data
    },
    getById: async (id: string) => {
      const { data, error } = await supabaseAdmin.from('bom_items').select('*').eq('id', id).single()
      if (error) throw error
      return data
    },
    getByMachine: async (machineId: string) => {
      const { data, error } = await supabaseAdmin.from('bom_items').select('*').eq('machine_id', machineId)
      if (error) throw error
      return data
    },
    create: async (bomItem: any) => {
      const { data, error } = await supabaseAdmin.from('bom_items').insert(bomItem).select().single()
      if (error) throw error
      return data
    },
    update: async (id: string, updates: any) => {
      const { data, error } = await supabaseAdmin.from('bom_items').update(updates).eq('id', id).select().single()
      if (error) throw error
      return data
    },
    delete: async (id: string) => {
      const { error } = await supabaseAdmin.from('bom_items').delete().eq('id', id)
      if (error) throw error
    },
  },

  // Suppliers
  suppliers: {
    getAll: async () => {
      const { data, error } = await supabaseAdmin.from('suppliers').select('*')
      if (error) throw error
      return data
    },
    getById: async (id: string) => {
      const { data, error } = await supabaseAdmin.from('suppliers').select('*').eq('id', id).single()
      if (error) throw error
      return data
    },
    getByCode: async (code: string) => {
      const { data, error } = await supabaseAdmin.from('suppliers').select('*').eq('code', code).single()
      if (error) throw error
      return data
    },
    create: async (supplier: any) => {
      const { data, error } = await supabaseAdmin.from('suppliers').insert(supplier).select().single()
      if (error) throw error
      return data
    },
    update: async (id: string, updates: any) => {
      const { data, error } = await supabaseAdmin.from('suppliers').update(updates).eq('id', id).select().single()
      if (error) throw error
      return data
    },
    delete: async (id: string) => {
      const { error } = await supabaseAdmin.from('suppliers').delete().eq('id', id)
      if (error) throw error
    },
  },

  // Categories
  categories: {
    getAll: async () => {
      const { data, error } = await supabaseAdmin.from('categories').select('*')
      if (error) throw error
      return data
    },
    getById: async (id: string) => {
      const { data, error } = await supabaseAdmin.from('categories').select('*').eq('id', id).single()
      if (error) throw error
      return data
    },
    getByName: async (name: string) => {
      const { data, error } = await supabaseAdmin.from('categories').select('*').eq('name', name).single()
      if (error) throw error
      return data
    },
    create: async (category: any) => {
      const { data, error } = await supabaseAdmin.from('categories').insert(category).select().single()
      if (error) throw error
      return data
    },
    update: async (id: string, updates: any) => {
      const { data, error } = await supabaseAdmin.from('categories').update(updates).eq('id', id).select().single()
      if (error) throw error
      return data
    },
    delete: async (id: string) => {
      const { error } = await supabaseAdmin.from('categories').delete().eq('id', id)
      if (error) throw error
    },
  },

  // System Logs
  systemLogs: {
    create: async (log: any) => {
      const { data, error } = await supabaseAdmin.from('system_logs').insert(log).select().single()
      if (error) throw error
      return data
    },
    getAll: async () => {
      const { data, error } = await supabaseAdmin.from('system_logs').select('*').order('timestamp', { ascending: false })
      if (error) throw error
      return data
    },
  },
}

export default dbAdmin