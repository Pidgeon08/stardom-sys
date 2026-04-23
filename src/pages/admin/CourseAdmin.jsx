import { useState, useEffect } from "react";
import { Plus, Edit, Archive, Music, Loader } from "lucide-react";
import { getCourses, createCourse, updateCourse, archiveCourse, getTeachers } from "../../api/core";

export default function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [coursesData, teachersData] = await Promise.all([getCourses(), getTeachers()]);
      const coursesArray = Array.isArray(coursesData) ? coursesData : (coursesData?.results || coursesData?.data || []);
      const teachersArray = Array.isArray(teachersData) ? teachersData : (teachersData?.results || teachersData?.data || []);
      setCourses(coursesArray);
      setTeachers(teachersArray);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
      setCourses([]);
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    teacher: "",
    levels: 1,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingCourse) {
        await updateCourse(editingCourse.id, formData);
      } else {
        await createCourse(formData);
      }
      await fetchData();
      setShowForm(false);
      setEditingCourse(null);
      setFormData({ name: "", description: "", teacher: "", levels: 1 });
    } catch (err) {
      setError('Failed to save course');
      console.error(err);
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      description: course.description,
      teacher: course.teacher || "",
      levels: course.levels || 1,
    });
    setShowForm(true);
  };

  const handleArchive = async (id) => {
    if (confirm("Are you sure you want to archive this course?")) {
      try {
        await archiveCourse(id);
        await fetchData(); // FIX 4: was incorrectly calling fetchCourses()
      } catch (err) {
        setError('Failed to archive course');
        console.error(err);
      }
    }
  };

  const activeCourses = courses.filter(c => c.is_active);
  const archivedCourses = courses.filter(c => !c.is_active);

  if (loading) return <div className="p-8 flex justify-center"><Loader className="animate-spin" /></div>;

  return (
    <div className="p-8">
      {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>}
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
              {/* FIX 1: Restored missing opening <label> tag for Teacher field */}
              <div>
                <label className="block text-gray-700 mb-2">Teacher</label>
                <select
                  value={formData.teacher}
                  onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">Select a teacher</option>
                  {teachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                  ))}
                </select>
              </div>
              {/* FIX 2: Removed duplicate <label> tag for Levels field */}
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
              {/* FIX 3: Removed junk text "teacher: ""," appended to required attribute */}
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
                  setFormData({ name: "", description: "", teacher: "", levels: 1 });
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