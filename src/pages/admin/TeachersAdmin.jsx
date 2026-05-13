import { useState, useEffect } from "react";
import { Plus, Edit, Archive, UserCircle, Loader, X } from "lucide-react";
import { getTeachers, createTeacher, updateTeacher, archiveTeacher } from "../../api/core";
import api from "../../api/axios";
import ConfirmationModal from "../../components/ConfirmationModal";

export default function ManageTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [teacherToArchive, setTeacherToArchive] = useState(null);
  
  const DEFAULT_PASSWORD = "Stardom123";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [teachersData, specsData] = await Promise.all([
        getTeachers(),
        api.get('/specializations/')
      ]);
      
      const teachersArray = Array.isArray(teachersData) ? teachersData : (teachersData?.results || teachersData?.data || []);
      const specsArray = Array.isArray(specsData.data) ? specsData.data : (specsData.data?.results || specsData.data?.data || []);
      
      setTeachers(teachersArray);
      setSpecializations(specsArray);
    } catch (err) {
      setError("Failed to load data");
      console.error(err);
      setTeachers([]);
      setSpecializations([]);
    } finally {
      setLoading(false);
    }
  };

  const [showForm, setShowForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: DEFAULT_PASSWORD,
    phone: "",
    specialization_ids: [],
    experience: 1,
  });

  const resetForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      username: "",
      email: "",
      password: DEFAULT_PASSWORD,
      phone: "",
      specialization_ids: [],
      experience: 1,
    });
    setEditingTeacher(null);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      // Prepare clean payload
      const payload = { ...formData };
      
      if (editingTeacher) {
        // Remove fields that often cause 500 errors on profile updates
        delete payload.password;
        delete payload.username;
      }

      if (editingTeacher) {
        await updateTeacher(editingTeacher.id, payload);
      } else {
        await createTeacher(payload);
      }
      
      await fetchData();
      setShowForm(false);
      resetForm();
    } catch (err) {
      const msg = err.response?.data?.detail 
        || err.response?.data?.error 
        || (typeof err.response?.data === 'string' ? err.response?.data : null)
        || err.message 
        || "Failed to save teacher";
      setError(msg);
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      username: teacher.user?.username || "",
      first_name: teacher.user?.first_name || "",
      last_name: teacher.user?.last_name || "",
      email: teacher.email || "",
      // Do NOT include password on edit to avoid accidental 500s
      phone: teacher.phone || "",
      specialization_ids: teacher.specializations?.map(s => s.id) || [],
      experience: teacher.experience || 1,
    });
    setError("");
    setShowForm(true);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowForm(true);
  };

  const handleOpenArchive = (id) => {
    setTeacherToArchive(id);
    setShowArchiveModal(true);
  };

  const confirmArchive = async () => {
    try {
      await archiveTeacher(teacherToArchive);
      await fetchData();
      setShowArchiveModal(false);
      setTeacherToArchive(null);
    } catch (err) {
      setError("Failed to archive teacher");
      console.error(err);
    }
  };

  const toggleSpecialization = (specId) => {
    setFormData(prev => ({
      ...prev,
      specialization_ids: prev.specialization_ids.includes(specId)
        ? prev.specialization_ids.filter(id => id !== specId)
        : [...prev.specialization_ids, specId]
    }));
  };

  const activeTeachers = teachers.filter(t => t.is_active);
  const archivedTeachers = teachers.filter(t => !t.is_active);

  if (loading) return <div className="p-8 flex justify-center"><Loader className="animate-spin" /></div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Teachers</h1>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition"
        >
          <Plus size={20} />
          Add Teacher
        </button>
      </div>

      {showForm && (
  <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden">
      <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-800">
          {editingTeacher ? "Edit Teacher" : "Add New Teacher"}
        </h2>
        <button
          onClick={() => {
            setShowForm(false);
            resetForm();
          }}
          className="text-slate-400 hover:text-slate-600 transition"
        >
          <X size={22} />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto">
        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm font-medium animate-shake">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">First Name *</label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                placeholder="John"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Last Name *</label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                placeholder="Doe"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Username *</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="johndoe"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
                disabled={!!editingTeacher}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(555) 000-0000"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Years of Experience *</label>
              <input
                type="number"
                min="1"
                max="50"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) })}
                placeholder="5"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">Specializations *</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-lg">
              {specializations.map(spec => (
                <label key={spec.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 p-2 rounded transition">
                  <input
                    type="checkbox"
                    checked={formData.specialization_ids.includes(spec.id)}
                    onChange={() => toggleSpecialization(spec.id)}
                    className="w-4 h-4 text-orange-600 rounded accent-orange-600 focus:ring-2 focus:ring-orange-500"
                  />
                  <span className="text-sm text-slate-700">{spec.name}</span>
                </label>
              ))}
            </div>
            {formData.specialization_ids.length === 0 && (
              <p className="text-red-600 text-xs mt-2">Please select at least one specialization</p>
            )}
          </div>
        </div>

        <div className="flex gap-4 px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-xl mt-auto">
          <button
            type="submit"
            disabled={formData.specialization_ids.length === 0 || submitting}
            className="flex-1 bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition font-medium disabled:bg-orange-400 flex items-center justify-center gap-2"
          >
            {submitting && <Loader size={18} className="animate-spin" />}
            {editingTeacher ? (submitting ? "Updating..." : "Update Teacher") : (submitting ? "Adding..." : "Add Teacher")}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowForm(false);
              resetForm();
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

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Specializations</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Experience</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {activeTeachers.map((teacher) => (
              <tr key={teacher.id}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <UserCircle size={20} className="text-orange-600" />
                    <span className="font-medium">
                      {teacher.user && teacher.user.first_name && teacher.user.last_name
                        ? `${teacher.user.first_name} ${teacher.user.last_name}`
                        : 'Unknown'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600">{teacher.email}</td>
                <td className="px-6 py-4 text-gray-600">{teacher.phone}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    {teacher.specializations?.map(spec => (
                      <span key={spec.id} className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-sm">
                        {spec.name}
                      </span>
                    ))}
                  </div>
                </td>
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
                      onClick={() => handleOpenArchive(teacher.id)}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Specializations</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Experience</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {archivedTeachers.map((teacher) => (
                  <tr key={teacher.id} className="opacity-50">
                    <td className="px-6 py-4">{teacher.user?.first_name} {teacher.user?.last_name}</td>
                    <td className="px-6 py-4 text-gray-600">{teacher.email}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {teacher.specializations?.map(spec => (
                          <span key={spec.id} className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-sm">
                            {spec.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{teacher.experience} years</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showArchiveModal}
        title="Archive Teacher"
        message="Are you sure you want to archive this teacher? They will no longer be able to access the system."
        confirmText="Archive"
        onConfirm={confirmArchive}
        onCancel={() => {
          setShowArchiveModal(false);
          setTeacherToArchive(null);
        }}
        isDangerous={true}
      />
    </div>
  );
}