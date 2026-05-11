import React, { useState, useEffect } from 'react';
import { Users, Music, Clock, CalendarDays, BookOpen } from 'lucide-react';
import { getSchedules, getStudents } from '../../api/core';

export default function DashboardTeacher() {
  const [stats, setStats] = useState([
    { label: 'My Students', value: 0, icon: Users, color: 'bg-green-500' },
    { label: 'Scheduled Sessions', value: 0, icon: CalendarDays, color: 'bg-orange-500' },
  ]);
  const [todaysSchedule, setTodaysSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [schedulesData, studentsData] = await Promise.all([
          getSchedules(),
          getStudents(),
        ]);

        const toArray = (res) => Array.isArray(res) ? res : (res?.results || res?.data || []);
        const schedules = toArray(schedulesData).filter(s => s.active);
        const students = toArray(studentsData).filter(s => s.is_active);

        const todayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date().getDay()];
        const todays = schedules.filter(s => s.day === todayName);

        setTodaysSchedule(todays);
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
    fetchData();
  }, []);

  return (
    <div className="min-h-screen flex">
      <main className="flex-1 p-8 bg-slate-50">
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

        {/* Today's Schedule */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Today's Schedule</h2>
            {!loading && (
              <span className="text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-full font-medium">
                {todaysSchedule.length} session{todaysSchedule.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {loading ? (
            <p className="text-gray-400">Loading...</p>
          ) : todaysSchedule.length === 0 ? (
            <p className="text-gray-500">No sessions scheduled for today.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {todaysSchedule.map((session) => (
                <div key={session.id} className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <Music size={20} className="text-orange-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {session.student_names
                          ? (Array.isArray(session.student_names) ? session.student_names.join(', ') : session.student_names)
                          : 'No students assigned'}
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5">{session.course_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock size={14} className="text-orange-400" />
                    {session.time}
                    <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                      {session.sessionType}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
