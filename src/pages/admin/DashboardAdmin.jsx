import { useState, useEffect } from 'react'
import NavBar from '../../components/NavBar'
import { BookOpen, Users, UserCircle, Calendar, CreditCard, AlertCircle } from "lucide-react"
import { getCourses, getStudents, getTeachers, getSchedules, getBillings } from '../../api/core'

export default function DashboardAdmin() {
  const [stats, setStats] = useState([
    { label: "Total Courses", value: 0, icon: BookOpen, color: "bg-blue-500" },
    { label: "Total Students", value: 0, icon: Users, color: "bg-green-500" },
    { label: "Total Teachers", value: 0, icon: UserCircle, color: "bg-purple-500" },
    { label: "Scheduled Sessions", value: 0, icon: Calendar, color: "bg-orange-500" },
  ])
  const [billings, setBillings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [coursesData, studentsData, teachersData, schedulesData, billingsData] = await Promise.all([
          getCourses(),
          getStudents(),
          getTeachers(),
          getSchedules(),
          getBillings(),
        ])

        const toArray = (res) => Array.isArray(res) ? res : (res?.results || res?.data || [])
        const courses = toArray(coursesData)
        const students = toArray(studentsData)
        const teachers = toArray(teachersData)
        const schedules = toArray(schedulesData)
        const allBillings = toArray(billingsData)

        setStats([
          { label: "Total Courses", value: courses.length, icon: BookOpen, color: "bg-blue-500" },
          { label: "Total Students", value: students.length, icon: Users, color: "bg-green-500" },
          { label: "Total Teachers", value: teachers.length, icon: UserCircle, color: "bg-purple-500" },
          { label: "Scheduled Sessions", value: schedules.length, icon: Calendar, color: "bg-orange-500" },
        ])
        setBillings(allBillings)
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const unpaidBills = billings.filter(b => b.is_active && b.status !== 'Paid')

  return (
    <div className="min-h-screen flex w-full">
      <main className="flex-1 p-8 bg-slate-50 overflow-x-hidden">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

        {/* Unpaid & Pending Bills Table */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Unpaid & Pending Bills</h2>
              <p className="text-sm text-slate-500 mt-1">A list of all active pending and overdue bills in the academy.</p>
            </div>
            {!loading && unpaidBills.length > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 bg-red-50 text-red-700 rounded-full border border-red-100">
                <AlertCircle size={14} />
                {unpaidBills.length} outstanding bill{unpaidBills.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {loading ? (
            <p className="text-gray-400">Loading billings...</p>
          ) : unpaidBills.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <CreditCard className="mx-auto mb-3 text-slate-300" size={36} />
              <p className="text-lg font-medium">All clear! No unpaid or pending bills.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-sm border-collapse min-w-[600px]">
                <thead className="bg-slate-100 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 font-semibold text-slate-600">Student</th>
                    <th className="px-6 py-3 font-semibold text-slate-600">Course</th>
                    <th className="px-6 py-3 font-semibold text-slate-600">Amount</th>
                    <th className="px-6 py-3 font-semibold text-slate-600">Due Date</th>
                    <th className="px-6 py-3 font-semibold text-slate-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {unpaidBills.map((bill) => {
                    const isOverdue = bill.status === 'Overdue';
                    return (
                      <tr key={bill.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-800">
                          {bill.student_name}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {bill.course_name}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-800">
                          ₱{parseFloat(bill.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {bill.due_date}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                            isOverdue
                              ? 'bg-red-50 text-red-700 border border-red-150'
                              : 'bg-yellow-50 text-yellow-700 border border-yellow-150'
                          }`}>
                            {bill.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow">
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