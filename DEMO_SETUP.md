# Demo Setup Instructions

## Quick Start - Creating Demo Users

Follow these steps to set up demo users and test data for the Construction Log system.

### Step 1: Create User Accounts in Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** → **Users**
4. Click **+ Add user** and create these accounts:

```
Email: foreman@test.com
Password: TestPass123!
```

```
Email: subcon@test.com
Password: TestPass123!
```

```
Email: admin@test.com
Password: TestPass123!
```

```
Email: engineer@test.com
Password: TestPass123!
```

### Step 2: Assign Roles to Users

After creating users, assign their roles via the SQL Editor:

1. Go to **SQL Editor** in Supabase
2. Run this query to assign roles (replace user IDs):

```sql
-- Get user IDs first
SELECT id, email FROM auth.users;

-- Then assign roles (use actual UUIDs from above)
INSERT INTO user_roles (user_id, role) VALUES
  ('user-uuid-for-foreman', 'Foreman'),
  ('user-uuid-for-subcon', 'Sub-con'),
  ('user-uuid-for-admin', 'Dev'),
  ('user-uuid-for-engineer', 'Engineer');
```

### Step 3: Create Crew Groups

1. Run the app: `npm run dev`
2. Login as **admin@test.com**
3. Go to **Admin** tab
4. Create these crew groups:
   - "Subcontractor A"
   - "Subcontractor B"
   - "Structural Team"

### Step 4: Add Workers to Groups

1. Still in **Admin** tab
2. Add workers to each group (example for Subcontractor A):
   - Name: "Worker 1", Gender: Male (ช), Rate: 800 THB
   - Name: "Worker 2", Gender: Female (ญ), Rate: 750 THB
   - Name: "Worker 3", Gender: Male (ช), Rate: 850 THB

### Step 5: Test the System

#### Test as Foreman
1. Logout and login as **foreman@test.com**
2. Go to **Attendance** tab
3. Select a crew group and date
4. Mark attendance for workers
5. Add some OT hours
6. Click "Save Attendance"

#### Test as Subcontractor
1. Logout and login as **subcon@test.com**
2. Go to **Tasks** tab
3. Add a work task:
   - Date: Today
   - Task: "Brick laying"
   - Quantity: 25.5
   - Unit: ตร.ม.
4. Click "Add Task"

#### Test as Admin
1. Logout and login as **admin@test.com**
2. Go to **Admin** tab
3. View crew groups
4. Set a work cycle (e.g., 14 days)
5. Go to **History** tab to see all tasks

### Sample Test Data

**Crew Groups:**
- Subcontractor A (workers: 3)
- Subcontractor B (workers: 2)
- Structural Team (workers: 4)

**Daily Rates (THB):**
- Regular worker: 750-850
- Skilled worker: 900-1000
- Senior worker: 1100-1500

**Work Tasks Examples:**
- Brick laying - ตร.ม.
- Concrete pouring - ลบ.ม.
- Welding - เส้น
- Painting - ตร.ม.
- Installation - ชุด

## Testing Scenarios

### Scenario 1: Daily Attendance
1. Login as Foreman
2. Check in workers for today
3. Add 2 hours OT for specific workers
4. System should show total cost including OT

**Expected Result:**
- Attendance saved
- Cost calculation includes: (Base Rate + OT surcharge)
- OT surcharge = (Base Rate / 8) × Hours

### Scenario 2: Task Entry & Edit
1. Login as Subcontractor
2. Enter a work task
3. Edit the task and add note
4. Check History to see edit marker

**Expected Result:**
- Task appears with "Edited" label
- Edit note is visible
- Edit date/time recorded

### Scenario 3: Role-Based Access
1. Try accessing Admin as Subcontractor
2. Should get permission denied message
3. Login as Admin and confirm access

**Expected Result:**
- Different roles see different menus
- Unauthorized access is blocked
- Navigation reflects user permissions

### Scenario 4: Cycle Management
1. Login as Admin
2. Set a new work cycle
3. Use "Auto 14 Days" button
4. Save cycle

**Expected Result:**
- Cycle dates saved
- History filtered within cycle
- Summary shows data for cycle period

## Troubleshooting Demo Setup

### Issue: "User not found in user_roles"
**Solution:** Make sure role was inserted for the user's UUID

### Issue: "Crew groups not showing"
**Solution:** Create groups in Admin panel as Dev/Admin user

### Issue: Authentication fails
**Solution:** Verify email and password match what you created

### Issue: "Permission denied" errors
**Solution:** Check user_roles table and RLS policies

## Data Cleanup

To reset demo data and start fresh:

```sql
-- Clear all data (careful - this is permanent!)
DELETE FROM attendance_records;
DELETE FROM work_tasks;
DELETE FROM crew_members;
DELETE FROM crew_groups;
DELETE FROM cycle_settings;
DELETE FROM user_roles;

-- Keep auth users intact unless you want to delete them too
```

## Next Steps

Once demo is working:
1. Create actual user accounts for your team
2. Set up real crew groups and workers
3. Configure work cycles for your project
4. Start entering attendance and tasks
5. Use History tab to generate reports

## Support

For issues or questions about the demo setup, check the main SETUP.md file or contact your system administrator.
