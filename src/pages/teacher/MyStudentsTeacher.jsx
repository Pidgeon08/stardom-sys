import { useState, useEffect } from 'react'
import { Plus, User, Edit, Archive, Loader } from 'lucide-react'
import { getStudents, createStudent, updateStudent, archiveStudent, getCourses, getTeachers, getSchedules } from '../../api/core'
import { useAuth } from '../../context/AuthContext'

export default function MyStudentsTeacher() {
  const { user } = useAuth()
  const [students, setStudents] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [studentsRes, coursesRes, teachersRes, schedulesRes] = await Promise.all([
        getStudents(),
        getCourses(),
        getTeachers(),
        getSchedules(),
      ])

      const toArray = (res) => Array.isArray(res) ? res : (res?.results || res?.data || [])
      
      // Identify current teacher
      const allTeachers = toArray(teachersRes)
      const currentTeacher = allTeachers.find(t => 
        (t.user?.id || t.user) == user?.id || 
        (t.user?.username || t.username) == user?.username
      )
      const teacherId = currentTeacher?.id

      // Find students assigned to this teacher in schedules
      const allSchedules = toArray(schedulesRes)
      const teacherSchedules = teacherId
        ? allSchedules.filter(s => (s.teacher?.id || s.teacher) == teacherId)
        : allSchedules;

      const teacherStudentIds = new Set()
      teacherSchedules.forEach(s => {
        const ids = s.student_ids || []
        ids.forEach(student => {
          const sid = typeof student === 'object' ? student.id : student;
          if (sid) teacherStudentIds.add(sid.toString());
        });
      })

      // Filter students: if we have teacher-specific schedules, filter. Otherwise show all.
      const allStudents = toArray(studentsRes)
      if (teacherId && teacherStudentIds.size > 0) {
        setStudents(allStudents.filter(s => teacherStudentIds.has(s.id?.toString())))
      } else {
        setStudents(allStudents)
      }

      // Filter courses
      setCourses(toArray(coursesRes).filter(c => c.is_active))

    } catch (err) {
      setError('Failed to load data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const [showForm, setShowForm] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    course_ids: [],
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingStudent) {
        await updateStudent(editingStudent.id, formData)
      } else {
        await createStudent(formData)
      }
      await fetchData()
      setShowForm(false)
      setEditingStudent(null)
      setFormData({ username: '', email: '', first_name: '', last_name: '', course_ids: [] })
    } catch (err) {
      setError('Failed to save student')
      console.error(err)
    }
  }

  const handleEdit = (student) => {
    setEditingStudent(student)
    setFormData({
      username: student.user?.username || '',
      email: student.user?.email || '',
      first_name: student.user?.first_name || '',
      last_name: student.user?.last_name || '',
      course_ids: student.enrolled_courses?.map(c => c.id) || [],
    })
    setShowForm(true)
  }

  const handleArchive = async (id) => {
    if (confirm('Are you sure you want to archive this student?')) {
      try {
        await archiveStudent(id)
        await fetchData()
      } catch (err) {
        setError('Failed to archive student')
        console.error(err)
      }
    }
  }

  const activeStudents = students.filter(s => s.is_active)
  const archivedStudents = students.filter(s => !s.is_active)

  if (loading) return <div className="p-8 flex justify-center"><Loader className="animate-spin" /></div>

  return (
    <div className='min-h-screen flex'>
      <main className="flex-1 p-8 bg-slate-50">
        {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Manage Students</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition"
          >
            <Plus size={20} />
            Add Student
          </button>
        </div>

        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-bold mb-4">
              {editingStudent ? 'Edit Student' : 'Add New Student'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 mb-2">Username</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                    disabled={editingStudent}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-3 font-medium">Enroll in Courses</label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-lg">
                  {courses.map((course) => (
                    <label key={course.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded transition">
                      <input
                        type="checkbox"
                        checked={formData.course_ids.includes(course.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, course_ids: [...formData.course_ids, course.id] })
                          } else {
                            setFormData({ ...formData, course_ids: formData.course_ids.filter(id => id !== course.id) })
                          }
                        }}
                        className="w-4 h-4 rounded accent-orange-600"
                      />
                      <span className="text-sm text-gray-700">{course.name}</span>
                    </label>
                  ))}
                </div>
                {courses.length === 0 && <p className="text-gray-500 text-sm mt-2">No courses available</p>}
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition"
                >
                  {editingStudent ? 'Update' : 'Add'} Student
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingStudent(null)
                    setFormData({ username: '', email: '', first_name: '', last_name: '', course_ids: [] })
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Courses</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {activeStudents.map((student) => (
                <tr key={student.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <User size={20} className="text-orange-600" />
                      <span className="font-medium">{student.user?.first_name} {student.user?.last_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{student.user?.email}</td>
                  <td className="px-6 py-4 text-gray-600">{student.user?.username}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {student.enrolled_courses && student.enrolled_courses.length > 0 ? (
                        student.enrolled_courses.map((course) => (
                          <span key={course.id} className="inline-block px-2 py-1 text-xs font-semibold text-white bg-orange-600 rounded">
                            {course.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 text-sm">No courses</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(student)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                      >
                        <Edit size={16} /> Edit
                      </button>
                      <button
                        onClick={() => handleArchive(student.id)}
                        className="flex items-center gap-1 text-orange-600 hover:text-orange-800"
                      >
                        <Archive size={16} /> Archive
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {archivedStudents.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Archived Students</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Courses</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {archivedStudents.map((student) => (
                    <tr key={student.id} className="opacity-50">
                      <td className="px-6 py-4">{student.user?.first_name} {student.user?.last_name}</td>
                      <td className="px-6 py-4 text-gray-600">{student.user?.email}</td>
                      <td className="px-6 py-4 text-gray-600">{student.user?.username}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {student.enrolled_courses && student.enrolled_courses.length > 0 ? (
                            student.enrolled_courses.map((course) => (
                              <span key={course.id} className="inline-block px-2 py-1 text-xs font-semibold text-white bg-orange-600 rounded">
                                {course.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-500 text-sm">No courses</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
