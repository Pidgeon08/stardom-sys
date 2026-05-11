import { useEffect, useState } from 'react'
import { Music, Loader } from 'lucide-react'
import { getCourses } from '../../api/core'

export default function MyCoursesStudent() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const data = await getCourses()
      const coursesArray = Array.isArray(data)
        ? data
        : (data?.results || data?.data || [])

      setCourses(coursesArray.filter(c => c.is_active))
    } catch (err) {
      console.error(err)
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