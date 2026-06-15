export interface ProfileData {
  slug: string
  full_name: string | null
  headline: string | null
  location: string | null
  avatar_url: string | null
  is_open_to_work: boolean | null
  linkedin_url?: string | null
  github_url?: string | null
  website_url?: string | null
  contact_email?: string | null
  skills?: string[] | null
}

export interface ExperienceData {
  role: string
  company: string
  sector: string
  years: number
  description?: string | null
}
