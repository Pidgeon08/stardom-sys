import { useState } from "react";

const DAYS = ["Mon 5/19", "Tue 5/20", "Wed 5/21", "Thu 5/22", "Fri 5/23", "Sat 5/24", "Sun 5/25"];
const HOURS = ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"];

const EVENTS = {
  "10:00 AM": {
    0: { course: "Piano", time: "10:00 AM", room: "Room 1", color: "bg-blue-50 border-blue-200 text-blue-700" },
    2: { course: "Piano", time: "10:00 AM", room: "Room 1", color: "bg-blue-50 border-blue-200 text-blue-700" },
  },
  "9:00 AM": {
    5: { course: "Guitar", time: "9:00 AM", room: "Room 3", color: "bg-green-50 border-green-200 text-green-700" },
  },
  "2:00 PM": {
    1: { course: "Voice", time: "2:00 PM", room: "Room 2", color: "bg-yellow-50 border-yellow-200 text-yellow-700" },
    3: { course: "Voice", time: "2:00 PM", room: "Room 2", color: "bg-yellow-50 border-yellow-200 text-yellow-700" },
  },
};

export default function Schedule() {
  const [filter, setFilter] = useState("All Courses");

  return (
    <div className="p-6 flex-1">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-800">Class Schedule</h1>
        <p className="text-xs text-gray-400">Dashboard / Class Schedule</p>
      </div>

      {/* Week nav + filter */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button className="p-1 border border-gray-200 rounded hover:bg-gray-100 transition-colors">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm font-medium text-gray-700">May 19 – May 25, 2025</span>
          <button className="p-1 border border-gray-200 rounded hover:bg-gray-100 transition-colors">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-red-400 bg-white"
        >
          {["All Courses", "Piano", "Voice", "Guitar"].map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </div>

      {/* Grid */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-xs border-collapse min-w-[640px]">
          <thead>
            <tr>
              <th className="w-16 border-b border-r border-gray-100 p-2 text-gray-400 font-medium text-left">Time</th>
              {DAYS.map((d) => (
                <th key={d} className="border-b border-r border-gray-100 p-2 text-gray-500 font-medium text-center last:border-r-0">
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HOURS.map((hour) => (
              <tr key={hour} className="border-b border-gray-50 last:border-0">
                <td className="border-r border-gray-100 p-2 text-gray-400 whitespace-nowrap text-right pr-3">{hour}</td>
                {DAYS.map((_, di) => {
                  const ev = EVENTS[hour]?.[di];
                  const show = !ev || filter === "All Courses" || filter === ev.course;
                  return (
                    <td key={di} className="border-r border-gray-100 last:border-r-0 p-1 h-12 align-top">
                      {ev && show && (
                        <div className={`rounded border px-1.5 py-1 h-full ${ev.color}`}>
                          <div className="font-semibold">{ev.course}</div>
                          <div className="text-[10px] opacity-70 leading-tight">{ev.time}<br />{ev.room}</div>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}