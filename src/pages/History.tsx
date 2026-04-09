import { useEffect, useState } from 'react';
import { supabase, WorkTask, CrewGroup } from '../lib/supabase';
import { Loader } from 'lucide-react';

export function History() {
  const [tasks, setTasks] = useState<WorkTask[]>([]);
  const [groups, setGroups] = useState<CrewGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedGroup, setSelectedGroup] = useState('');

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    loadTasks();
  }, [startDate, endDate, selectedGroup]);

  const loadGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('crew_groups')
        .select('*')
        .order('name');
      if (error) throw error;
      setGroups(data || []);
    } catch (err) {
      console.error('Error loading groups:', err);
    }
  };

  const loadTasks = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('work_tasks')
        .select('*')
        .gte('work_date', startDate)
        .lte('work_date', endDate)
        .order('work_date', { ascending: false });

      if (selectedGroup) {
        query = query.eq('crew_group_id', selectedGroup);
      }

      const { data, error } = await query;
      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const groupMap = new Map(groups.map((g) => [g.id, g.name]));

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h1 className="text-2xl font-bold mb-6">Work History</h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Crew Group
            </label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Groups</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader className="w-6 h-6 animate-spin text-gray-600" />
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{task.task_name}</p>
                  <p className="text-sm text-gray-600">
                    {groupMap.get(task.crew_group_id) || 'Unknown Group'} • {task.quantity.toFixed(2)} {task.unit}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(task.work_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2 items-start">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      task.status === 'Submitted'
                        ? 'bg-green-100 text-green-700'
                        : task.status === 'Approved'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {task.status}
                  </span>
                  {task.is_edited && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">
                      Edited
                    </span>
                  )}
                </div>
              </div>
              {task.edit_note && (
                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded mt-2">
                  Note: {task.edit_note}
                </p>
              )}
            </div>
          ))}
          {tasks.length === 0 && (
            <p className="text-center text-gray-600 py-8">No tasks found</p>
          )}
        </div>
      )}
    </div>
  );
}
