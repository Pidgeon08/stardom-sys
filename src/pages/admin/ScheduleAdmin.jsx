import { useState, useEffect } from 'react'
import { Plus, Edit, Archive, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { getSchedules, createSchedule, updateSchedule, getCourses, getTeachers } from '../../api/core'
import api from '../../api/axios'

const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

const generateTimeSlots = () => {
  const slots = []
  let hour = 7, minute = 30
  while (hour < 18 || (hour === 18 && minute === 0)) {
    const period = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour > 12 ? hour - 12 : hour
    slots.push(`${displayHour}:${minute.toString().padStart(2,'0')} ${period}`)
    minute += 45
    if (minute >= 60) { hour += Math.floor(minute/60); minute = minute%60 }
  }
  return slots
}

const timeSlots = generateTimeSlots()
const sessionTypes = ['Single','Duo','Trio','Group']

export default function ScheduleAdmin() {
  const [schedules, setSchedules] = useState([])
  const [courses, setCourses]     = useState([])
  const [teachers, setTeachers]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showForm, setShowForm]   = useState(false)
  const [editingSchedule, setEditing] = useState(null)
  const [formData, setFormData]   = useState({
    day: 'Monday', time: '7:30 AM', course: '', teacher: '', sessionType: 'Single', student: ''
  })

  useEffect(() => {
    Promise.all([getSchedules(), getCourses(), getTeachers()])
      .then(([s, c, t]) => {
        const toArray = (res) => Array.isArray(res) ? res : (res?.results || res?.data || [])
        setSchedules(toArray(s))
        setCourses(toArray(c).filter(c => c.is_active))
        setTeachers(toArray(t).filter(t => t.is_active))
      })
      .catch(() => alert('Failed to load schedule data'))
      .finally(() => setLoading(false))
  }, [])

  const currentDayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][currentDate.getDay()]
  const currentDaySchedules = schedules.filter(s => s.active && s.day === currentDayName)
  const schedulesByTime = Object.fromEntries(currentDaySchedules.map(s => [s.time, s]))

  const formatDate = (date) => date.toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })
  const changeDate = (dir) => { const d = new Date(currentDate); d.setDate(d.getDate()+dir); setCurrentDate(d) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingSchedule) {
        const { data } = await updateSchedule(editingSchedule.id, formData)
        setSchedules(schedules.map(s => s.id === data.id ? data : s))
      } else {
        const { data } = await createSchedule({ ...formData, active: true })
        setSchedules([...schedules, data])
      }
      resetForm()
    } catch { alert('Failed to save schedule') }
  }

  const handleEdit = (schedule) => {
    setEditing(schedule)
    setFormData({ day:schedule.day, time:schedule.time, course:schedule.course,
      teacher:schedule.teacher, sessionType:schedule.sessionType, student:schedule.student })
    setShowForm(true)
  }

  const handleArchive = async (id) => {
    if (!confirm('Archive this schedule?')) return
    try {
      await api.patch(`/schedules/${id}/`, { active: false })
      setSchedules(schedules.map(s => s.id === id ? { ...s, active:false } : s))
    } catch { alert('Failed to archive') }
  }

  const resetForm = () => {
    setShowForm(false); setEditing(null)
    setFormData({ day:'Monday', time:'7:30 AM', course:'', teacher:'', sessionType:'Single', student:'' })
  }

  const archivedSchedules = schedules.filter(s => !s.active)

  if (loading) return <div className="p-8 text-gray-500">Loading schedule...</div>

  return (
    // FIX: added h-full overflow-y-auto to allow the page to scroll
    <div className="p-8 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Schedule</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
          <Plus size={20} /> Add Schedule
        </button>
      </div>

      {/* Date navigator */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between">
          <button onClick={() => changeDate(-1)}
            className="flex items-center gap-1 text-purple-600 hover:text-purple-800 px-3 py-2 rounded-lg hover:bg-purple-50 transition">
            <ChevronLeft size={20} /> Previous Day
          </button>
          <h2 className="text-2xl font-bold text-purple-700">{formatDate(currentDate)}</h2>
          <button onClick={() => changeDate(1)}
            className="flex items-center gap-1 text-purple-600 hover:text-purple-800 px-3 py-2 rounded-lg hover:bg-purple-50 transition">
            Next Day <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Sessions run 7:30 AM–6:00 PM in 45-minute slots.
          Types: Single (1), Duo (2), Trio (3), Group (4+).
        </p>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-bold mb-4">{editingSchedule ? 'Edit Schedule' : 'Add New Schedule'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Day</label>
                <select value={formData.day} onChange={e => setFormData({...formData, day:e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" required>
                  {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Time Slot</label>
                <select value={formData.time} onChange={e => setFormData({...formData, time:e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" required>
                  {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Course</label>
                <select value={formData.course} onChange={e => setFormData({...formData, course:e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" required>
                  <option value="">Select Course</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Teacher</label>
                <select value={formData.teacher} onChange={e => setFormData({...formData, teacher:e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" required>
                  <option value="">Select Teacher</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Session Type</label>
                <select value={formData.sessionType} onChange={e => setFormData({...formData, sessionType:e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" required>
                  {sessionTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Student(s)</label>
                <input type="text" value={formData.student} placeholder="Enter student name(s)"
                  onChange={e => setFormData({...formData, student:e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" required />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
                {editingSchedule ? 'Update' : 'Add'} Schedule
              </button>
              <button type="button" onClick={resetForm}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Time slot grid */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-purple-600 text-white">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold border border-purple-500">Time Slot</th>
              <th className="px-4 py-3 text-left text-sm font-semibold border border-purple-500">Course</th>
              <th className="px-4 py-3 text-left text-sm font-semibold border border-purple-500">Teacher</th>
              <th className="px-4 py-3 text-left text-sm font-semibold border border-purple-500">Session Type</th>
              <th className="px-4 py-3 text-left text-sm font-semibold border border-purple-500">Student(s)</th>
              <th className="px-4 py-3 text-left text-sm font-semibold border border-purple-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((slot, i) => {
              const schedule = schedulesByTime[slot]
              return (
                <tr key={slot} className={`border-b ${i%2===0?'bg-gray-50':'bg-white'} ${schedule?'bg-purple-50':''}`}>
                  <td className="px-4 py-4 border border-gray-200">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-purple-600" />
                      <span className="font-medium">{slot}</span>
                    </div>
                  </td>
                  {schedule ? (
                    <>
                      <td className="px-4 py-4 border border-gray-200 font-semibold text-purple-700">{schedule.course_name}</td>
                      <td className="px-4 py-4 border border-gray-200 text-gray-700">{schedule.teacher_name}</td>
                      <td className="px-4 py-4 border border-gray-200">
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">{schedule.sessionType}</span>
                      </td>
                      <td className="px-4 py-4 border border-gray-200 text-gray-700">{schedule.student_name}</td>
                      <td className="px-4 py-4 border border-gray-200">
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(schedule)} className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm">
                            <Edit size={14} /> Edit
                          </button>
                          <button onClick={() => handleArchive(schedule.id)} className="flex items-center gap-1 text-orange-600 hover:text-orange-800 text-sm">
                            <Archive size={14} /> Archive
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-4 border border-gray-200 text-gray-400 text-center" colSpan={4}>Available</td>
                      <td className="px-4 py-4 border border-gray-200">
                        <button onClick={() => { setFormData({...formData, time:slot, day:currentDayName}); setShowForm(true) }}
                          className="flex items-center gap-1 text-purple-600 hover:text-purple-800 text-sm">
                          <Plus size={14} /> Book
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {archivedSchedules.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Archived Schedules</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50"><tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Day</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-200">
                {archivedSchedules.map(s => (
                  <tr key={s.id} className="opacity-50">
                    <td className="px-6 py-4">{s.day}</td>
                    <td className="px-6 py-4">{s.time}</td>
                    <td className="px-6 py-4 text-gray-600">{s.course_name}</td>
                    <td className="px-6 py-4 text-gray-600">{s.teacher_name}</td>
                    <td className="px-6 py-4 text-gray-600">{s.sessionType}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}