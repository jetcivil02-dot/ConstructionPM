import { useEffect, useState } from 'react';
import { supabase, WorkTask, CrewGroup } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Trash2, Loader } from 'lucide-react';

export function Tasks() {
  const { session } = useAuth();
  const [tasks, setTasks] = useState<WorkTask[]>([]);
  const [groups, setGroups] = useState<CrewGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [taskName, setTaskName] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [unit, setUnit] = useState('ตร.ม.');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNote, setEditNote] = useState('');

  useEffect(() => {
    loadGroups();
    loadTasks();
  }, [date]);

  useEffect(() => {
    if (groups.length > 0 && !selectedGroup) {
      setSelectedGroup(groups[0].id);
    }
  }, [groups]);

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
        .eq('work_date', date)
        .order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTask = async () => {
    if (!taskName || quantity <= 0 || !selectedGroup || !session?.user) return;

    setSaving(true);
    try {
      if (editingId) {
        const { error } = await supabase
          .from('work_tasks')
          .update({
            task_name: taskName,
            quantity,
            unit,
            is_edited: true,
            edit_note: editNote,
          })
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('work_tasks')
          .insert({
            work_date: date,
            task_name: taskName,
            quantity,
            unit,
            crew_group_id: selectedGroup,
            created_by: session.user.id,
          });
        if (error) throw error;
      }

      setTaskName('');
      setQuantity(0);
      setEditNote('');
      setEditingId(null);
      await loadTasks();
    } catch (err) {
      console.error('Error saving task:', err);
      alert('Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this task?')) return;
    try {
      const { error } = await supabase.from('work_tasks').delete().eq('id', id);
      if (error) throw error;
      await loadTasks();
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const handleEdit = (task: WorkTask) => {
    setEditingId(task.id);
    setDate(task.work_date);
    setTaskName(task.task_name);
    setQuantity(task.quantity);
    setUnit(task.unit);
    setEditNote(task.edit_note || '');
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h1 className="text-2xl font-bold mb-6">Work Tasks</h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
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
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Name
            </label>
            <input
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="e.g., Brick work"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
            <input
              type="number"
              step="0.01"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option>ตร.ม.</option>
              <option>ตร.ว.</option>
              <option>ม.</option>
              <option>คิว (ลบ.ม.)</option>
              <option>แผ่น</option>
            </select>
          </div>
          {editingId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Edit Note
              </label>
              <input
                type="text"
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSaveTask}
            disabled={saving || !taskName || quantity <= 0}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            {saving && <Loader className="w-4 h-4 animate-spin" />}
            {editingId ? 'Update Task' : 'Add Task'}
          </button>
          {editingId && (
            <button
              onClick={() => {
                setEditingId(null);
                setTaskName('');
                setQuantity(0);
                setEditNote('');
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          )}
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
                <div>
                  <p className="font-semibold text-gray-900">{task.task_name}</p>
                  <p className="text-sm text-gray-600">
                    {task.quantity.toFixed(2)} {task.unit}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(task)}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {task.is_edited && (
                <p className="text-xs text-yellow-600 mt-2">Edited: {task.edit_note}</p>
              )}
            </div>
          ))}
          {tasks.length === 0 && (
            <p className="text-center text-gray-600 py-8">No tasks for this date</p>
          )}
        </div>
      )}
    </div>
  );
}
