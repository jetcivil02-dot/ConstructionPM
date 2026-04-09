import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Navigation } from './components/Navigation';
import { Login } from './pages/Login';
import { Attendance } from './pages/Attendance';
import { Tasks } from './pages/Tasks';
import { History } from './pages/History';
import { Admin } from './pages/Admin';
import { Loader } from 'lucide-react';

function App() {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }



  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {session && <Navigation role={profile?.role || null} />}
        <main className="pb-8">
          <Routes>
            {session ? (
              <>
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/history" element={<History />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/" element={<Navigate to="/tasks" />} />
              </>
            ) : (
              <Route path="*" element={<Login />} />
            )}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
