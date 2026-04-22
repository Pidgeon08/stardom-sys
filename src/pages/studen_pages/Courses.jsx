export default function Courses() {
  const courses = [
    { course: "Piano", instructor: "Mr. Garcia", schedule: "Tue, Thu - 10:00 AM", status: "Active" },
    { course: "Voice", instructor: "Ms. Reyes", schedule: "Mon, Wed - 2:00 PM", status: "Active" },
    { course: "Guitar", instructor: "Mr. Santos", schedule: "Sat - 9:00 AM", status: "Active" },
  ];

  return (
    <div className="p-6 flex-1">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-800">My Courses</h1>
        <p className="text-xs text-gray-400">Dashboard / My Courses</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-gray-400 border-b border-gray-100">
              {["Course", "Instructor", "Schedule", "Status", "Action"].map((h) => (
                <th key={h} className="text-left pb-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {courses.map((r) => (
              <tr key={r.course} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                <td className="py-3 font-semibold text-gray-700">{r.course}</td>
                <td className="py-3 text-gray-600">{r.instructor}</td>
                <td className="py-3 text-gray-600">{r.schedule}</td>
                <td className="py-3">
                  <span className="bg-green-100 text-green-700 text-xs px-2.5 py-0.5 rounded-full font-medium">
                    {r.status}
                  </span>
                </td>
                <td className="py-3">
                  <button className="border border-gray-300 text-gray-600 text-xs px-3 py-1 rounded hover:bg-gray-100 transition-colors">
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}