import { useState, useEffect } from "react";
import { Plus, Edit, Archive, Music, Loader, X, RotateCcw, Trash2 } from "lucide-react";
import { getCourses, createCourse, updateCourse, archiveCourse, deleteCourse } from "../../api/core";
import api from "../../api/axios";
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
  const [showArchiveListModal, setShowArchiveListModal] = useState(false);
  const [unarchiveLoading, setUnarchiveLoading] = useState(null);
  const [deletingCourseId, setDeletingCourseId] = useState(null);
  const [deletingLoading, setDeletingLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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

  const handleUnarchive = async (id) => {
    try {
      setUnarchiveLoading(id);
      await api.patch(`/courses/${id}/`, { is_active: true });
      await fetchCourses();
    } catch (err) {
      setError('Failed to unarchive course');
      console.error(err);
    } finally {
      setUnarchiveLoading(null);
    }
  };

  const handleDelete = (id) => {
    setDeletingCourseId(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeletingLoading(true);
      await deleteCourse(deletingCourseId);
      await fetchCourses();
      setShowDeleteModal(false);
      setDeletingCourseId(null);
    } catch (err) {
      setError('Failed to delete course');
      console.error(err);
    } finally {
      setDeletingLoading(false);
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowArchiveListModal(true)}
            className="flex items-center gap-2 bg-white text-orange-600 border-2 border-orange-600 px-4 py-2 rounded-lg hover:bg-orange-50 transition"
          >
            <Archive size={18} />
            View Archived
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition"
          >
            <Plus size={20} />
            Add Course
          </button>
        </div>
      </div>

      {/* Add / Edit Course Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-800">
                {editingCourse ? "Edit Course" : "Add New Course"}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingCourse(null);
                  setFormData({ name: "", description: "", levels: 1 });
                }}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X size={22} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Course Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Piano Basics"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Number of Levels *</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.levels}
                    onChange={(e) => setFormData({ ...formData, levels: parseInt(e.target.value) })}
                    placeholder="3"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">Description (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows={3}
                  placeholder="Enter course description (optional)"
                />
              </div>
              <div className="flex gap-4 px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-xl">
                <button
                  type="submit"
                  className="flex-1 bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition font-medium"
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
                  className="flex-1 bg-slate-300 text-slate-800 px-6 py-2 rounded-lg hover:bg-slate-400 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Active Courses Table */}
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

      {/* Archive List Modal */}
      {showArchiveListModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Archive size={20} className="text-orange-600" /> Archived Courses
              </h2>
              <button onClick={() => setShowArchiveListModal(false)} className="text-slate-400 hover:text-slate-600 transition">
                <X size={22} />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-4">
              {archivedCourses.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No archived courses.</div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Levels</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {archivedCourses.map(course => (
                      <tr key={course.id} className="opacity-60 hover:opacity-100 transition-opacity">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Music size={20} className="text-gray-400" />
                            <span className="font-medium text-slate-800">{course.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{course.description}</td>
                        <td className="px-6 py-4 text-gray-600">{course.levels}</td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleUnarchive(course.id)}
                              disabled={unarchiveLoading === course.id}
                              className="flex items-center gap-1 text-green-600 hover:text-green-800 hover:bg-green-50 px-3 py-1.5 rounded-lg transition text-sm font-medium disabled:opacity-50"
                              title="Unarchive course"
                            >
                              {unarchiveLoading === course.id
                                ? <Loader size={14} className="animate-spin" />
                                : <RotateCcw size={14} />}
                              Unarchive
                            </button>
                            <button
                              onClick={() => handleDelete(course.id)}
                              className="flex items-center gap-1 text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1.5 rounded-lg transition text-sm font-medium"
                              title="Delete course permanently"
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Archive Confirmation Modal */}
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

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Delete Course"
        message="This will permanently delete the course. This action cannot be undone."
        confirmText="Delete Forever"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteModal(false);
          setDeletingCourseId(null);
        }}
        isDangerous={true}
        isLoading={deletingLoading}
      />
    </div>
  );
}