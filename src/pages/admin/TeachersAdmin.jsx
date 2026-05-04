import { useState, useEffect } from "react";
import { Plus, Edit, Archive, UserCircle, Loader, X } from "lucide-react";
import { getTeachers, createTeacher, updateTeacher, archiveTeacher } from "../../api/core";
import api from "../../api/axios";

export default function ManageTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    name: "",
    username: "",
    email: "",
    password: "",
    phone: "",
    specialization_ids: [],
    experience: 1,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingTeacher) {
        await updateTeacher(editingTeacher.id, formData);
      } else {
        await createTeacher(formData);
      }
      await fetchData();
      setShowForm(false);
      setEditingTeacher(null);
      setFormData({ name: "", username: "", email: "", password: "", phone: "", specialization_ids: [], experience: 1 });
    } catch (err) {
      setError("Failed to save teacher");
      console.error(err);
    }
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name || "",
      username: teacher.user?.username || "",
      email: teacher.email || "",
      password: "",
      phone: teacher.phone || "",
      specialization_ids: teacher.specializations?.map(s => s.id) || [],
      experience: teacher.experience || 1,
    });
    setShowForm(true);
  };

  const handleArchive = async (id) => {
    if (confirm("Are you sure you want to archive this teacher?")) {
      try {
        await archiveTeacher(id);
        await fetchData();
      } catch (err) {
        setError("Failed to archive teacher");
        console.error(err);
      }
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
      {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Teachers</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition"
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
                <label className="block text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Username *</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                  disabled={!!editingTeacher}
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              {!editingTeacher && (
                <div>
                  <label className="block text-gray-700 mb-2">Password *</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
              )}
              <div>
                <label className="block text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Years of Experience *</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2 font-medium">Specializations *</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {specializations.map(spec => (
                  <label key={spec.id} className="flex items-center gap-2 p-3 border rounded-lg hover:bg-orange-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.specialization_ids.includes(spec.id)}
                      onChange={() => toggleSpecialization(spec.id)}
                      className="w-4 h-4 text-orange-600 rounded focus:ring-2 focus:ring-orange-500"
                    />
                    <span className="text-gray-700">{spec.name}</span>
                  </label>
                ))}
              </div>
              {formData.specialization_ids.length === 0 && (
                <p className="text-red-600 text-sm mt-2">Please select at least one specialization</p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={formData.specialization_ids.length === 0}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition disabled:bg-gray-400"
              >
                {editingTeacher ? "Update" : "Add"} Teacher
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingTeacher(null);
                  setFormData({ name: "", username: "", email: "", password: "", phone: "", specialization_ids: [], experience: 1 });
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
                    <span className="font-medium">{teacher.name}</span>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Specializations</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Experience</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {archivedTeachers.map((teacher) => (
                  <tr key={teacher.id} className="opacity-50">
                    <td className="px-6 py-4">{teacher.name}</td>
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
    </div>
  );
}