import { useEffect, useState } from 'react';
import { supabase, CrewGroup } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Plus, Trash2, Loader } from 'lucide-react';

export function Admin() {
  const { profile } = useAuth();
  const [groups, setGroups] = useState<CrewGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [cycleStart, setCycleStart] = useState(new Date().toISOString().split('T')[0]);
  const [cycleEnd, setCycleEnd] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('crew_groups')
        .select('*')
        .order('name');
      if (error) throw error;
      setGroups(data || []);
    } catch (err) {
      console.error('Error loading groups:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName || !profile?.user_id) return;

    setSaving(true);
    try {
      const { error } = await supabase.from('crew_groups').insert({
        name: newGroupName,
        created_by: profile.user_id,
      });
      if (error) throw error;
      setNewGroupName('');
      await loadGroups();
    } catch (err) {
      console.error('Error creating group:', err);
      alert('Failed to create group');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGroup = async (id: string) => {
    if (!confirm('Delete this group and all its members?')) return;
    try {
      const { error } = await supabase.from('crew_groups').delete().eq('id', id);
      if (error) throw error;
      await loadGroups();
    } catch (err) {
      console.error('Error deleting group:', err);
    }
  };

  const handleSetCycle = async () => {
    if (!profile?.user_id) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('cycle_settings').insert({
        cycle_start_date: cycleStart,
        cycle_end_date: cycleEnd,
        created_by: profile.user_id,
      });
      if (error) throw error;
      alert('Cycle settings saved!');
    } catch (err) {
      console.error('Error setting cycle:', err);
    } finally {
      setSaving(false);
    }
  };

  if (profile?.role !== 'Dev' && profile?.role !== 'Foreman') {
    return (
      <div className="p-4 text-center text-gray-600">
        Only Admin can access this section
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Administration</h1>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Crew Groups</h2>

        <div className="mb-6 flex gap-2">
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="Group name (e.g., Subcontractor A)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
          />
          <button
            onClick={handleCreateGroup}
            disabled={saving || !newGroupName}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader className="w-6 h-6 animate-spin text-gray-600" />
          </div>
        ) : (
          <div className="space-y-2">
            {groups.map((group) => (
              <div
                key={group.id}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <p className="font-medium text-gray-900">{group.name}</p>
                <button
                  onClick={() => handleDeleteGroup(group.id)}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {groups.length === 0 && (
              <p className="text-gray-600 text-center py-4">No groups yet</p>
            )}
          </div>
        )}
      </div>

      {profile?.role === 'Dev' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">Work Cycle Settings</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={cycleStart}
                onChange={(e) => setCycleStart(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={cycleEnd}
                onChange={(e) => setCycleEnd(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <button
            onClick={() => {
              const start = new Date(cycleStart);
              const end = new Date(start);
              end.setDate(start.getDate() + 13);
              setCycleEnd(end.toISOString().split('T')[0]);
            }}
            className="w-full mb-4 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
          >
            Auto 14 Days
          </button>

          <button
            onClick={handleSetCycle}
            disabled={saving}
            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            {saving && <Loader className="w-4 h-4 animate-spin" />}
            Save Cycle
          </button>
        </div>
      )}
    </div>
  );
}
