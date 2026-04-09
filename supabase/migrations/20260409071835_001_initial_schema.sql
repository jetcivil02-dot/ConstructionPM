/*
  # Construction Log Management System - Initial Schema

  1. Users and Authentication
    - Uses Supabase built-in auth.users
    - user_roles table for role management
  
  2. Core Tables
    - crew_groups: Subcontractor teams/groups
    - crew_members: Workers in each group
    - attendance_records: Daily check-in/check-out
    - work_tasks: Construction work entries
    - cycle_settings: Admin cycle cutoff dates
  
  3. Security
    - RLS enabled on all tables
    - Policies restrict access by role and ownership
    - Sensitive data protected
*/

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('Sub-con', 'Foreman', 'Engineer', 'PM', 'Dev')),
  crew_group_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create crew_groups table
CREATE TABLE IF NOT EXISTS crew_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create crew_members table
CREATE TABLE IF NOT EXISTS crew_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_group_id uuid NOT NULL REFERENCES crew_groups(id) ON DELETE CASCADE,
  name text NOT NULL,
  gender text NOT NULL CHECK (gender IN ('ช', 'ญ')),
  rate_per_day numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create attendance_records table
CREATE TABLE IF NOT EXISTS attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_group_id uuid NOT NULL REFERENCES crew_groups(id) ON DELETE CASCADE,
  crew_member_id uuid NOT NULL REFERENCES crew_members(id) ON DELETE CASCADE,
  attendance_date date NOT NULL,
  status text NOT NULL CHECK (status IN ('Present', 'Absent', 'Late')),
  check_in_time time,
  work_shift text DEFAULT 'ปกติ' CHECK (work_shift IN ('ปกติ', 'โอที')),
  ot_hours numeric DEFAULT 0,
  recorded_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(crew_group_id, crew_member_id, attendance_date)
);

-- Create work_tasks table
CREATE TABLE IF NOT EXISTS work_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_date date NOT NULL,
  task_name text NOT NULL,
  quantity numeric NOT NULL,
  unit text NOT NULL,
  crew_group_id uuid NOT NULL REFERENCES crew_groups(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text DEFAULT 'Submitted' CHECK (status IN ('Submitted', 'Approved', 'Rejected')),
  is_edited boolean DEFAULT false,
  edit_note text,
  approved_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create cycle_settings table
CREATE TABLE IF NOT EXISTS cycle_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_start_date date NOT NULL,
  cycle_end_date date NOT NULL,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE cycle_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own role"
  ON user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own role"
  ON user_roles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Dev can view all roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'Dev'
    )
  );

-- RLS Policies for crew_groups
CREATE POLICY "All authenticated users can view crew groups"
  ON crew_groups FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Dev and Foreman can create crew groups"
  ON crew_groups FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role IN ('Dev', 'Foreman')
    )
  );

CREATE POLICY "Dev and Foreman can update crew groups"
  ON crew_groups FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role IN ('Dev', 'Foreman')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role IN ('Dev', 'Foreman')
    )
  );

-- RLS Policies for crew_members
CREATE POLICY "All authenticated can view crew members"
  ON crew_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Dev and Foreman can manage crew members"
  ON crew_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role IN ('Dev', 'Foreman', 'Engineer')
    )
  );

CREATE POLICY "Dev and Foreman can update crew members"
  ON crew_members FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role IN ('Dev', 'Foreman', 'Engineer')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role IN ('Dev', 'Foreman', 'Engineer')
    )
  );

-- RLS Policies for attendance_records
CREATE POLICY "All authenticated can view attendance"
  ON attendance_records FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Foreman can create attendance"
  ON attendance_records FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'Foreman'
    )
  );

CREATE POLICY "Foreman can update attendance"
  ON attendance_records FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'Foreman'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'Foreman'
    )
  );

-- RLS Policies for work_tasks
CREATE POLICY "All authenticated can view work tasks"
  ON work_tasks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Sub-con can create their own tasks"
  ON work_tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = created_by
  );

CREATE POLICY "Sub-con can update own tasks, others can edit any"
  ON work_tasks FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role IN ('Foreman', 'Engineer', 'PM', 'Dev')
    )
  )
  WITH CHECK (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role IN ('Foreman', 'Engineer', 'PM', 'Dev')
    )
  );

CREATE POLICY "Creators can delete tasks"
  ON work_tasks FOR DELETE
  TO authenticated
  USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role IN ('Foreman', 'Dev')
    )
  );

-- RLS Policies for cycle_settings
CREATE POLICY "All authenticated can view cycle settings"
  ON cycle_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Dev can manage cycle settings"
  ON cycle_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'Dev'
    )
  );

CREATE POLICY "Dev can update cycle settings"
  ON cycle_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'Dev'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'Dev'
    )
  );

-- Create indexes for common queries
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_crew_members_group_id ON crew_members(crew_group_id);
CREATE INDEX idx_attendance_records_date ON attendance_records(attendance_date);
CREATE INDEX idx_attendance_records_group_id ON attendance_records(crew_group_id);
CREATE INDEX idx_work_tasks_date ON work_tasks(work_date);
CREATE INDEX idx_work_tasks_group_id ON work_tasks(crew_group_id);
CREATE INDEX idx_work_tasks_created_by ON work_tasks(created_by);
