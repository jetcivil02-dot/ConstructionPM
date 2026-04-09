# Construction Log Management System - Setup Guide

## Overview

This is a full-featured construction site management application built with React, TypeScript, Supabase, and Tailwind CSS. It allows different roles to manage attendance, log work tasks, and track project progress.

## System Architecture

### Database Schema
- **user_roles**: User profile and role management
- **crew_groups**: Subcontractor/worker groups
- **crew_members**: Individual workers with daily rates
- **attendance_records**: Daily check-in/out records with OT tracking
- **work_tasks**: Construction work entries with dates and quantities
- **cycle_settings**: Admin cycle cutoff configuration

### User Roles
1. **Dev (Administrator)** - Full system access
   - Create/manage crew groups
   - Set work cycles
   - View all data

2. **Foreman** - Site supervisor
   - Check attendance
   - Manage workers
   - Create/edit work tasks

3. **Engineer** - Technical supervisor
   - Add workers
   - View all tasks and attendance

4. **PM (Project Manager)** - Project oversight
   - View tasks and reports
   - Monitor progress

5. **Sub-con (Subcontractor)** - Worker entry
   - Submit own work tasks
   - Limited to own entries

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account with active project

### Installation

1. **Environment Setup**
   - Supabase URL and API key are already configured in `.env`
   - These are auto-populated: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Database Initialization**
   - Schema is created via Supabase migrations
   - All RLS policies are automatically configured
   - Tables include proper indexes for performance

### Running the Application

**Development Mode**
```bash
npm run dev
```
The app will be available at `http://localhost:5173`

**Production Build**
```bash
npm run build
npm run preview
```

## How to Use

### First-Time Setup

1. **Create Users in Supabase Auth**
   - Go to Supabase Dashboard → Authentication
   - Add users for each role:
     - foreman@test.com (role: Foreman)
     - subcon@test.com (role: Sub-con)
     - admin@test.com (role: Dev)

2. **Assign Roles**
   - After signup, manually insert role records via Supabase dashboard:
   ```sql
   INSERT INTO user_roles (user_id, role)
   VALUES (user_uuid, 'Foreman');
   ```

3. **Create Crew Groups (Admin/Foreman)**
   - Use Admin panel to create worker groups
   - Add workers to groups with daily rates

### Main Workflows

#### Attendance Management (Foreman)
1. Navigate to **Attendance** tab
2. Select crew group and date
3. Mark each worker as Present/Late/Absent
4. Add OT hours if applicable (optional)
5. Click "Save Attendance"

#### Task Entry (Any Role)
1. Navigate to **Tasks** tab
2. Fill in:
   - Date
   - Task name (e.g., "Brick work")
   - Quantity and unit
   - Crew group
3. Click "Add Task"
4. Edit or delete tasks as needed

#### View History (Admin/Foreman)
1. Navigate to **History** tab
2. Filter by date range and crew group
3. View all submitted tasks with status

#### Administration (Dev/Foreman)
1. Navigate to **Admin** tab
2. Manage crew groups:
   - Create new groups
   - Delete groups
3. Set work cycle:
   - Define start and end dates
   - Or use "Auto 14 Days" button

## Feature Details

### Attendance System
- **Status tracking**: Present, Late, Absent
- **OT calculation**: Automatic based on hours and daily rate
- **Real-time cost**: Shows total labor cost including OT
- **Bulk OT entry**: Apply OT to all workers at once

### Task Management
- **Voice input**: Speak task names (Thai language support)
- **Quantity units**: Pre-configured units (ตร.ม., ม., etc.)
- **Edit tracking**: Marks edits with notes and timestamps
- **Date filtering**: View tasks by date or date range

### Access Control
- **Role-based**: Different permissions for each role
- **RLS policies**: Database-level security
- **Data isolation**: Users see only relevant data

## Security

### Authentication
- Supabase Auth with email/password
- Session management automatic
- JWT tokens for API calls

### Database Security
- Row Level Security (RLS) enabled on all tables
- Policies restrict access by:
  - User ID
  - Role type
  - Crew group membership
- No sensitive data exposed to unauthorized users

## Troubleshooting

### Common Issues

**1. "Only Foreman can access attendance"**
- Make sure user has 'Foreman' role assigned
- Check `user_roles` table in Supabase

**2. No crews showing up**
- Admin must create crew groups first
- Groups are created in Admin tab

**3. Authentication errors**
- Verify Supabase credentials in `.env`
- Check user is confirmed in Supabase Auth

**4. RLS permission denied**
- Ensure user role is correctly set in `user_roles` table
- Check RLS policies match user role

## Performance Notes

- Attendance records indexed by date and crew_group_id
- Work tasks indexed by work_date and created_by
- Pagination recommended for large datasets
- Consider archiving old cycles monthly

## Data Export

To export work tasks for reporting:
```sql
SELECT
  t.work_date,
  t.task_name,
  t.quantity,
  t.unit,
  cg.name as crew_group,
  t.status
FROM work_tasks t
JOIN crew_groups cg ON t.crew_group_id = cg.id
WHERE t.work_date BETWEEN $1 AND $2
ORDER BY t.work_date DESC;
```

## Support & Development

### File Structure
```
src/
  ├── lib/
  │   └── supabase.ts          # Supabase client & types
  ├── hooks/
  │   └── useAuth.ts           # Authentication hook
  ├── components/
  │   └── Navigation.tsx       # Main navigation
  ├── pages/
  │   ├── Login.tsx            # Authentication
  │   ├── Attendance.tsx       # Attendance management
  │   ├── Tasks.tsx            # Task entry
  │   ├── History.tsx          # Task history
  │   └── Admin.tsx            # Administration
  ├── App.tsx                  # Main app with routing
  └── main.tsx                 # Entry point
```

### Tech Stack
- **Frontend**: React 18, TypeScript
- **Database**: Supabase PostgreSQL
- **Auth**: Supabase Auth
- **UI**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router
- **Build**: Vite

## License

This project is built for construction site management. Internal use only.
