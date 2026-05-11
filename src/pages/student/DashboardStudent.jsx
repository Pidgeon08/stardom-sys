import { BookOpen, CalendarDays, Wallet, Clock } from 'lucide-react'

export default function DashboardStudent() {
  const stats = [
    { 
      title: 'Enrolled Courses', 
      value: 3, 
      icon: BookOpen, 
      color: 'bg-blue-500',
      shadow: 'shadow-blue-100'
    },
    { 
      title: 'Upcoming Sessions', 
      value: 5, 
      icon: CalendarDays, 
      color: 'bg-emerald-500',
      shadow: 'shadow-emerald-100'
    },
    { 
      title: 'Pending Balance', 
      value: '₱2,500', 
      icon: Wallet, 
      color: 'bg-orange-500',
      shadow: 'shadow-orange-100'
    },
  ]

  const upcomingSessions = [
    { id: 1, course: 'Piano Beginner', time: 'Monday • 9:00 AM', color: 'bg-orange-500' },
    { id: 2, course: 'Guitar Intermediate', time: 'Wednesday • 1:30 PM', color: 'bg-emerald-500' },
  ]

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="mb-8 border-l-4 border-orange-600 pl-4">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
          STARDOM Student Dashboard
        </h1>
        <p className="text-slate-500 mt-1 font-medium">
          Music Enrollment & Progress Tracking
        </p>
      </div>

      {/* Stats Grid - Cleaned up to 3 cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {stats.map((item, index) => {
          const Icon = item.icon

          return (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                    {item.title}
                  </p>
                  <h2 className="text-3xl font-bold mt-2 text-slate-800">
                    {item.value}
                  </h2>
                </div>
                <div className={`${item.color} p-4 rounded-2xl shadow-lg ${item.shadow}`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Welcome Card */}
      <div className="mb-8 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Welcome to STARDOM</h2>
        <p className="text-slate-600">
          Check your upcoming sessions below. You can view your progress, manage your payments, and see your course materials using the sidebar.
        </p>
      </div>

      {/* Schedule Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-800">
            My Schedule
          </h2>
        </div>

        <div className="space-y-4">
          {upcomingSessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 bg-slate-50/50 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`w-1.5 h-10 rounded-full ${session.color}`} />
                <div>
                  <h3 className="font-bold text-slate-700">
                    {session.course}
                  </h3>
                  <p className="text-sm text-slate-500 flex items-center gap-1.5">
                    <Clock size={14} /> {session.time}
                  </p>
                </div>
              </div>
              {/* Room badge has been completely removed from here */}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}