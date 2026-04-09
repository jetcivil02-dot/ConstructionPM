import { useEffect, useState } from 'react';
import { supabase, CrewGroup, CrewMember, AttendanceRecord } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Plus, Loader } from 'lucide-react';

export function Attendance() {
  const { profile } = useAuth();
  const [groups, setGroups] = useState<CrewGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [members, setMembers] = useState<CrewMember[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceRecord>>({});
  const [saving, setSaving] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [newMember, setNewMember] = useState({ name: '', gender: 'ช' as 'ช' | 'ญ', rate: 0 });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (profile?.role === 'Foreman' || profile?.role === 'Dev') {
      loadGroups();
    }
  }, [profile]);

  useEffect(() => {
    if (selectedGroup) {
      loadMembers();
      loadAttendance();
    }
  }, [selectedGroup, date]);

  const loadGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('crew_groups')
        .select('*')
        .order('name');
      if (error) throw error;
      setGroups(data || []);
      if (data?.length > 0) {
        setSelectedGroup(data[0].id);
      }
    } catch (err) {
      console.error('Error loading groups:', err);
    }
  };

  const loadMembers = async () => {
    if (!selectedGroup) return;
    try {
      const { data, error } = await supabase
        .from('crew_members')
        .select('*')
        .eq('crew_group_id', selectedGroup)
        .order('name');
      if (error) throw error;
      setMembers(data || []);
    } catch (err) {
      console.error('Error loading members:', err);
    }
  };

  const loadAttendance = async () => {
    if (!selectedGroup) return;
    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('crew_group_id', selectedGroup)
        .eq('attendance_date', date);
      if (error) throw error;
      const recordMap: Record<string, AttendanceRecord> = {};
      (data || []).forEach((record) => {
        recordMap[record.crew_member_id] = record;
      });
      setAttendance(recordMap);
    } catch (err) {
      console.error('Error loading attendance:', err);
    }
  };

  const handleStatusChange = (memberId: string, status: 'Present' | 'Absent' | 'Late') => {
    const existing = attendance[memberId] || {
      crew_member_id: memberId,
      attendance_date: date,
      crew_group_id: selectedGroup,
      work_shift: 'ปกติ' as const,
      ot_hours: 0,
      check_in_time: undefined,
    };
    setAttendance({
      ...attendance,
      [memberId]: {
        ...existing,
        status,
        check_in_time: status === 'Absent' ? undefined : '09:00',
      } as any,
    });
  };

  const handleOTChange = (memberId: string, hours: number) => {
    const existing = attendance[memberId];
    if (existing) {
      setAttendance({
        ...attendance,
        [memberId]: {
          ...existing,
          ot_hours: hours,
          work_shift: hours > 0 ? 'โอที' : 'ปกติ',
        } as any,
      });
    }
  };

  const handleSave = async () => {
    if (!selectedGroup) return;
    setSaving(true);
    try {
      const records = members
        .map((member) => {
          const record = attendance[member.id];
          return {
            id: record?.id || undefined, // Include existing ID for upsert, or undefined for new records
            crew_group_id: selectedGroup,
            crew_member_id: member.id,
            attendance_date: date,
            status: record?.status || 'Absent',
            check_in_time: record?.check_in_time,
            work_shift: record?.work_shift || 'ปกติ',
            ot_hours: record?.ot_hours || 0,
            recorded_by: profile?.user_id, // Ensure recorded_by is set
          };
        });

      const { error } = await supabase
        .from('attendance_records')
        .upsert(records);
      if (error) throw error;
      alert('Attendance saved successfully!');
      await loadAttendance();
    } catch (err) {
      console.error('Error saving attendance:', err);
      alert('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const handleAddMember = async () => {
    if (!selectedGroup || !newMember.name) return;
    try {
      const { error } = await supabase
        .from('crew_members')
        .insert({
          crew_group_id: selectedGroup,
          name: newMember.name,
          gender: newMember.gender,
          rate_per_day: newMember.rate,
        });
      if (error) throw error;
      setNewMember({ name: '', gender: 'ช', rate: 0 });
      setShowAddForm(false);
      await loadMembers();
    } catch (err) {
      console.error('Error adding member:', err);
    }
  };

  if (!profile || profile.role !== 'Foreman') {
    return (
      <div className="p-4 text-center text-gray-600">
        Only Foreman can access attendance
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h1 className="text-2xl font-bold mb-6">Attendance</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Crew Group
            </label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Select group</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {showAddForm && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
            <h3 className="font-semibold mb-4">Add New Member</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Name"
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <select
                value={newMember.gender}
                onChange={(e) => setNewMember({ ...newMember, gender: e.target.value as 'ช' | 'ญ' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="ช">Male</option>
                <option value="ญ">Female</option>
              </select>
              <input
                type="number"
                placeholder="Daily Rate"
                value={newMember.rate}
                onChange={(e) => setNewMember({ ...newMember, rate: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddMember}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="mb-6 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" />
            Add Member
          </button>
        )}
      </div>

      <div className="space-y-4 mb-6">
        {members.map((member) => {
          const record = attendance[member.id];
          const status = record?.status || 'Absent';
          return (
            <div
              key={member.id}
              className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-semibold text-gray-900">{member.name}</p>
                  <p className="text-sm text-gray-600">
                    {member.gender === 'ช' ? 'Male' : 'Female'} • ฿{member.rate_per_day}/day
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mb-3">
                {['Present', 'Late', 'Absent'].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(member.id, s as any)}
                    className={`flex-1 py-2 px-3 rounded-lg transition text-sm font-medium ${
                      status === s
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {status !== 'Absent' && (
                <div className="flex gap-2">
                  <label className="text-sm text-gray-600">OT Hours:</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={record?.ot_hours || 0}
                    onChange={(e) => handleOTChange(member.id, Number(e.target.value))}
                    className="w-20 px-2 py-1 border border-gray-300 rounded"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={handleSave}
        disabled={saving || !selectedGroup}
        className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {saving && <Loader className="w-5 h-5 animate-spin" />}
        {saving ? 'Saving...' : 'Save Attendance'}
      </button>
    </div>
  );
}
