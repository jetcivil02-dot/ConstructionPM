# Construction Log - Command Reference

## Development Commands

### Start Development Server
```bash
npm run dev
```
Opens on `http://localhost:5173`

### Build for Production
```bash
npm run build
```
Creates optimized build in `dist/` folder

### Preview Production Build
```bash
npm run preview
```
Test production build locally

### Type Check
```bash
npm run typecheck
```
Check TypeScript errors (runs on build)

### Lint Code
```bash
npm run lint
```
Run ESLint to check code quality

## Database Commands

### View Database Tables
In Supabase SQL Editor:
```sql
-- List all tables
SELECT tablename FROM pg_tables WHERE schemaname='public';

-- View user_roles
SELECT * FROM user_roles;

-- View crew_groups
SELECT * FROM crew_groups;

-- View crew_members
SELECT * FROM crew_members;
```

### Query Attendance
```sql
-- Get attendance for a date
SELECT * FROM attendance_records 
WHERE attendance_date = '2026-04-09'
ORDER BY crew_group_id;

-- Total cost calculation
SELECT 
  crew_group_id,
  attendance_date,
  SUM(
    CASE WHEN status = 'Present' 
      THEN rate_per_day + ((rate_per_day / 8) * ot_hours)
      ELSE 0 
    END
  ) as total_cost
FROM attendance_records ar
JOIN crew_members cm ON ar.crew_member_id = cm.id
GROUP BY crew_group_id, attendance_date;
```

### Query Tasks
```sql
-- Get tasks for a date range
SELECT * FROM work_tasks
WHERE work_date BETWEEN '2026-04-01' AND '2026-04-30'
ORDER BY work_date DESC;

-- Tasks by crew group
SELECT 
  t.work_date,
  t.task_name,
  t.quantity,
  t.unit,
  cg.name as crew_group
FROM work_tasks t
JOIN crew_groups cg ON t.crew_group_id = cg.id
ORDER BY t.work_date DESC;
```

## User Management Commands

### Create User in SQL
```sql
-- First create in Auth, then assign role
INSERT INTO user_roles (user_id, role) VALUES
  ('user-uuid', 'Foreman');
```

### List All Users & Roles
```sql
SELECT u.id, u.email, ur.role
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
ORDER BY u.created_at DESC;
```

### Delete User (careful!)
```sql
-- User will cascade delete from all tables
DELETE FROM auth.users WHERE id = 'user-uuid';
```

## Data Management

### Export Tasks to CSV Format
```sql
SELECT 
  work_date,
  task_name,
  quantity,
  unit,
  cg.name as crew_group,
  status,
  is_edited,
  created_at
FROM work_tasks t
JOIN crew_groups cg ON t.crew_group_id = cg.id
ORDER BY work_date DESC;
```

### Clear Demo Data (destructive!)
```sql
-- Delete all data but keep structure
TRUNCATE TABLE attendance_records;
TRUNCATE TABLE work_tasks;
TRUNCATE TABLE crew_members;
TRUNCATE TABLE crew_groups;
TRUNCATE TABLE cycle_settings;
TRUNCATE TABLE user_roles;
```

## Deployment Commands

### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set env vars and follow prompts
```

### Deploy to Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

### Build Docker Image
```bash
docker build -t construction-log .
docker run -p 3000:3000 construction-log
```

## Troubleshooting Commands

### Check Supabase Connection
```bash
# Test in browser console
supabase.from('crew_groups').select('*').limit(1)
```

### View Recent Errors
In Supabase Dashboard → Logs:
- Auth logs
- Database logs
- Edge function logs

### Check Build Status
```bash
npm run build 2>&1 | tail -20
```

### Verify Types
```bash
npm run typecheck
```

## Database Migration Commands

### Apply New Migration
```sql
-- Example: Add new column
ALTER TABLE crew_members ADD COLUMN phone_number VARCHAR(20);
```

### View Migration History
In Supabase Dashboard → SQL Editor:
```sql
SELECT * FROM schema_migrations ORDER BY name DESC;
```

## Backup & Restore

### Export Database
In Supabase:
1. Settings → Database → Backups
2. Download backup file

### Backup Specific Table
```sql
-- Create backup table
CREATE TABLE work_tasks_backup AS SELECT * FROM work_tasks;
```

## Performance Commands

### Check Database Indexes
```sql
SELECT 
  schemaname,
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename;
```

### Check Table Sizes
```sql
SELECT 
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Analyze Query Performance
```sql
EXPLAIN ANALYZE
SELECT * FROM work_tasks
WHERE work_date = '2026-04-09'
ORDER BY created_at DESC;
```

## Development Utilities

### Format Code
```bash
# Using ESLint fix
npm run lint -- --fix
```

### Update Dependencies
```bash
npm update
npm outdated  # Check for updates
```

### Clean Build Cache
```bash
rm -rf dist/ node_modules/
npm install
npm run build
```

## Monitoring Commands

### Check App Logs
```bash
# Development
npm run dev 2>&1 | tee app.log

# Production (Vercel/Netlify provides logs)
```

### Monitor Database Connections
In Supabase Dashboard → Database → Connections

### View RLS Policy Violations
In Supabase Dashboard → SQL Editor:
```sql
SELECT * FROM pgsql_errors_log 
WHERE error_level = 'ERROR'
ORDER BY error_time DESC
LIMIT 50;
```

## Useful npm Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for prod
npm run preview          # Preview build
npm run typecheck        # TypeScript check
npm run lint             # ESLint check
npm run lint -- --fix    # Fix linting issues

# Package Management
npm install              # Install dependencies
npm update              # Update all packages
npm audit               # Check vulnerabilities
npm audit fix           # Fix vulnerabilities
```

## Git Commands

```bash
# Check status
git status

# View changes
git diff

# Commit changes (auto-managed by system)
# Don't manually commit - system handles this

# View log
git log --oneline
```

---

All commands are for the Construction Log Management System v1.0.0
