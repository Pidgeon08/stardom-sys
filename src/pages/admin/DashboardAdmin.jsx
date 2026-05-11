import { useState, useEffect } from 'react'
import NavBar from '../../components/NavBar'
import { BookOpen, Users, UserCircle, Calendar } from "lucide-react"
import { getCourses, getStudents, getTeachers, getSchedules } from '../../api/core'

export default function DashboardAdmin() {
  const [stats, setStats] = useState([
    { label: "Total Courses", value: 0, icon: BookOpen, color: "bg-blue-500" },
    { label: "Total Students", value: 0, icon: Users, color: "bg-green-500" },
    { label: "Total Teachers", value: 0, icon: UserCircle, color: "bg-purple-500" },
    { label: "Scheduled Sessions", value: 0, icon: Calendar, color: "bg-orange-500" },
  ])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [coursesData, studentsData, teachersData, schedulesData] = await Promise.all([
          getCourses(),
          getStudents(),
          getTeachers(),
          getSchedules(),
        ])

        const courses = Array.isArray(coursesData) ? coursesData : (coursesData?.results || coursesData?.data || [])
        const students = Array.isArray(studentsData) ? studentsData : (studentsData?.results || studentsData?.data || [])
        const teachers = Array.isArray(teachersData) ? teachersData : (teachersData?.results || teachersData?.data || [])
        const schedules = Array.isArray(schedulesData) ? schedulesData : (schedulesData?.results || schedulesData?.data || [])

        setStats([
          { label: "Total Courses", value: courses.length, icon: BookOpen, color: "bg-blue-500" },
          { label: "Total Students", value: students.length, icon: Users, color: "bg-green-500" },
          { label: "Total Teachers", value: teachers.length, icon: UserCircle, color: "bg-purple-500" },
          { label: "Scheduled Sessions", value: schedules.length, icon: Calendar, color: "bg-orange-500" },
        ])
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="min-h-screen flex">
      <main className="flex-1 p-8 bg-slate-50">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">{stat.label}</p>
                    <p className="text-3xl font-bold mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="text-white" size={24} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          {/* Changed text to STARDOM */}
          <h2 className="text-xl font-bold mb-4">Welcome to STARDOM Admin Panel</h2>
          <p className="text-gray-600">
            Use the sidebar to navigate through different management sections. You can manage courses,
            students, teachers, schedules, and billing from this panel.
          </p>
        </div>
      </main>
    </div>
  );
}