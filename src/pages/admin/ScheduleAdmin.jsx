import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Clock, ChevronLeft, ChevronRight, X, CalendarDays } from 'lucide-react'
import { getSchedules, createSchedule, updateSchedule, getCourses, getTeachers, getStudents, deleteSchedule } from '../../api/core'
import api from '../../api/axios'
import ConfirmationModal from '../../components/ConfirmationModal'

const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const sessionTypeAmounts = { Single: 1, Duo: 2, Trio: 3, Group: 4 }

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

// Convert "7:30 AM" style to HH:MM for <input type="time">
const displayTimeToInput = (displayTime) => {
  if (!displayTime) return '07:30'
  const [timePart, period] = displayTime.split(' ')
  let [h, m] = timePart.split(':').map(Number)
  if (period === 'PM' && h !== 12) h += 12
  if (period === 'AM' && h === 12) h = 0
  return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}`
}

// Convert HH:MM to nearest display slot
const inputTimeToDisplay = (inputTime) => {
  if (!inputTime) return '7:30 AM'
  const [h, m] = inputTime.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const displayHour = h > 12 ? h - 12 : (h === 0 ? 12 : h)
  return `${displayHour}:${m.toString().padStart(2,'0')} ${period}`
}

// Format date to YYYY-MM-DD for input fields
const formatDateForInput = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const dateToDayName = (dateStr) => {
  if (!dateStr) return 'Monday'
  const d = new Date(dateStr + 'T00:00:00')
  return ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][d.getDay()]
}

const timeSlots = generateTimeSlots()
const sessionTypes = ['Single','Duo','Trio','Group']

export default function ScheduleAdmin() {
  const [schedules, setSchedules] = useState([])
  const [courses, setCourses]     = useState([])
  const [teachers, setTeachers]   = useState([])
  const [students, setStudents]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showForm, setShowForm]   = useState(false)
  const [editingSchedule, setEditing] = useState(null)
  const [showStudentModal, setShowStudentModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingScheduleId, setDeletingScheduleId] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // selectedDate: ISO date string (YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState('')

  const [formData, setFormData]   = useState({
    day: 'Monday', time: '7:30 AM', course: '', teacher: '', sessionType: 'Single', student_ids: []
  })

  useEffect(() => {
    Promise.all([getSchedules(), getCourses(), getTeachers(), getStudents()])
      .then(([s, c, t, st]) => {
        const toArray = (res) => Array.isArray(res) ? res : (res?.results || res?.data || [])
        setSchedules(toArray(s))
        setCourses(toArray(c).filter(c => c.is_active))
        setTeachers(toArray(t).filter(t => t.is_active))
        setStudents(toArray(st).filter(st => st.is_active))
      })
      .catch(() => alert('Failed to load schedule data'))
      .finally(() => setLoading(false))
  }, [])

  const currentDayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][currentDate.getDay()]
  const currentDaySchedules = schedules.filter(s => s.day === currentDayName)
  const schedulesByTime = Object.fromEntries(currentDaySchedules.map(s => [s.time, s]))

  const enrolledStudents = formData.course
    ? students.filter(student => student.enrolled_courses?.some(c => c.id == formData.course))
    : []

  const selectedCourse = courses.find(c => c.id == formData.course)
  const filteredTeachers = selectedCourse && selectedCourse.name
    ? teachers.filter(t => t.specializations?.some(s => s.name === selectedCourse.name))
    : teachers

  const formatDate = (date) => date.toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })
  const changeDate = (dir) => { const d = new Date(currentDate); d.setDate(d.getDate()+dir); setCurrentDate(d) }

  // Sync selectedDate + selectedTime -> formData.day and formData.time
  const handleDateChange = (dateStr) => {
    setSelectedDate(dateStr)
    const dayName = dateToDayName(dateStr)
    setFormData(prev => ({ ...prev, day: dayName }))
  }

  const handleTimeChange = (timeStr) => {
    setFormData(prev => ({ ...prev, time: timeStr }))
  }

  const isSlotBooked = (slot) => {
    return schedules.some(s => 
      s.day === formData.day && 
      s.time === slot && 
      s.id !== editingSchedule?.id
    )
  }

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

  const toggleStudentSelection = (studentId) => {
    const maxStudents = sessionTypeAmounts[formData.sessionType] || 1
    if (formData.student_ids.includes(studentId)) {
      setFormData({ ...formData, student_ids: formData.student_ids.filter(id => id !== studentId) })
    } else {
      if (formData.student_ids.length < maxStudents) {
        setFormData({ ...formData, student_ids: [...formData.student_ids, studentId] })
      }
    }
  }

  const handleSessionTypeChange = (newType) => {
    const maxStudents = sessionTypeAmounts[newType] || 1
    let updatedStudentIds = [...formData.student_ids]
    if (updatedStudentIds.length > maxStudents) updatedStudentIds = updatedStudentIds.slice(0, maxStudents)
    setFormData({ ...formData, sessionType: newType, student_ids: updatedStudentIds })
  }

  const handleEdit = (schedule) => {
    setEditing(schedule)
    setSelectedDate(formatDateForInput(currentDate))
    setFormData({
      day: schedule.day,
      time: schedule.time,
      course: schedule.course,
      teacher: schedule.teacher,
      sessionType: schedule.sessionType,
      student_ids: schedule.student_ids || []
    })
    setShowForm(true)
  }

  const handleDelete = (id) => {
    setDeletingScheduleId(id)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    try {
      setDeleteLoading(true)
      await deleteSchedule(deletingScheduleId)
      setSchedules(schedules.filter(s => s.id !== deletingScheduleId))
      setShowDeleteModal(false)
      setDeletingScheduleId(null)
    } catch (err) {
      alert('Failed to delete schedule')
      console.error(err)
    } finally {
      setDeleteLoading(false)
    }
  }

  const resetForm = () => {
    setShowForm(false)
    setEditing(null)
    setShowStudentModal(false)
    setSelectedDate(formatDateForInput(currentDate))
    setFormData({ day:'Monday', time:'7:30 AM', course:'', teacher:'', sessionType:'Single', student_ids:[] })
  }

  const openAddForm = (prefillSlot = null, prefillDay = null) => {
    setSelectedDate(formatDateForInput(currentDate))
    if (prefillSlot) {
      setFormData(prev => ({ ...prev, time: prefillSlot, day: prefillDay || currentDayName }))
    }
    setShowForm(true)
  }

  if (loading) return <div className="p-8 text-gray-500">Loading schedule...</div>

  return (
    <div className="p-8 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Schedule</h1>
        <div className="flex items-center gap-3">
          {/* Add Schedule Button */}
          <button
            onClick={() => openAddForm()}
            className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition font-medium"
          >
            <Plus size={20} /> Add Schedule
          </button>
        </div>
      </div>

      {/* Date navigator */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between">
          <button onClick={() => changeDate(-1)}
            className="flex items-center gap-1 text-orange-600 hover:text-orange-800 px-3 py-2 rounded-lg hover:bg-orange-50 transition">
            <ChevronLeft size={20} /> Previous Day
          </button>
          <h2 className="text-2xl font-bold text-orange-700">{formatDate(currentDate)}</h2>
          <button onClick={() => changeDate(1)}
            className="flex items-center gap-1 text-orange-600 hover:text-orange-800 px-3 py-2 rounded-lg hover:bg-orange-50 transition">
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

      {/* Time slot grid */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-orange-600 text-white">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold border border-orange-500">Time Slot</th>
              <th className="px-4 py-3 text-left text-sm font-semibold border border-orange-500">Course</th>
              <th className="px-4 py-3 text-left text-sm font-semibold border border-orange-500">Teacher</th>
              <th className="px-4 py-3 text-left text-sm font-semibold border border-orange-500">Session Type</th>
              <th className="px-4 py-3 text-left text-sm font-semibold border border-orange-500">Student(s)</th>
              <th className="px-4 py-3 text-left text-sm font-semibold border border-orange-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((slot, i) => {
              const schedule = schedulesByTime[slot]
              return (
                <tr key={slot} className={`border-b ${i%2===0?'bg-gray-50':'bg-white'} ${schedule?'bg-orange-50':''}`}>
                  <td className="px-4 py-4 border border-gray-200">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-orange-600" />
                      <span className="font-medium">{slot}</span>
                    </div>
                  </td>
                  {schedule ? (
                    <>
                      <td className="px-4 py-4 border border-gray-200 font-semibold text-orange-700">{schedule.course_name}</td>
                      <td className="px-4 py-4 border border-gray-200 text-gray-700">{schedule.teacher_name}</td>
                      <td className="px-4 py-4 border border-gray-200">
                        <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">{schedule.sessionType}</span>
                      </td>
                      <td className="px-4 py-4 border border-gray-200 text-gray-700">
                        {schedule.student_names ? (Array.isArray(schedule.student_names) ? schedule.student_names.join(', ') : schedule.student_names) : 'N/A'}
                      </td>
                      <td className="px-4 py-4 border border-gray-200">
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(schedule)} className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm">
                            <Edit size={14} /> Edit
                          </button>
                          <button onClick={() => handleDelete(schedule.id)} className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm">
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-4 border border-gray-200 text-gray-400 text-center" colSpan={4}>Available</td>
                      <td className="px-4 py-4 border border-gray-200">
                        <button
                          onClick={() => openAddForm(slot, currentDayName)}
                          className="flex items-center gap-1 text-orange-600 hover:text-orange-800 text-sm"
                        >
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

      {/* ── Add / Edit Schedule Modal ── */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="text-xl font-bold">{editingSchedule ? 'Edit Schedule' : 'Add New Schedule'}</h2>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 transition">
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Date</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 pointer-events-none">
                      <CalendarDays size={16} />
                    </span>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={e => handleDateChange(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  {formData.day && (
                    <p className="text-xs text-orange-600 mt-1 font-medium">Detected Day: {formData.day}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Time Slot</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 pointer-events-none">
                      <Clock size={16} />
                    </span>
                    <select
                      value={formData.time}
                      onChange={e => handleTimeChange(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                      required
                    >
                      {timeSlots.map(slot => {
                        const booked = isSlotBooked(slot);
                        return (
                          <option key={slot} value={slot} disabled={booked}>
                            {slot} {booked ? '(Booked)' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Course</label>
                  <select value={formData.course} onChange={e => setFormData({...formData, course:e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" required>
                    <option value="">Select Course</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Teacher</label>
                  <select value={formData.teacher} onChange={e => setFormData({...formData, teacher:e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" required>
                    <option value="">Select Teacher</option>
                    {filteredTeachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Session Type</label>
                  <select value={formData.sessionType} onChange={e => handleSessionTypeChange(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" required>
                    {sessionTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Student(s)</label>
                  <button type="button" onClick={() => setShowStudentModal(true)}
                    className="w-full px-4 py-2 border rounded-lg text-left text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500">
                    {formData.student_ids.length === 0 ? 'Select Students...' : `${formData.student_ids.length} student(s) selected`}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2 border-t">
                <button type="submit"
                  className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition font-medium">
                  {editingSchedule ? 'Update' : 'Add'} Schedule
                </button>
                <button type="button" onClick={resetForm}
                  className="bg-white text-gray-700 border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50 transition font-medium">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Student Selection Modal ── */}
      {showStudentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full max-h-96 overflow-y-auto mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Select Students</h3>
              <button onClick={() => setShowStudentModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            {formData.course ? (
              <>
                <p className="text-sm text-gray-600 mb-4">
                  Max: {sessionTypeAmounts[formData.sessionType]} student(s) for {formData.sessionType} session
                </p>
                {enrolledStudents.length === 0 ? (
                  <p className="text-gray-500">No students enrolled in this course</p>
                ) : (
                  <div className="space-y-2">
                    {enrolledStudents.map(student => (
                      <label key={student.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <input type="checkbox" checked={formData.student_ids.includes(student.id)}
                          onChange={() => toggleStudentSelection(student.id)} />
                        <span>{student.user_details?.name || student.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-500">Please select a course first</p>
            )}
            <button onClick={() => setShowStudentModal(false)}
              className="w-full mt-4 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition">
              Done
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Delete Schedule"
        message="Are you sure you want to permanently delete this schedule slot? This action cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteModal(false)
          setDeletingScheduleId(null)
        }}
        isDangerous={true}
        isLoading={deleteLoading}
      />
    </div>
  )
}