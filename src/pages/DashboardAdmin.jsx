import NavBar from "../components/NavBar"
import { BookOpen, Users, UserCircle, Calendar } from "lucide-react"

export default function DashboardAdmin() {
  const stats = [
    { label: "Total Courses", value: "4", icon: BookOpen, color: "bg-blue-500" },
    { label: "Total Students", value: "156", icon: Users, color: "bg-green-500" },
    { label: "Total Teachers", value: "12", icon: UserCircle, color: "bg-purple-500" },
    { label: "Scheduled Sessions", value: "89", icon: Calendar, color: "bg-orange-500" },
  ];


  return (
    <div className="min-h-screen flex">
      <NavBar />
      <main className="flex-1 p-8 bg-slate-50">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        {/* dashboard widgets here */}
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
        <h2 className="text-xl font-bold mb-4">Welcome to Musical Center Admin Panel</h2>
        <p className="text-gray-600">
          Use the sidebar to navigate through different management sections. You can manage courses,
          students, teachers, schedules, and billing from this panel.
        </p>
      </div>
      </main>
    </div>
  );
}
