import { useState } from "react";
import { Plus, Edit, Archive, UserCircle } from "lucide-react";

export default function ManageTeachers() {
  const [teachers, setTeachers] = useState([
    { id: 1, name: "Sarah Williams", email: "sarah@musical.com", phone: "555-0201", specialization: "Guitar", experience: 8, active: true },
    { id: 2, name: "David Martinez", email: "david@musical.com", phone: "555-0202", specialization: "Piano", experience: 12, active: true },
    { id: 3, name: "Lisa Anderson", email: "lisa@musical.com", phone: "555-0203", specialization: "Voice", experience: 6, active: true },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "Guitar",
    experience: 1,
  });

  const courses = ["Guitar", "Voice", "Piano", "Violin"];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingTeacher) {
      setTeachers(teachers.map(t =>
        t.id === editingTeacher.id
          ? { ...t, ...formData }
          : t
      ));
    } else {
      setTeachers([...teachers, {
        id: Date.now(),
        ...formData,
        active: true
      }]);
    }

    setShowForm(false);
    setEditingTeacher(null);
    setFormData({ name: "", email: "", phone: "", specialization: "Guitar", experience: 1 });
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone,
      specialization: teacher.specialization,
      experience: teacher.experience,
    });
    setShowForm(true);
  };

  const handleArchive = (id) => {
    if (confirm("Are you sure you want to archive this teacher?")) {
      setTeachers(teachers.map(t =>
        t.id === id ? { ...t, active: false } : t
      ));
    }
  };

  const activeTeachers = teachers.filter(t => t.active);
  const archivedTeachers = teachers.filter(t => !t.active);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Teachers</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
        >
          <Plus size={20} />
          Add Teacher
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-bold mb-4">
            {editingTeacher ? "Edit Teacher" : "Add New Teacher"}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Specialization</label>
                <select
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  {courses.map(course => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Years of Experience</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
              >
                {editingTeacher ? "Update" : "Add"} Teacher
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingTeacher(null);
                  setFormData({ name: "", email: "", phone: "", specialization: "Guitar", experience: 1 });
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Specialization</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Experience</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {activeTeachers.map((teacher) => (
              <tr key={teacher.id}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <UserCircle size={20} className="text-purple-600" />
                    <span className="font-medium">{teacher.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600">{teacher.email}</td>
                <td className="px-6 py-4 text-gray-600">{teacher.phone}</td>
                <td className="px-6 py-4 text-gray-600">{teacher.specialization}</td>
                <td className="px-6 py-4 text-gray-600">{teacher.experience} years</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(teacher)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleArchive(teacher.id)}
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

      {archivedTeachers.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Archived Teachers</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Specialization</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Experience</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {archivedTeachers.map((teacher) => (
                  <tr key={teacher.id} className="opacity-50">
                    <td className="px-6 py-4">{teacher.name}</td>
                    <td className="px-6 py-4 text-gray-600">{teacher.email}</td>
                    <td className="px-6 py-4 text-gray-600">{teacher.specialization}</td>
                    <td className="px-6 py-4 text-gray-600">{teacher.experience} years</td>
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
