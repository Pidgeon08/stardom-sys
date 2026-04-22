export default function Attendance() {
  const records = [
    { date: "May 17, 2025", course: "Piano", instructor: "Mr. Garcia", status: "Present" },
    { date: "May 15, 2025", course: "Voice", instructor: "Ms. Reyes", status: "Present" },
    { date: "May 13, 2025", course: "Guitar", instructor: "Mr. Santos", status: "Absent" },
    { date: "May 10, 2025", course: "Piano", instructor: "Mr. Garcia", status: "Present" },
    { date: "May 8, 2025", course: "Voice", instructor: "Ms. Reyes", status: "Present" },
  ];

  return (
    <div className="p-6 flex-1">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-800">Attendance</h1>
        <p className="text-xs text-gray-400">Dashboard / Attendance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: "Total Classes", value: "20", cls: "text-gray-800" },
          { label: "Present", value: "17", cls: "text-green-600" },
          { label: "Absent", value: "2", cls: "text-red-600" },
          { label: "Attendance Rate", value: "85%", cls: "text-green-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 text-center">
            <p className="text-xs text-gray-400 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.cls}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-gray-400 border-b border-gray-100">
              {["Date", "Course", "Instructor", "Status"].map((h) => (
                <th key={h} className="text-left pb-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((r, i) => (
              <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                <td className="py-2.5 text-gray-600">{r.date}</td>
                <td className="py-2.5 text-gray-600">{r.course}</td>
                <td className="py-2.5 text-gray-600">{r.instructor}</td>
                <td className="py-2.5">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      r.status === "Present"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}