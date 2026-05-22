import React, { useState, useEffect } from 'react'
import { BookOpen, CalendarDays, Wallet, Clock } from 'lucide-react'
import { getSchedules, getBillings, getStudents } from '../../api/core'
import { useAuth } from '../../context/AuthContext'

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

export default function DashboardStudent() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)

  const [stats, setStats] = useState([
    {
      title: 'Enrolled Courses',
      value: 0,
      icon: BookOpen,
      color: 'bg-blue-500',
      shadow: 'shadow-blue-100'
    },
    {
      title: 'Upcoming Sessions',
      value: 0,
      icon: CalendarDays,
      color: 'bg-emerald-500',
      shadow: 'shadow-emerald-100'
    },
    {
      title: 'Pending Balance',
      value: '₱0',
      icon: Wallet,
      color: 'bg-orange-500',
      shadow: 'shadow-orange-100'
    },
  ])

  const [allSchedules, setAllSchedules] = useState([])
  const [studentId, setStudentId] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [schedulesRes, studentsRes, billingsRes] = await Promise.all([
          getSchedules(),
          getStudents(),
          getBillings()
        ]);

        const toArray = (res) => Array.isArray(res) ? res : (res?.results || res?.data || []);

        const allStudents = toArray(studentsRes);
        const currentStudent = allStudents.find(s =>
          (s.user?.id || s.user) == user?.id ||
          (s.user?.username || s.username) == user?.username
        );
        const sId = currentStudent?.id;
        setStudentId(sId);

        const schedulesList = toArray(schedulesRes);
        setAllSchedules(schedulesList);

        // Filter schedules where this student is included
        const schedules = sId
          ? schedulesList.filter(s => {
            const ids = s.student_ids || [];
            return ids.some(id =>
              (typeof id === 'object' ? id.id : id) == sId
            );
          })
          : [];

        // Count unique courses from enrolled_courses directly from the student object
        const enrolledCourses = currentStudent?.enrolled_courses?.length
          ? currentStudent.enrolled_courses.length
          : new Set(schedules.map(s => s.course_name).filter(Boolean)).size;

        const allBillings = toArray(billingsRes);
        const myBillings = sId
          ? allBillings.filter(b => (b.student?.id || b.student) == sId)
          : [];

        // Calculate pending balance (case insensitive)
        const pendingBalance = myBillings
          .filter(b => b.status?.toLowerCase() === 'pending')
          .reduce((sum, b) => sum + parseFloat(b.amount || 0), 0);

        setStats([
          {
            title: 'Enrolled Courses',
            value: enrolledCourses,
            icon: BookOpen,
            color: 'bg-blue-500',
            shadow: 'shadow-blue-100'
          },
          {
            title: 'Upcoming Sessions',
            value: schedules.length,
            icon: CalendarDays,
            color: 'bg-emerald-500',
            shadow: 'shadow-emerald-100'
          },
          {
            title: 'Pending Balance',
            value: `₱${pendingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            icon: Wallet,
            color: 'bg-orange-500',
            shadow: 'shadow-orange-100'
          },
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
    <div className="p-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="mb-8 border-l-4 border-orange-600 pl-4">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
          STARDOM Student Dashboard
        </h1>
        <p className="text-slate-500 mt-1 font-medium">
          Music Enrollment & Progress Tracking
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {stats.map((item, index) => {
          const Icon = item.icon

          return (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                    {item.title}
                  </p>
                  <h2 className="text-3xl font-bold mt-2 text-slate-800">
                    {loading ? '—' : item.value}
                  </h2>
                </div>
                <div className={`${item.color} p-4 rounded-2xl shadow-lg ${item.shadow}`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Welcome Card */}
      <div className="mb-8 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Welcome to STARDOM</h2>
        <p className="text-slate-600">
          Check your upcoming sessions below. You can view your progress, manage your payments, and see your course materials using the sidebar.
        </p>
      </div>

      {/* Weekly Timetable Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Weekly Timetable
            </h2>
            <p className="text-sm text-slate-500 mt-1">Full academy schedule with your enrolled slots highlighted.</p>
          </div>
          <div className="flex gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-3 h-3 bg-slate-100 border border-slate-200 rounded"></span>
              Other Slots
            </span>
            <span className="flex items-center gap-1.5 text-emerald-600">
              <span className="w-3 h-3 bg-emerald-50 border border-emerald-200 rounded"></span>
              My Slots
            </span>
          </div>
        </div>

        {loading ? (
          <p className="text-slate-400">Loading timetable...</p>
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
                              const isMySchedule = studentId && (schedule.student_ids || []).some(id =>
                                (typeof id === 'object' ? id.id : id) == studentId
                              );
                              return (
                                <div
                                  key={schedule.id}
                                  className={`p-2.5 rounded border text-xs transition-all mb-1.5 last:mb-0 ${isMySchedule
                                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900 shadow-sm'
                                      : 'bg-slate-50 border-slate-150 text-slate-500'
                                    }`}
                                >
                                  <div className="font-bold truncate">{schedule.course_name}</div>
                                  <div className="mt-1 flex flex-col gap-0.5 text-[10px] font-medium">
                                    <div className={`${isMySchedule ? 'text-emerald-700' : 'text-slate-400'} truncate`}>
                                      T: {schedule.teacher_name || 'Assigned'}
                                    </div>
                                    <div className="flex items-center gap-1 mt-1">
                                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${isMySchedule ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-650'
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
    </div>
  )
}
