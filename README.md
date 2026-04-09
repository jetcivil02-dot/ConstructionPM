# Construction Log Management System

A modern web application for managing construction site operations including attendance tracking, work task logging, and progress monitoring.

## Features

### Core Functionality
- **Attendance Management** - Daily check-in/out with OT tracking
- **Task Logging** - Record construction work with quantities and units
- **History & Reports** - View and filter completed work tasks
- **Role-Based Access** - Different permissions for Foreman, Admin, Subcontractor, etc.
- **Real-time Calculations** - Automatic labor cost calculations including OT

### Technical Features
- **Secure Authentication** - Email/password auth with session management
- **Database Security** - Row-level security (RLS) policies
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Real-time Sync** - Data syncs across all sessions
- **Performance Optimized** - Indexed queries and efficient data retrieval

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth |
| Routing | React Router |
| Icons | Lucide React |
| Build | Vite |

## Getting Started

### Quick Start
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

The app will be available at `http://localhost:5173`

### First-Time Setup
1. See [DEMO_SETUP.md](./DEMO_SETUP.md) for creating demo users
2. See [SETUP.md](./SETUP.md) for complete installation guide

## Usage

### For Foreman
- Check attendance for workers
- Track OT hours
- Create and edit work tasks
- Monitor crew performance

### For Subcontractors
- Submit own work tasks
- View task history
- Track completed work

### For Admin
- Manage crew groups and workers
- Set work cycles
- Configure system settings
- View all data and reports

## Project Structure

```
src/
├── components/
│   └── Navigation.tsx         # Main navigation bar
├── hooks/
│   └── useAuth.ts            # Authentication hook
├── lib/
│   └── supabase.ts           # Supabase setup & types
├── pages/
│   ├── Admin.tsx             # Administration panel
│   ├── Attendance.tsx        # Attendance management
│   ├── History.tsx           # Task history
│   ├── Login.tsx             # Login page
│   └── Tasks.tsx             # Task entry
├── App.tsx                   # Main app component
└── main.tsx                  # Entry point
```

## Database Schema

### Key Tables
- **user_roles** - User roles and permissions
- **crew_groups** - Subcontractor teams
- **crew_members** - Individual workers
- **attendance_records** - Daily attendance & OT
- **work_tasks** - Construction work entries
- **cycle_settings** - Work cycle configuration

All tables include Row-Level Security policies for data protection.

## User Roles

| Role | Permissions |
|------|------------|
| **Dev** | Full system access, manage groups, set cycles |
| **Foreman** | Attendance, task management, worker management |
| **Engineer** | Add workers, view tasks, manage attendance |
| **PM** | View-only access to tasks and reports |
| **Sub-con** | Submit own tasks, limited visibility |

## Key Features Explained

### Attendance System
- Mark workers as Present/Late/Absent
- Track overtime (OT) hours
- Automatic cost calculation
- Bulk OT assignment

### Task Management
- Create work tasks with quantities
- Track by crew group and date
- Edit tasks with change notes
- Filter by date range

### Admin Panel
- Create and manage crew groups
- Add/remove workers
- Set work cycle dates
- 14-day auto-cycle option

## Security

- **Authentication**: Email/password with Supabase Auth
- **Authorization**: Role-based access control (RBAC)
- **Data Protection**: Row-Level Security (RLS) policies
- **Session Management**: Automatic JWT token handling

## Performance

- Indexed database queries for fast retrieval
- Efficient client-side caching
- Optimized React components
- Gzipped assets (100KB gzipped)

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Development

### Available Scripts
```bash
npm run dev       # Start dev server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
npm run typecheck # Check TypeScript types
```

### Environment Variables
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## API Integration

The app communicates with Supabase via:
- **Supabase JS Client** - For real-time data
- **PostgreSQL RLS** - For security
- **Auth API** - For user management

No custom backend server needed - all logic is in the database.

## Data Models

### Attendance Record
```typescript
{
  crew_group_id: string;
  crew_member_id: string;
  attendance_date: string;
  status: 'Present' | 'Absent' | 'Late';
  work_shift: 'ปกติ' | 'โอที';
  ot_hours: number;
}
```

### Work Task
```typescript
{
  work_date: string;
  task_name: string;
  quantity: number;
  unit: string;
  crew_group_id: string;
  status: 'Submitted' | 'Approved' | 'Rejected';
  is_edited: boolean;
  edit_note?: string;
}
```

## Deployment

### Vercel/Netlify
1. Push to GitHub
2. Connect repository to Vercel/Netlify
3. Set environment variables
4. Deploy

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## Troubleshooting

**Login fails?**
- Check email/password in Supabase
- Verify user has role assigned in user_roles table

**Can't see crew groups?**
- Admin must create groups first
- Check RLS policies allow access

**Permission denied errors?**
- Verify user role in user_roles table
- Check RLS policies in database

## Contributing

This is an internal project. Contact system admin for changes.

## License

Internal use only.

## Support

For help, refer to:
- [SETUP.md](./SETUP.md) - Installation guide
- [DEMO_SETUP.md](./DEMO_SETUP.md) - Demo user setup
- Supabase Dashboard for database inspection

---

**Version**: 1.0.0
**Last Updated**: 2026-04-09
