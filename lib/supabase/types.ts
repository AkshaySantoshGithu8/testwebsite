// Database types for the portfolio
export interface Project {
  id: string
  title: string
  slug: string
  category: string | null
  role: string | null
  year: number | null
  color: string | null
  image: string | null
  description: string | null
  tools: string[] | null
  timeline: string | null
  kpi: string | null
  github_url: string | null
  live_url: string | null
  featured: boolean
  order: number
  created_at: string
  updated_at: string
}

export interface Inquiry {
  id: string
  name: string
  email: string
  subject: string | null
  message: string
  status: 'new' | 'read' | 'replied'
  created_at: string
  updated_at: string
}

export type InquiryInsert = Omit<Inquiry, 'id' | 'status' | 'created_at' | 'updated_at'>
