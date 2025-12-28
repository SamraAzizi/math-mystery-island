import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type UserRole = "student" | "teacher" | "parent"

export interface Profile {
  id: string
  role: UserRole
  username: string
  grade_level: number
  total_gems: number
  created_at: string
}

export interface Avatar {
  id: string
  user_id: string
  body_type: string
  skin_color: string
  hair_style: string
  outfit: string
  accessories: string[]
  updated_at: string
}

export interface Zone {
  id: string
  name: string
  description: string
  unlock_requirement: number
  order_index: number
  icon: string
}

export interface Puzzle {
  id: string
  zone_id: string
  title: string
  description: string
  puzzle_type: "door_riddle" | "bridge_building" | "treasure_map" | "pattern_path" | "environmental"
  difficulty: number
  grade_level: number
  math_concept: string
  problem_data: {
    question: string
    answer: string | number
    options?: string[]
    image?: string
  }
  hints: string[]
  gems_reward: number
  time_estimate: number
}

export interface UserProgress {
  id: string
  user_id: string
  puzzle_id: string
  completed: boolean
  attempts: number
  hints_used: number
  time_spent: number
  solution_path: Record<string, unknown>
  completed_at: string | null
}
