export default function StudentDashboard({ onNavigate }) {
  return (
    <div className="p-6 flex-1">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
        <button className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: "Total Enrolled Courses", value: "3", cls: "text-gray-800" },
          { label: "Upcoming Classes", value: "2", cls: "text-gray-800" },
          { label: "Attendance Rate", value: "85%", cls: "text-gray-800" },
          { label: "Payment Status", value: "Partial", cls: "text-orange-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 text-center">
            <p className="text-xs text-gray-400 mb-1 leading-tight">{s.label}</p>
            <p className={`text-2xl font-bold ${s.cls}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Upcoming Classes */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 mb-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-semibold text-gray-700">Upcoming Classes</h2>
          <button
            onClick={() => onNavigate("schedule")}
            className="text-xs text-red-700 font-medium hover:underline"
          >
            View all
          </button>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="text-gray-400 border-b border-gray-100">
              {["Date", "Time", "Course", "Instructor", "Room"].map((h) => (
                <th key={h} className="text-left pb-2 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { date: "May 20, 2025", time: "10:00 AM", course: "Piano", instructor: "Mr. Garcia", room: "Room 1" },
              { date: "May 22, 2025", time: "2:00 PM", course: "Voice", instructor: "Ms. Reyes", room: "Room 2" },
            ].map((r, i) => (
              <tr key={i} className="border-b border-gray-50 last:border-0">
                <td className="py-2 text-gray-600">{r.date}</td>
                <td className="py-2 text-gray-600">{r.time}</td>
                <td className="py-2 text-gray-600">{r.course}</td>
                <td className="py-2 text-gray-600">{r.instructor}</td>
                <td className="py-2 text-gray-600">{r.room}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Recent Activity</h2>
        {[
          { icon: "💳", text: "Payment of ₱1,000 was recorded", date: "May 15, 2025" },
          { icon: "📋", text: "Marked absent in Guitar class", date: "May 13, 2025" },
        ].map((a, i) => (
          <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
            <span className="text-xs text-gray-600 flex items-center gap-2">
              <span>{a.icon}</span>{a.text}
            </span>
            <span className="text-xs text-gray-400 whitespace-nowrap ml-4">{a.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}