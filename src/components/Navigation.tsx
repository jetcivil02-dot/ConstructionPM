import { useLocation, useNavigate, NavLink as RouterNavLink } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { UserRole } from '../lib/supabase';
import { LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface NavigationProps {
  role: UserRole | null;
}

export function Navigation({ role }: NavigationProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const roleLabel = {
    'Sub-con': 'Subcontractor',
    'Foreman': 'Foreman',
    'Engineer': 'Engineer',
    'PM': 'Project Manager',
    'Dev': 'Administrator',
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              C
            </div>
            <h1 className="text-xl font-bold text-gray-900 hidden sm:block">Construction Log</h1>
          </div>

          <div className="hidden md:flex items-center gap-2">
            {role && (
              <>
                <NavLink
                  href="/tasks"
                  active={isActive('/tasks')}
                  label="Tasks"
                />
                {role !== 'Sub-con' && (
                  <>
                    <NavLink
                      href="/attendance"
                      active={isActive('/attendance')}
                      label="Attendance"
                    />
                    <NavLink
                      href="/history"
                      active={isActive('/history')}
                      label="History"
                    />
                  </>
                )}
                {(role === 'Dev' || role === 'Foreman') && (
                  <NavLink
                    href="/admin"
                    active={isActive('/admin')}
                    label="Admin"
                  />
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            {role && (
              <div className="text-right hidden sm:block">
                <p className="text-xs text-gray-600">Role</p>
                <p className="text-sm font-semibold text-gray-900">{roleLabel[role]}</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-gray-100 rounded-lg transition flex items-center gap-2 text-gray-700 text-sm"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              {mobileOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-gray-200 py-3 space-y-2">
            {role && (
              <>
                <MobileNavLink
                  href="/tasks"
                  active={isActive('/tasks')}
                  label="Tasks"
                />
                {role !== 'Sub-con' && (
                  <>
                    <MobileNavLink
                      href="/attendance"
                      active={isActive('/attendance')}
                      label="Attendance"
                    />
                    <MobileNavLink
                      href="/history"
                      active={isActive('/history')}
                      label="History"
                    />
                  </>
                )}
                {(role === 'Dev' || role === 'Foreman') && (
                  <MobileNavLink
                    href="/admin"
                    active={isActive('/admin')}
                    label="Admin"
                  />
                )}
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

function NavLink({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <RouterNavLink
      to={href}
      className={`px-4 py-2 rounded-lg transition ${
        active
          ? 'bg-blue-100 text-blue-700 font-medium'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {label}
    </RouterNavLink>
  );
}

function MobileNavLink({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <RouterNavLink
      to={href}
      className={`block px-4 py-2 rounded-lg transition ${
        active
          ? 'bg-blue-100 text-blue-700 font-medium'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {label}
    </RouterNavLink>
  );
}
