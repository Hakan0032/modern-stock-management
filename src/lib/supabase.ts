import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../shared/database.types'

const supabaseUrl = 'https://tbqxkrgvzdkkxegixwjn.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRicXhrcmd2emRra3hlZ2l4d2puIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNzkyMjUsImV4cCI6MjA2OTY1NTIyNX0.PGc12ELFcl2h8Q2uH3dCsldBPgOoGP3aOg4sOGat-v8'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Auth helpers
export const auth = {
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  signUp: async (email: string, password: string, userData?: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    })
    return { data, error }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback)
  },
}

// Database helpers
export const db = {
  // Users
  users: {
    getAll: () => supabase.from('users').select('*'),
    getById: (id: string) => supabase.from('users').select('*').eq('id', id).single(),
    getByEmail: (email: string) => supabase.from('users').select('*').eq('email', email).single(),
    create: (user: any) => supabase.from('users').insert(user).select().single(),
    update: (id: string, updates: any) => supabase.from('users').update(updates).eq('id', id).select().single(),
    delete: (id: string) => supabase.from('users').delete().eq('id', id),
  },

  // Materials
  materials: {
    getAll: () => supabase.from('materials').select('*'),
    getById: (id: string) => supabase.from('materials').select('*').eq('id', id).single(),
    getByCode: (code: string) => supabase.from('materials').select('*').eq('code', code).single(),
    create: (material: any) => supabase.from('materials').insert(material).select().single(),
    update: (id: string, updates: any) => supabase.from('materials').update(updates).eq('id', id).select().single(),
    delete: (id: string) => supabase.from('materials').delete().eq('id', id),
    search: (query: string) => supabase.from('materials').select('*').or(`name.ilike.%${query}%,code.ilike.%${query}%`),
  },

  // Machines
  machines: {
    getAll: () => supabase.from('machines').select('*'),
    getById: (id: string) => supabase.from('machines').select('*').eq('id', id).single(),
    getByCode: (code: string) => supabase.from('machines').select('*').eq('code', code).single(),
    create: (machine: any) => supabase.from('machines').insert(machine).select().single(),
    update: (id: string, updates: any) => supabase.from('machines').update(updates).eq('id', id).select().single(),
    delete: (id: string) => supabase.from('machines').delete().eq('id', id),
  },

  // Work Orders
  workOrders: {
    getAll: () => supabase.from('work_orders').select('*'),
    getById: (id: string) => supabase.from('work_orders').select('*').eq('id', id).single(),
    create: (workOrder: any) => supabase.from('work_orders').insert(workOrder).select().single(),
    update: (id: string, updates: any) => supabase.from('work_orders').update(updates).eq('id', id).select().single(),
    delete: (id: string) => supabase.from('work_orders').delete().eq('id', id),
  },

  // Material Movements
  materialMovements: {
    getAll: () => supabase.from('material_movements').select('*'),
    getById: (id: string) => supabase.from('material_movements').select('*').eq('id', id).single(),
    getByMaterial: (materialId: string) => supabase.from('material_movements').select('*').eq('material_id', materialId),
    create: (movement: any) => supabase.from('material_movements').insert(movement).select().single(),
    update: (id: string, updates: any) => supabase.from('material_movements').update(updates).eq('id', id).select().single(),
    delete: (id: string) => supabase.from('material_movements').delete().eq('id', id),
  },

  // BOM Items
  bomItems: {
    getAll: () => supabase.from('bom_items').select('*'),
    getById: (id: string) => supabase.from('bom_items').select('*').eq('id', id).single(),
    getByMachine: (machineId: string) => supabase.from('bom_items').select('*').eq('machine_id', machineId),
    create: (bomItem: any) => supabase.from('bom_items').insert(bomItem).select().single(),
    update: (id: string, updates: any) => supabase.from('bom_items').update(updates).eq('id', id).select().single(),
    delete: (id: string) => supabase.from('bom_items').delete().eq('id', id),
  },

  // Suppliers
  suppliers: {
    getAll: () => supabase.from('suppliers').select('*'),
    getById: (id: number) => supabase.from('suppliers').select('*').eq('id', id).single(),
    create: (supplier: any) => supabase.from('suppliers').insert(supplier).select().single(),
    update: (id: number, updates: any) => supabase.from('suppliers').update(updates).eq('id', id).select().single(),
    delete: (id: number) => supabase.from('suppliers').delete().eq('id', id),
  },
}

export default supabase