import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database Types
export interface User {
  id: string
  email: string
  full_name: string
  created_at: string
  subscription_tier: 'free' | 'pro' | 'agency' | 'enterprise'
  paddle_customer_id?: string
  user_metadata?: {
    full_name?: string
    [key: string]: any
  }
  usage_stats?: {
    letters_this_month: number
    complaints_this_month: number
    reports_this_month: number
    meetings_this_month: number
  }
}

export interface HOA {
  id: string
  name: string
  address?: string
  owner_id: string
  total_units?: number
  created_at: string
  settings?: {
    auto_generate_letters: boolean
    notification_preferences: string[]
    letterhead_info?: {
      name: string
      address: string
      phone: string
      email: string
    }
  }
}

export interface Violation {
  id: string
  hoa_id: string
  resident_name: string
  resident_address: string
  violation_type: string
  violation_description: string
  photo_url?: string
  gpt_letter?: string
  status: 'draft' | 'sent' | 'resolved' | 'escalated'
  created_at: string
  resolved_at?: string
  notes?: string
}

export interface Complaint {
  id: string
  hoa_id: string
  resident_name: string
  resident_email?: string
  complaint_text: string
  category: 'maintenance' | 'neighbor' | 'policy' | 'amenity' | 'other'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  gpt_reply?: string
  status: 'new' | 'in_progress' | 'resolved' | 'closed'
  created_at: string
  resolved_at?: string
  manager_notes?: string
}

export interface MeetingTranscript {
  id: string
  hoa_id: string
  meeting_type: 'board' | 'annual' | 'special' | 'committee'
  meeting_date: string
  transcript_text?: string
  audio_url?: string
  summary?: string
  action_items?: Array<{
    task: string
    assignee: string
    due_date: string
    status: 'pending' | 'completed'
  }>
  attendees?: string[]
  created_at: string
}

export interface MonthlyReport {
  id: string
  hoa_id: string
  report_month: string
  report_url?: string
  summary_text?: string
  metrics: {
    total_violations: number
    total_complaints: number
    avg_response_time: number
    compliance_rate: number
    satisfaction_score?: number
  }
  created_at: string
}

// Utility functions for common queries
export const hoaQueries = {
  getByUserId: (userId: string) =>
    supabase
      .from('hoas')
      .select('*')
      .eq('owner_id', userId),

  getById: (id: string) =>
    supabase
      .from('hoas')
      .select('*')
      .eq('id', id)
      .single(),

  create: (hoa: Omit<HOA, 'id' | 'created_at'>) =>
    supabase
      .from('hoas')
      .insert(hoa)
      .select()
      .single(),

  update: (id: string, updates: Partial<HOA>) =>
    supabase
      .from('hoas')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
}

export const violationQueries = {
  getByHoaId: (hoaId: string) =>
    supabase
      .from('violations')
      .select('*')
      .eq('hoa_id', hoaId)
      .order('created_at', { ascending: false }),

  create: (violation: Omit<Violation, 'id' | 'created_at'>) =>
    supabase
      .from('violations')
      .insert(violation)
      .select()
      .single(),

  update: (id: string, updates: Partial<Violation>) =>
    supabase
      .from('violations')
      .update(updates)
      .eq('id', id)
      .select()
      .single(),

  getMonthlyCount: (hoaId: string, month: string) =>
    supabase
      .from('violations')
      .select('id', { count: 'exact' })
      .eq('hoa_id', hoaId)
      .gte('created_at', `${month}-01`)
      .lt('created_at', `${month}-31`)
}

export const complaintQueries = {
  getByHoaId: (hoaId: string) =>
    supabase
      .from('complaints')
      .select('*')
      .eq('hoa_id', hoaId)
      .order('created_at', { ascending: false }),

  create: (complaint: Omit<Complaint, 'id' | 'created_at'>) =>
    supabase
      .from('complaints')
      .insert(complaint)
      .select()
      .single(),

  update: (id: string, updates: Partial<Complaint>) =>
    supabase
      .from('complaints')
      .update(updates)
      .eq('id', id)
      .select()
      .single(),

  getByStatus: (hoaId: string, status: Complaint['status']) =>
    supabase
      .from('complaints')
      .select('*')
      .eq('hoa_id', hoaId)
      .eq('status', status)
      .order('created_at', { ascending: false })
}