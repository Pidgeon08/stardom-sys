import { useState, useEffect } from 'react'
import NavBar from '../../components/NavBar'
import { Plus, User, Edit, Archive, Loader, X } from 'lucide-react'
import { getStudents, createStudent, updateStudent, archiveStudent, getCourses } from '../../api/core'

export default function StudentListAdmin() {
  const [students, setStudents] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchStudents()
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const data = await getCourses()
      const coursesArray = Array.isArray(data) ? data : (data?.results || data?.data || [])
      setCourses(coursesArray.filter(c => c.is_active))
    } catch (err) {
      console.error('Failed to load courses', err)
    }
  }

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const data = await getStudents()
      // Ensure data is an array
      const studentsArray = Array.isArray(data) ? data : (data?.results || data?.data || [])
      setStudents(studentsArray)
    } catch (err) {
      setError('Failed to load students')
      console.error(err)
      setStudents([])
    } finally {
      setLoading(false)
    }
  }

  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    course_ids: [],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingStudent) {
        await updateStudent(editingStudent.id, formData);
      } else {
        await createStudent(formData);
      }
      await fetchStudents();
      setShowForm(false);
      setEditingStudent(null);
      setFormData({ username: "", email: "", first_name: "", last_name: "", course_ids: [] });
    } catch (err) {
      setError('Failed to save student');
      console.error(err);
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      username: student.user?.username || "",
      email: student.user?.email || "",
      first_name: student.user?.first_name || "",
      last_name: student.user?.last_name || "",
      course_ids: student.enrolled_courses?.map(c => c.id) || [],
    });
    setShowForm(true);
  };

  const handleArchive = async (id) => {
    if (confirm("Are you sure you want to archive this student?")) {
      try {
        await archiveStudent(id);
        await fetchStudents();
      } catch (err) {
        setError('Failed to archive student');
        console.error(err);
      }
    }
  };

  const activeStudents = students.filter(s => s.is_active);
  const archivedStudents = students.filter(s => !s.is_active);

  if (loading) return <div className="p-8 flex justify-center"><Loader className="animate-spin" /></div>;

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
        <div className="fixed inset-0  bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-800">
                {editingStudent ? "Edit Student" : "Add New Student"}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingStudent(null);
                  setFormData({ username: "", email: "", first_name: "", last_name: "", course_ids: [] });
                }}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X size={22} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">First Name *</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="John"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Last Name *</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder="Doe"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Username *</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="johndoe"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                  disabled={editingStudent}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
            </div>

            {/* Courses Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">Enroll in Courses</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-lg">
                {courses.map((course) => (
                  <label key={course.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 p-2 rounded transition">
                    <input
                      type="checkbox"
                      checked={formData.course_ids.includes(course.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            course_ids: [...formData.course_ids, course.id]
                          });
                        } else {
                          setFormData({
                            ...formData,
                            course_ids: formData.course_ids.filter(id => id !== course.id)
                          });
                        }
                      }}
                      className="w-4 h-4 rounded accent-orange-600"
                    />
                    <span className="text-sm text-slate-700">{course.name}</span>
                  </label>
                ))}
              </div>
              {courses.length === 0 && <p className="text-slate-500 text-xs mt-2">No courses available</p>}
            </div>
            <div className="flex gap-4 px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-xl">
              <button
                type="submit"
                className="flex-1 bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition font-medium"
              >
                {editingStudent ? "Update" : "Add"} Student
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingStudent(null);
                  setFormData({ username: "", email: "", first_name: "", last_name: "", course_ids: [] });
                }}
                className="flex-1 bg-slate-300 text-slate-800 px-6 py-2 rounded-lg hover:bg-slate-400 transition font-medium"
              >
                Cancel
              </button>
            </div>
            </form>
          </div>
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
                      <Edit size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleArchive(student.id)}
                      className="flex items-center gap-1 text-orange-600 hover:text-orange-800"
                    >
                      <Archive size={16} />
                      Archive
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
      )}</main>
    </div>
  )
}
