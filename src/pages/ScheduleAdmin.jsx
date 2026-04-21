import { useState } from "react";
import { Plus, Edit, Archive, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import NavBar from "../components/NavBar";

export default function ManageSchedule() {
  const sessionTypes = ["Single", "Duo", "Trio", "Group"];
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  // Current date state
  const [currentDate, setCurrentDate] = useState(new Date());

  // Generate time slots from 7:30 AM to 6:00 PM (45 min sessions)
  const generateTimeSlots = () => {
    const slots = [];
    let hour = 7;
    let minute = 30;

    while (hour < 18 || (hour === 18 && minute === 0)) {
      const period = hour >= 12 ? "PM" : "AM";
      const displayHour = hour > 12 ? hour - 12 : hour;
      const time = `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
      slots.push(time);

      minute += 45;
      if (minute >= 60) {
        hour += Math.floor(minute / 60);
        minute = minute % 60;
      }
    }

    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Get current day of the week
  const getCurrentDay = () => {
    const dayIndex = currentDate.getDay();
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return dayNames[dayIndex];
  };

  // Format date for display
  const formatDate = (date) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  // Navigate to previous/next day
  const changeDate = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + direction);
    setCurrentDate(newDate);
  };

  const [schedules, setSchedules] = useState([
    { id: 1, day: "Monday", time: "9:15 AM", course: "Guitar", teacher: "Sarah Williams", sessionType: "Single", student: "John Smith", active: true },
    { id: 2, day: "Monday", time: "10:45 AM", course: "Piano", teacher: "David Martinez", sessionType: "Duo", student: "Emma Johnson, Michael Brown", active: true },
    { id: 3, day: "Wednesday", time: "2:15 PM", course: "Voice", teacher: "Lisa Anderson", sessionType: "Group", student: "4 students", active: true },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [formData, setFormData] = useState({
    day: "Monday",
    time: "7:30 AM",
    course: "Guitar",
    teacher: "",
    sessionType: "Single",
    student: "",
  });

  const courses = ["Guitar", "Voice", "Piano", "Violin"];
  const teachers = ["Sarah Williams", "David Martinez", "Lisa Anderson"];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingSchedule) {
      setSchedules(schedules.map(s =>
        s.id === editingSchedule.id
          ? { ...s, ...formData }
          : s
      ));
    } else {
      setSchedules([...schedules, {
        id: Date.now(),
        ...formData,
        active: true
      }]);
    }

    setShowForm(false);
    setEditingSchedule(null);
    setFormData({ day: "Monday", time: "7:30 AM", course: "Guitar", teacher: "", sessionType: "Single", student: "" });
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      day: schedule.day,
      time: schedule.time,
      course: schedule.course,
      teacher: schedule.teacher,
      sessionType: schedule.sessionType,
      student: schedule.student,
    });
    setShowForm(true);
  };

  const handleArchive = (id) => {
    if (confirm("Are you sure you want to archive this schedule?")) {
      setSchedules(schedules.map(s =>
        s.id === id ? { ...s, active: false } : s
      ));
    }
  };

  const activeSchedules = schedules.filter(s => s.active);
  const archivedSchedules = schedules.filter(s => !s.active);

  // Get schedules for the current day
  const currentDayName = getCurrentDay();
  const currentDaySchedules = activeSchedules.filter(s => s.day === currentDayName);

  // Create a map of schedules by time slot
  const schedulesByTime = {};
  currentDaySchedules.forEach(schedule => {
    schedulesByTime[schedule.time] = schedule;
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Schedule</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
        >
          <Plus size={20} />
          Add Schedule
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => changeDate(-1)}
            className="flex items-center gap-1 text-purple-600 hover:text-purple-800 px-3 py-2 rounded-lg hover:bg-purple-50 transition"
          >
            <ChevronLeft size={20} />
            Previous Day
          </button>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-purple-700">{formatDate(currentDate)}</h2>
          </div>
          <button
            onClick={() => changeDate(1)}
            className="flex items-center gap-1 text-purple-600 hover:text-purple-800 px-3 py-2 rounded-lg hover:bg-purple-50 transition"
          >
            Next Day
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Sessions run from 7:30 AM to 6:00 PM with 45-minute duration.
          Session types: Single (1 student), Duo (2 students), Trio (3 students), Group (4+ students).
        </p>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-bold mb-4">
            {editingSchedule ? "Edit Schedule" : "Add New Schedule"}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Day</label>
                <select
                  value={formData.day}
                  onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  {days.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Time Slot</label>
                <select
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  {timeSlots.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Course</label>
                <select
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  {courses.map(course => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Teacher</label>
                <select
                  value={formData.teacher}
                  onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">Select Teacher</option>
                  {teachers.map(teacher => (
                    <option key={teacher} value={teacher}>{teacher}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Session Type</label>
                <select
                  value={formData.sessionType}
                  onChange={(e) => setFormData({ ...formData, sessionType: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  {sessionTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Student(s)</label>
                <input
                  type="text"
                  value={formData.student}
                  onChange={(e) => setFormData({ ...formData, student: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter student name(s)"
                  required
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
              >
                {editingSchedule ? "Update" : "Add"} Schedule
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingSchedule(null);
                  setFormData({ day: "Monday", time: "7:30 AM", course: "Guitar", teacher: "", sessionType: "Single", student: "" });
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-purple-600 text-white">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold border border-purple-500">Time Slot</th>
              <th className="px-4 py-3 text-left text-sm font-semibold border border-purple-500">Course</th>
              <th className="px-4 py-3 text-left text-sm font-semibold border border-purple-500">Teacher</th>
              <th className="px-4 py-3 text-left text-sm font-semibold border border-purple-500">Session Type</th>
              <th className="px-4 py-3 text-left text-sm font-semibold border border-purple-500">Student(s)</th>
              <th className="px-4 py-3 text-left text-sm font-semibold border border-purple-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((timeSlot, index) => {
              const schedule = schedulesByTime[timeSlot];
              const isBooked = !!schedule;

              return (
                <tr
                  key={timeSlot}
                  className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} ${isBooked ? 'bg-purple-50' : ''}`}
                >
                  <td className="px-4 py-4 border border-gray-200">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-purple-600" />
                      <span className="font-medium">{timeSlot}</span>
                    </div>
                  </td>
                  {isBooked ? (
                    <>
                      <td className="px-4 py-4 border border-gray-200">
                        <span className="font-semibold text-purple-700">{schedule.course}</span>
                      </td>
                      <td className="px-4 py-4 border border-gray-200 text-gray-700">
                        {schedule.teacher}
                      </td>
                      <td className="px-4 py-4 border border-gray-200">
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                          {schedule.sessionType}
                        </span>
                      </td>
                      <td className="px-4 py-4 border border-gray-200 text-gray-700">
                        {schedule.student}
                      </td>
                      <td className="px-4 py-4 border border-gray-200">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(schedule)}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                          >
                            <Edit size={14} />
                            Edit
                          </button>
                          <button
                            onClick={() => handleArchive(schedule.id)}
                            className="flex items-center gap-1 text-orange-600 hover:text-orange-800 text-sm"
                          >
                            <Archive size={14} />
                            Archive
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-4 border border-gray-200 text-gray-400 text-center" colSpan={4}>
                        Available
                      </td>
                      <td className="px-4 py-4 border border-gray-200">
                        <button
                          onClick={() => {
                            setFormData({
                              ...formData,
                              time: timeSlot,
                              day: currentDayName
                            });
                            setShowForm(true);
                          }}
                          className="flex items-center gap-1 text-purple-600 hover:text-purple-800 text-sm"
                        >
                          <Plus size={14} />
                          Book
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {archivedSchedules.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Archived Schedules</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Day</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {archivedSchedules.map((schedule) => (
                  <tr key={schedule.id} className="opacity-50">
                    <td className="px-6 py-4">{schedule.day}</td>
                    <td className="px-6 py-4">{schedule.time}</td>
                    <td className="px-6 py-4 text-gray-600">{schedule.course}</td>
                    <td className="px-6 py-4 text-gray-600">{schedule.teacher}</td>
                    <td className="px-6 py-4 text-gray-600">{schedule.sessionType}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
