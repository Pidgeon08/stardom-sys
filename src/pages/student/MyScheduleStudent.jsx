import { useEffect, useState } from 'react'

import { Clock, CalendarDays, Loader } from 'lucide-react'

import { getSchedules } from '../../api/core'

export default function MyScheduleStudent() {
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSchedules()
  }, [])

  const fetchSchedules = async () => {
    try {
      const data = await getSchedules()

      const schedulesArray = Array.isArray(data)
        ? data
        : (data?.results || data?.data || [])

      setSchedules(schedulesArray.filter(s => s.active))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <Loader className="animate-spin text-orange-600" />
      </div>
    )
  }

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      
      {/* Header */}
      <div className="mb-8 border-l-4 border-orange-600 pl-4">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
          My Schedule
        </h1>

        <p className="text-slate-500 mt-1">
          View your upcoming music lessons
        </p>
      </div>

      {/* Schedule Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full">
          
          {/* Table Header */}
          <thead className="bg-orange-600 text-white">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wide">
                Day
              </th>

              <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wide">
                Time
              </th>

              <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wide">
                Course
              </th>

              <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wide">
                Teacher
              </th>

              <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wide">
                Session
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {schedules.length > 0 ? (
              schedules.map(schedule => (
                <tr
                  key={schedule.id}
                  className="border-b border-slate-100 hover:bg-orange-50/60 transition-colors"
                >
                  {/* Day */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                      <CalendarDays size={16} className="text-orange-600" />
                      {schedule.day}
                    </div>
                  </td>

                  {/* Time */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock size={16} className="text-orange-600" />
                      {schedule.time}
                    </div>
                  </td>

                  {/* Course */}
                  <td className="px-6 py-4 font-semibold text-slate-800">
                    {schedule.course_name}
                  </td>

                  {/* Teacher */}
                  <td className="px-6 py-4 text-slate-600">
                    {schedule.teacher_name}
                  </td>

                  {/* Session */}
                  <td className="px-6 py-4">
                    <span className="bg-orange-50 text-orange-600 border border-orange-100 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                      {schedule.sessionType}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="text-center py-12 text-slate-400"
                >
                  No schedules available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}