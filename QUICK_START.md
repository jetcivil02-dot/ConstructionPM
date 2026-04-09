# Construction Log - Quick Start Guide

## 5-Minute Setup

### 1. Start Development Server
```bash
npm install
npm run dev
```
Visit: `http://localhost:5173`

### 2. Create First User
Go to Supabase Dashboard → Authentication:
- Email: `foreman@test.com`
- Password: `TestPass123!`

### 3. Assign Role in Supabase SQL Editor
```sql
-- Find your user ID
SELECT id FROM auth.users WHERE email = 'foreman@test.com';

-- Assign role (replace UUID)
INSERT INTO user_roles (user_id, role) VALUES ('paste-uuid-here', 'Foreman');
```

### 4. Login and Test
- Login with `foreman@test.com`
- Go to **Admin** tab
- Create a crew group: "Test Team"
- Add workers with rates

### 5. Try Features
- **Attendance**: Check in workers for today
- **Tasks**: Log construction work
- **History**: View all submitted tasks

## Key Pages

| Page | Access | Purpose |
|------|--------|---------|
| **Login** | Public | Authentication |
| **Attendance** | Foreman+ | Check attendance & OT |
| **Tasks** | Everyone | Log work tasks |
| **History** | Everyone | View task history |
| **Admin** | Dev/Foreman | Manage system |

## Common Tasks

### Add a Worker
1. **Admin** → Create crew group
2. Click "Add Member"
3. Enter: Name, Gender, Daily Rate
4. Save

### Record Attendance
1. **Attendance** → Select group & date
2. Mark each worker: Present/Late/Absent
3. Add OT hours (optional)
4. Click "Save Attendance"

### Log Work Task
1. **Tasks** → Enter date & task name
2. Enter quantity & unit
3. Click "Add Task"

### Set Work Cycle
1. **Admin** → Enter start date
2. Click "Auto 14 Days" (or set manually)
3. Click "Save Cycle"

## User Roles Quick Reference

**Dev** (Admin)
- Create groups ✓
- Manage workers ✓
- Set cycles ✓
- See all data ✓

**Foreman** (Site Manager)
- Check attendance ✓
- Add workers ✓
- Log tasks ✓
- See crew data ✓

**Sub-con** (Worker)
- Log own tasks ✓
- See own work ✓

## Test Credentials

After setup:
```
foreman@test.com / TestPass123!
subcon@test.com / TestPass123!
admin@test.com / TestPass123!
```

## Cost Calculation

Daily rate: 800 THB
OT rate: (800 ÷ 8) × hours = 100 × hours

Example:
- 1 day present: 800 THB
- 1 day + 2 hours OT: 800 + (100 × 2) = 1000 THB

## Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Login fails | Check user created in Supabase Auth |
| No groups show | Create in Admin panel |
| "Permission denied" | Check user role in user_roles table |
| Can't see tasks | Filter by correct date range |

## What's Included

✓ Full attendance tracking system
✓ Task logging with editing
✓ Role-based access control
✓ Real-time cost calculations
✓ Date filtering & history
✓ Mobile responsive design
✓ Secure authentication
✓ Database RLS security

## Next Steps

1. Create all user accounts
2. Set up crew groups
3. Add all workers
4. Configure work cycle
5. Start using the system!

## Support

- Full documentation: [SETUP.md](./SETUP.md)
- Demo setup: [DEMO_SETUP.md](./DEMO_SETUP.md)
- Main README: [README.md](./README.md)

---

**Ready to go!** Start with the dev server and create your first crew group. 🚀
