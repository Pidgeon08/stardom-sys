import { useState, useEffect } from "react";
import { Plus, Edit, Archive, Music, Loader } from "lucide-react";
import { getCourses, createCourse, updateCourse, archiveCourse } from "../../api/core";
import ConfirmationModal from "../../components/ConfirmationModal";

export default function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const coursesData = await getCourses();
      const coursesArray = Array.isArray(coursesData) ? coursesData : (coursesData?.results || coursesData?.data || []);
      setCourses(coursesArray);
    } catch (err) {
      setError('Failed to load courses');
      console.error(err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [archivingCourseId, setArchivingCourseId] = useState(null);
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
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
      await fetchCourses();
      setShowForm(false);
      setEditingCourse(null);
      setFormData({ name: "", description: "", levels: 1 });
    } catch (err) {
      setError('Failed to save course');
      console.error(err);
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      description: course.description || "",
      levels: course.levels || 1,
    });
    setShowForm(true);
  };

  const handleArchive = (id) => {
    setArchivingCourseId(id);
    setShowArchiveModal(true);
  };

  const confirmArchive = async () => {
    try {
      setArchiveLoading(true);
      await archiveCourse(archivingCourseId);
      await fetchCourses();
      setShowArchiveModal(false);
      setArchivingCourseId(null);
    } catch (err) {
      setError('Failed to archive course');
      console.error(err);
    } finally {
      setArchiveLoading(false);
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
          className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition"
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
                <label className="block text-gray-700 mb-2">Course Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Number of Levels *</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.levels}
                  onChange={(e) => setFormData({ ...formData, levels: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Description (Optional)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                rows={3}
                placeholder="Enter course description (optional)"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition"
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
                    <Music size={20} className="text-orange-600" />
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

      <ConfirmationModal
        isOpen={showArchiveModal}
        title="Archive Course"
        message="Are you sure you want to archive this course? It will no longer be available for new enrollments."
        confirmText="Archive"
        onConfirm={confirmArchive}
        onCancel={() => {
          setShowArchiveModal(false);
          setArchivingCourseId(null);
        }}
        isDangerous={true}
        isLoading={archiveLoading}
      />
    </div>
  );
}