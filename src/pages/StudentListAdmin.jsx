import { useState } from 'react'
import NavBar from '../components/NavBar'
import { Plus, User, Edit, Archive } from 'lucide-react'

export default function StudentListAdmin() {
      const [students, setStudents] = useState([
    { id: 1, name: "John Smith", email: "john@example.com", phone: "555-0101", course: "Guitar", level: 2, active: true },
    { id: 2, name: "Emma Johnson", email: "emma@example.com", phone: "555-0102", course: "Piano", level: 3, active: true },
    { id: 3, name: "Michael Brown", email: "michael@example.com", phone: "555-0103", course: "Voice", level: 1, active: true },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    course: "Guitar",
    level: 1,
  });

  const courses = ["Guitar", "Voice", "Piano", "Violin"];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingStudent) {
      setStudents(students.map(s =>
        s.id === editingStudent.id
          ? { ...s, ...formData }
          : s
      ));
    } else {
      setStudents([...students, {
        id: Date.now(),
        ...formData,
        active: true
      }]);
    }

    setShowForm(false);
    setEditingStudent(null);
    setFormData({ name: "", email: "", phone: "", course: "Guitar", level: 1 });
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      phone: student.phone,
      course: student.course,
      level: student.level,
    });
    setShowForm(true);
  };

  const handleArchive = (id) => {
    if (confirm("Are you sure you want to archive this student?")) {
      setStudents(students.map(s =>
        s.id === id ? { ...s, active: false } : s
      ));
    }
  };

  const activeStudents = students.filter(s => s.active);
  const archivedStudents = students.filter(s => !s.active);

  return (

    <div className='min-h-screen flex'>
        <main className="flex-1 p-8 bg-slate-50">
             <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Students</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition"
        >
          <Plus size={20} />
          Add Student
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-bold mb-4">
            {editingStudent ? "Edit Student" : "Add New Student"}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Course</label>
                <select
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                >
                  {courses.map(course => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Level</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition"
              >
                {editingStudent ? "Update" : "Add"} Student
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingStudent(null);
                  setFormData({ name: "", email: "", phone: "", course: "Guitar", level: 1 });
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
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {activeStudents.map((student) => (
              <tr key={student.id}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <User size={20} className="text-orange-600" />
                    <span className="font-medium">{student.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600">{student.email}</td>
                <td className="px-6 py-4 text-gray-600">{student.phone}</td>
                <td className="px-6 py-4 text-gray-600">{student.course}</td>
                <td className="px-6 py-4 text-gray-600">Level {student.level}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(student)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleArchive(student.id)}
                      className="flex items-center gap-1 text-orange-600 hover:text-orange-800"
                    >
                      <Archive size={16} />
                      Archive
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {archivedStudents.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Archived Students</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {archivedStudents.map((student) => (
                  <tr key={student.id} className="opacity-50">
                    <td className="px-6 py-4">{student.name}</td>
                    <td className="px-6 py-4 text-gray-600">{student.email}</td>
                    <td className="px-6 py-4 text-gray-600">{student.course}</td>
                    <td className="px-6 py-4 text-gray-600">Level {student.level}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}</main>
    </div>
  )
}
