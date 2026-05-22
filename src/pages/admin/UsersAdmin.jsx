import { useState, useEffect } from 'react'
import { Plus, Archive, Loader, X, RotateCcw, Trash2, Key } from 'lucide-react'
import { getUsers, createUser, archiveUser, deleteUser, resetPassword } from '../../api/core'
import api from '../../api/axios'
import ConfirmationModal from '../../components/ConfirmationModal'

export default function UsersAdmin() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [modalError, setModalError] = useState('')
  const [modalLoading, setModalLoading] = useState(false)
  const [showArchiveModal, setShowArchiveModal] = useState(false)
  const [showArchiveListModal, setShowArchiveListModal] = useState(false)
  const [archivingUserId, setArchivingUserId] = useState(null)
  const [archiveLoading, setArchiveLoading] = useState(false)
  const [unarchiveLoading, setUnarchiveLoading] = useState(null)
  const [deletingUserId, setDeletingUserId] = useState(null)
  const [deletingLoading, setDeletingLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [resettingUser, setResettingUser] = useState(null)
  const [resetLoading, setResetLoading] = useState(false)
  const [activeSearch, setActiveSearch] = useState('')
  const [activeRoleFilter, setActiveRoleFilter] = useState('all')
  const [archiveSearch, setArchiveSearch] = useState('')
  const [archiveRoleFilter, setArchiveRoleFilter] = useState('all')
  const DEFAULT_PASSWORD = 'Stardom123'

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    role: 'student',
    password: DEFAULT_PASSWORD,
  })

  const roles = ['student', 'teacher', 'admin']

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const data = await getUsers()
      const usersArray = Array.isArray(data) ? data : (data?.results || data?.data || [])
      setUsers(usersArray)
    } catch (err) {
      setError('Failed to load users')
      console.error(err)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setModalError('')
  }

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      role: 'student',
      password: DEFAULT_PASSWORD,
    })
    setModalError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setModalLoading(true)
    setModalError('')

    try {
      if (!formData.username || !formData.email || !formData.first_name || !formData.last_name) {
        throw new Error('All fields are required')
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        throw new Error('Please enter a valid email address')
      }

      await createUser(formData)
      setSuccess(`User ${formData.first_name} ${formData.last_name} created successfully!`)
      resetForm()
      setShowModal(false)
      await fetchUsers()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setModalError(err.response?.data?.detail || err.message || 'Failed to create user')
      console.error('Error creating user:', err)
    } finally {
      setModalLoading(false)
    }
  }

  const handleArchive = (id) => {
    setArchivingUserId(id)
    setShowArchiveModal(true)
  }

  const confirmArchive = async () => {
    try {
      setArchiveLoading(true)
      await archiveUser(archivingUserId)
      setSuccess('User archived successfully!')
      await fetchUsers()
      setShowArchiveModal(false)
      setArchivingUserId(null)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to archive user')
      console.error(err)
    } finally {
      setArchiveLoading(false)
    }
  }

  const handleUnarchive = async (id) => {
    try {
      setUnarchiveLoading(id)
      await api.patch(`/users/${id}/`, { is_active: true })
      setSuccess('User unarchived successfully!')
      await fetchUsers()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to unarchive user')
      console.error(err)
    } finally {
      setUnarchiveLoading(null)
    }
  }

  const handleDelete = (id) => {
    setDeletingUserId(id)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    try {
      setDeletingLoading(true)
      await deleteUser(deletingUserId)
      setSuccess('User deleted permanently!')
      await fetchUsers()
      setShowDeleteModal(false)
      setDeletingUserId(null)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to delete user: ' + (err.response?.data?.detail || err.message))
      console.error(err)
    } finally {
      setDeletingLoading(false)
    }
  }

  const handleResetPasswordClick = (user) => {
    setResettingUser(user)
    setShowResetModal(true)
  }

  const confirmResetPassword = async () => {
    try {
      setResetLoading(true)
      await resetPassword(resettingUser.id)
      setSuccess(`Password for ${resettingUser.first_name} ${resettingUser.last_name} reset to default '${DEFAULT_PASSWORD}' successfully!`)
      setShowResetModal(false)
      setResettingUser(null)
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to reset password')
      console.error(err)
    } finally {
      setResetLoading(false)
    }
  }

  const handleCloseModal = () => {
    resetForm()
    setShowModal(false)
  }

  const activeUsers = users.filter(u => u.is_active)
  const archivedUsers = users.filter(u => !u.is_active)

  const applyFilters = (list, search, roleFilter) => {
    const q = search.toLowerCase()
    return list.filter(u => {
      const matchesSearch = !q ||
        `${u.first_name} ${u.last_name}`.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      const matchesRole = roleFilter === 'all' || u.role === roleFilter
      return matchesSearch && matchesRole
    })
  }

  const filteredActiveUsers   = applyFilters(activeUsers,   activeSearch,  activeRoleFilter)
  const filteredArchivedUsers = applyFilters(archivedUsers, archiveSearch, archiveRoleFilter)

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-screen">
        <Loader className="animate-spin text-orange-600" size={32} />
      </div>
    )
  }

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex justify-between items-center">
          <span>{success}</span>
          <button onClick={() => setSuccess('')} className="text-green-700 hover:text-green-900">
            <X size={20} />
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-700 hover:text-red-900">
            <X size={20} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Users Management</h1>
        <div className="flex items-center gap-3">
          {/* View Archives Button — white with orange outline */}
          <button
            onClick={() => setShowArchiveListModal(true)}
            className="flex items-center gap-2 bg-white text-orange-600 border-2 border-orange-600 px-4 py-2 rounded-lg hover:bg-orange-50 transition font-medium"
          >
            <Archive size={18} /> View Archives
          </button>
          {/* Add User Button */}
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition font-medium"
          >
            <Plus size={20} /> Add User
          </button>
        </div>
      </div>

      {/* Search & Filter — Active Users */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </span>
          <input
            type="text"
            placeholder="Search by name, username, or email..."
            value={activeSearch}
            onChange={e => setActiveSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-sm"
          />
        </div>
        <select
          value={activeRoleFilter}
          onChange={e => setActiveRoleFilter(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-sm"
        >
          <option value="all">All Roles</option>
          {roles.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
        </select>
      </div>

      {/* Active Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredActiveUsers.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            {activeUsers.length === 0
              ? <><p className="text-lg">No active users found</p><p className="text-sm mt-2">Click "Add User" to create the first user</p></>
              : <p className="text-lg">No users match your search</p>
            }
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Username</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Role</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredActiveUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 text-sm text-slate-800">
                      {user.first_name} {user.last_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{user.username}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin' ? 'bg-red-100 text-red-800' :
                        user.role === 'teacher' ? 'bg-purple-100 text-purple-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleResetPasswordClick(user)}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition text-sm font-medium"
                          title="Reset password"
                        >
                          <Key size={15} /> Reset PW
                        </button>
                        <button
                          onClick={() => handleArchive(user.id)}
                          className="flex items-center gap-1 text-orange-600 hover:text-orange-800 hover:bg-orange-50 px-3 py-1.5 rounded-lg transition text-sm font-medium"
                          title="Archive user"
                        >
                          <Archive size={15} /> Archive
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Add User Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800">Add New User</h2>
              <button onClick={handleCloseModal} className="p-1 hover:bg-slate-100 rounded-lg transition">
                <X size={24} className="text-slate-600" />
              </button>
            </div>

            <div className="p-6">
              {modalError && (
                <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  {modalError}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">First Name *</label>
                    <input type="text" name="first_name" value={formData.first_name} onChange={handleChange}
                      placeholder="John"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Last Name *</label>
                    <input type="text" name="last_name" value={formData.last_name} onChange={handleChange}
                      placeholder="Doe"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Username *</label>
                    <input type="text" name="username" value={formData.username} onChange={handleChange}
                      placeholder="johndoe"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange}
                      placeholder="john@example.com"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Role *</label>
                    <select name="role" value={formData.role} onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required>
                      {roles.map(role => (
                        <option key={role} value={role}>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-slate-700">
                    <span className="font-semibold">Default Password:</span> {DEFAULT_PASSWORD}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">Users should change their password on first login.</p>
                </div>

                <div className="flex gap-4 justify-end">
                  <button type="button" onClick={handleCloseModal}
                    className="bg-slate-300 text-slate-800 px-4 py-2 rounded-lg hover:bg-slate-400 transition font-medium">
                    Cancel
                  </button>
                  <button type="submit" disabled={modalLoading}
                    className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition font-medium disabled:bg-orange-400 flex items-center gap-2">
                    {modalLoading && <Loader size={18} className="animate-spin" />}
                    {modalLoading ? 'Creating...' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Archive List Modal ── */}
      {showArchiveListModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Archive size={20} className="text-orange-600" /> Archived Users
              </h2>
              <button onClick={() => setShowArchiveListModal(false)} className="text-slate-400 hover:text-slate-600 transition">
                <X size={22} />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 px-6 py-3 border-b bg-white">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                </span>
                <input
                  type="text"
                  placeholder="Search by name, username, or email..."
                  value={archiveSearch}
                  onChange={e => setArchiveSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                />
              </div>
              <select
                value={archiveRoleFilter}
                onChange={e => setArchiveRoleFilter(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              >
                <option value="all">All Roles</option>
                {roles.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
              </select>
            </div>

            <div className="overflow-y-auto flex-1">
              {filteredArchivedUsers.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  {archivedUsers.length === 0 ? 'No archived users yet.' : 'No users match your search.'}
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-slate-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Username</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Role</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredArchivedUsers.map(user => (
                      <tr key={user.id} className="opacity-60 hover:opacity-100 transition-opacity">
                        <td className="px-6 py-4 text-sm text-slate-800">{user.first_name} {user.last_name}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{user.username}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.role === 'admin' ? 'bg-red-100 text-red-800' :
                            user.role === 'teacher' ? 'bg-purple-100 text-purple-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center gap-2 justify-center">
                            <button
                              onClick={() => handleUnarchive(user.id)}
                              disabled={unarchiveLoading === user.id}
                              className="flex items-center gap-1 text-green-600 hover:text-green-800 hover:bg-green-50 px-3 py-1.5 rounded-lg transition text-sm font-medium disabled:opacity-50"
                              title="Unarchive user"
                            >
                              {unarchiveLoading === user.id
                                ? <Loader size={14} className="animate-spin" />
                                : <RotateCcw size={14} />}
                              Unarchive
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="flex items-center gap-1 text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1.5 rounded-lg transition text-sm font-medium"
                              title="Delete user permanently"
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

            <div className="px-6 py-4 border-t bg-slate-50 rounded-b-xl">
              <p className="text-sm text-slate-500">
                Showing {filteredArchivedUsers.length} of {archivedUsers.length} archived user{archivedUsers.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Confirmation Modal */}
      <ConfirmationModal
        isOpen={showResetModal}
        title="Reset Password"
        message={`Are you sure you want to reset the password for ${resettingUser?.first_name} ${resettingUser?.last_name} (${resettingUser?.username}) to the default password '${DEFAULT_PASSWORD}'?`}
        confirmText="Reset Password"
        onConfirm={confirmResetPassword}
        onCancel={() => {
          setShowResetModal(false)
          setResettingUser(null)
        }}
        isDangerous={false}
        isLoading={resetLoading}
      />

      {/* Archive Confirmation Modal */}
      <ConfirmationModal
        isOpen={showArchiveModal}
        title="Archive User"
        message="Are you sure you want to archive this user? They will no longer be able to log in."
        confirmText="Archive"
        onConfirm={confirmArchive}
        onCancel={() => {
          setShowArchiveModal(false)
          setArchivingUserId(null)
        }}
        isDangerous={true}
        isLoading={archiveLoading}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Delete User"
        message="This will permanently delete the user account and all associated data (Student/Teacher records, schedules, billing). This action cannot be undone."
        confirmText="Delete Forever"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteModal(false)
          setDeletingUserId(null)
        }}
        isDangerous={true}
        isLoading={deletingLoading}
      />
    </div>
  )
}
