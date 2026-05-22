import { useEffect, useState } from 'react'
import { Music, Loader } from 'lucide-react'
import { getCourses, getSchedules, getStudents } from '../../api/core'
import { useAuth } from '../../context/AuthContext'

export default function MyCoursesStudent() {
  const { user } = useAuth()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchCourses()
    }
  }, [user])

  const fetchCourses = async () => {
    try {
      const [coursesRes, schedulesRes, studentsRes] = await Promise.all([
        getCourses(),
        getSchedules(),
        getStudents()
      ]);

      const toArray = (res) => Array.isArray(res) ? res : (res?.results || res?.data || [])

      const allStudents = toArray(studentsRes)
      const currentStudent = allStudents.find(s =>
        (s.user?.id || s.user) == user?.id ||
        (s.user?.username || s.username) == user?.username
      )
      const studentId = currentStudent?.id

      const allCourses = toArray(coursesRes)
      
      let myCourses = []
      if (currentStudent?.enrolled_courses && currentStudent.enrolled_courses.length > 0) {
        const enrolledCourseIds = new Set(currentStudent.enrolled_courses.map(c => c.id))
        myCourses = allCourses.filter(c => c.is_active && enrolledCourseIds.has(c.id))
      } else {
        // Fallback to schedule-based detection if enrolled_courses is not present
        const allSchedules = toArray(schedulesRes)
        const mySchedules = studentId 
          ? allSchedules.filter(s => {
              const ids = s.student_ids || [];
              return ids.some(id => 
                (typeof id === 'object' ? id.id : id) == studentId
              );
            })
          : []
        const myCourseNames = new Set(mySchedules.map(s => s.course_name).filter(Boolean))
        myCourses = allCourses.filter(c => c.is_active && myCourseNames.has(c.name))
      }

      setCourses(myCourses)
    } catch (err) {
      console.error('Error fetching courses:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <Loader className="animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">
        My Courses
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {courses.map(course => (
          <div
            key={course.id}
            className="bg-white rounded-xl shadow p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Music className="text-blue-600" />
              </div>

              <div>
                <h2 className="font-bold text-lg">
                  {course.name}
                </h2>

                <p className="text-sm text-gray-500">
                  {course.levels} Levels
                </p>
              </div>
            </div>

            <p className="text-gray-600 text-sm">
              {course.description || 'No description available'}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}