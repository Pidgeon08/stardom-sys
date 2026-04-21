import { useState } from "react";
import { Plus, Edit, Archive, Music } from "lucide-react";

export default function ManageCourses() {
  const [courses, setCourses] = useState([
    { id: 1, name: "Guitar", description: "Learn acoustic and electric guitar", levels: 5, active: true },
    { id: 2, name: "Voice", description: "Vocal training and techniques", levels: 4, active: true },
    { id: 3, name: "Piano", description: "Classical and modern piano", levels: 6, active: true },
    { id: 4, name: "Violin", description: "String instrument mastery", levels: 5, active: true },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    levels: 1,
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingCourse) {
      setCourses(courses.map(c =>
        c.id === editingCourse.id
          ? { ...c, ...formData }
          : c
      ));
    } else {
      setCourses([...courses, {
        id: Date.now(),
        ...formData,
        active: true
      }]);
    }

    setShowForm(false);
    setEditingCourse(null);
    setFormData({ name: "", description: "", levels: 1 });
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      description: course.description,
      levels: course.levels,
    });
    setShowForm(true);
  };

  const handleArchive = (id) => {
    if (confirm("Are you sure you want to archive this course?")) {
      setCourses(courses.map(c =>
        c.id === id ? { ...c, active: false } : c
      ));
    }
  };

  const activeCourses = courses.filter(c => c.active);
  const archivedCourses = courses.filter(c => !c.active);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Courses</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
        >
          <Plus size={20} />
          Add Course
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-bold mb-4">
            {editingCourse ? "Edit Course" : "Add New Course"}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Course Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Number of Levels</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.levels}
                  onChange={(e) => setFormData({ ...formData, levels: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={3}
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
              >
                {editingCourse ? "Update" : "Add"} Course
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingCourse(null);
                  setFormData({ name: "", description: "", levels: 1 });
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Levels</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {activeCourses.map((course) => (
              <tr key={course.id}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Music size={20} className="text-purple-600" />
                    <span className="font-medium">{course.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600">{course.description}</td>
                <td className="px-6 py-4 text-gray-600">{course.levels}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(course)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleArchive(course.id)}
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

      {archivedCourses.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Archived Courses</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Levels</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {archivedCourses.map((course) => (
                  <tr key={course.id} className="opacity-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Music size={20} className="text-gray-400" />
                        <span className="font-medium">{course.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{course.description}</td>
                    <td className="px-6 py-4 text-gray-600">{course.levels}</td>
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
