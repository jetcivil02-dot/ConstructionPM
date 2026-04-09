import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'Sub-con' | 'Foreman' | 'Engineer' | 'PM' | 'Dev';

export interface UserProfile {
  user_id: string;
  role: UserRole;
  crew_group_id?: string;
}

export interface CrewGroup {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CrewMember {
  id: string;
  crew_group_id: string;
  name: string;
  gender: 'ช' | 'ญ';
  rate_per_day: number;
  created_at: string;
  updated_at: string;
}

export interface AttendanceRecord {
  id: string;
  crew_group_id: string;
  crew_member_id: string;
  attendance_date: string;
  status: 'Present' | 'Absent' | 'Late';
  check_in_time?: string;
  work_shift: 'ปกติ' | 'โอที';
  ot_hours: number;
  recorded_by: string;
  created_at: string;
  updated_at: string;
}

export interface WorkTask {
  id: string;
  work_date: string;
  task_name: string;
  quantity: number;
  unit: string;
  crew_group_id: string;
  created_by: string;
  status: 'Submitted' | 'Approved' | 'Rejected';
  is_edited: boolean;
  edit_note?: string;
  approved_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CycleSettings {
  id: string;
  cycle_start_date: string;
  cycle_end_date: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}
