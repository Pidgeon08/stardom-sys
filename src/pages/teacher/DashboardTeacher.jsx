import React, { useState, useEffect } from 'react';
import { Users, Music, Clock, CalendarDays, BookOpen } from 'lucide-react';
import { getSchedules, getStudents, getTeachers } from '../../api/core';
import { useAuth } from '../../context/AuthContext';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const generateTimeSlots = () => {
  const slots = [];
  let hour = 7, minute = 30;
  while (hour < 18 || (hour === 18 && minute === 0)) {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour;
    slots.push(`${displayHour}:${minute.toString().padStart(2, '0')} ${period}`);
    minute += 45;
    if (minute >= 60) {
      hour += Math.floor(minute / 60);
      minute = minute % 60;
    }
  }
  return slots;
};

const timeSlots = generateTimeSlots();

export default function DashboardTeacher() {
  const { user } = useAuth();
  const [stats, setStats] = useState([
    { label: 'My Students', value: 0, icon: Users, color: 'bg-green-500' },
    { label: 'Scheduled Sessions', value: 0, icon: CalendarDays, color: 'bg-orange-500' },
  ]);
  const [allSchedules, setAllSchedules] = useState([]);
  const [teacherId, setTeacherId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [schedulesRes, studentsRes, teachersRes] = await Promise.all([
          getSchedules(),
          getStudents(),
          getTeachers(),
        ]);

        const toArray = (res) => Array.isArray(res) ? res : (res?.results || res?.data || []);

        const allTeachers = toArray(teachersRes);
        const currentTeacher = allTeachers.find(t =>
          (t.user?.id || t.user) == user?.id ||
          (t.user?.username || t.username) == user?.username
        );
        const tId = currentTeacher?.id;
        setTeacherId(tId);

        const schedulesList = toArray(schedulesRes);
        setAllSchedules(schedulesList);

        // If teacherId is found, filter by it. Otherwise, show all (permissive fallback)
        const schedules = tId
          ? schedulesList.filter(s => (s.teacher?.id || s.teacher) == tId)
          : schedulesList;

        const allStudents = toArray(studentsRes);
        // Find students that have at least one session with this teacher
        const teacherStudentIds = new Set();
        schedules.forEach(s => {
          const ids = s.student_ids || [];
          ids.forEach(student => {
            const sid = typeof student === 'object' ? student.id : student;
            if (sid) teacherStudentIds.add(sid.toString());
          });
        });

        // If we have teacher-specific schedules, filter students. Otherwise show all.
        const students = tId && teacherStudentIds.size > 0
          ? allStudents.filter(s => teacherStudentIds.has(s.id?.toString()))
          : allStudents;

        setStats([
          { label: 'My Students', value: students.length, icon: Users, color: 'bg-green-500' },
          { label: 'Scheduled Sessions', value: schedules.length, icon: CalendarDays, color: 'bg-orange-500' },
        ]);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user]);

  return (
    <div className="min-h-screen flex w-full">
      <main className="flex-1 p-8 bg-slate-50 overflow-x-hidden">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">{stat.label}</p>
                    <p className="text-3xl font-bold mt-2">{loading ? '—' : stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="text-white" size={24} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Weekly Timetable */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Weekly Timetable</h2>
              <p className="text-sm text-slate-500 mt-1">Full academy schedule with your assigned slots highlighted.</p>
            </div>
            <div className="flex gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 bg-slate-100 border border-slate-200 rounded"></span>
                Other Slots
              </span>
              <span className="flex items-center gap-1.5 text-orange-600">
                <span className="w-3 h-3 bg-orange-50 border border-orange-200 rounded"></span>
                My Slots
              </span>
            </div>
          </div>

          {loading ? (
            <p className="text-gray-400">Loading timetable...</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full border-collapse text-left text-sm min-w-[800px]">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200">
                    <th className="p-3 font-semibold text-slate-600 w-28 border-r border-slate-200">Time Slot</th>
                    {days.map(day => (
                      <th key={day} className="p-3 font-semibold text-slate-700 text-center border-r last:border-r-0 border-slate-200">{day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {timeSlots.map((slot) => (
                    <tr key={slot} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3 font-medium text-slate-500 align-middle text-xs border-r border-slate-200">
                        {slot}
                      </td>
                      {days.map(day => {
                        const slotSchedules = allSchedules.filter(s => s.day === day && s.time === slot);

                        return (
                          <td key={day} className="p-2 border-r last:border-r-0 border-slate-200 align-top min-h-[60px] w-40">
                            {slotSchedules.length === 0 ? (
                              <div className="text-slate-300 text-center py-2 font-light">—</div>
                            ) : (
                              slotSchedules.map(schedule => {
                                const isMySchedule = teacherId && (schedule.teacher?.id || schedule.teacher) == teacherId;
                                return (
                                  <div
                                    key={schedule.id}
                                    className={`p-2.5 rounded border text-xs transition-all mb-1.5 last:mb-0 ${isMySchedule
                                        ? 'bg-orange-50 border-orange-200 text-orange-850 shadow-sm'
                                        : 'bg-slate-50 border-slate-150 text-slate-500'
                                      }`}
                                  >
                                    <div className="font-bold truncate">{schedule.course_name}</div>
                                    <div className="mt-1 flex flex-col gap-0.5 text-[10px] font-medium">
                                      {isMySchedule ? (
                                        <div className="text-orange-700 truncate">
                                          S: {schedule.student_names
                                            ? (Array.isArray(schedule.student_names) ? schedule.student_names.join(', ') : schedule.student_names)
                                            : 'None'}
                                        </div>
                                      ) : (
                                        <div className="text-slate-400 truncate">T: {schedule.teacher_name || 'Assigned'}</div>
                                      )}
                                      <div className="flex items-center gap-1 mt-1">
                                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${isMySchedule ? 'bg-orange-100 text-orange-850' : 'bg-slate-200 text-slate-650'
                                          }`}>
                                          {schedule.sessionType}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
