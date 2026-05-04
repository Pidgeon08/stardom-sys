import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader, Archive, X } from 'lucide-react'
import { createUser } from '../../api/core'

export default function AddUser() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showArchiveModal, setShowArchiveModal] = useState(false)
  const [archivedUsers, setArchivedUsers] = useState([])
  const [archiveLoading, setArchiveLoading] = useState(false)
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

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

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
      setFormData({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        role: 'student',
        password: DEFAULT_PASSWORD,
      })
      setTimeout(() => navigate('/admin'), 2000)
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to create user')
      console.error('Error creating user:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenArchive = async () => {
    setShowArchiveModal(true)
    setArchiveLoading(true)
    try {
      // TODO: Replace with your actual API call, e.g. getArchivedUsers() or getUsers({ is_active: false })
      // const res = await getArchivedUsers()
      // const toArray = (r) => Array.isArray(r) ? r : (r?.results || r?.data || [])
      // setArchivedUsers(toArray(res))
      setArchivedUsers([]) // placeholder until API is wired
    } catch (err) {
      console.error('Failed to load archived users:', err)
    } finally {
      setArchiveLoading(false)
    }
  }

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin')}
              className="p-2 hover:bg-slate-200 rounded-lg transition"
            >
              <ArrowLeft size={24} className="text-slate-600" />
            </button>
            <h1 className="text-3xl font-bold text-slate-800">Add New User</h1>
          </div>

          {/* View Archives button — white with orange outline */}
          <button
            onClick={handleOpenArchive}
            className="flex items-center gap-2 bg-white text-orange-600 border-2 border-orange-600 px-4 py-2 rounded-lg hover:bg-orange-50 transition font-medium"
          >
            <Archive size={18} /> View Archives
          </button>
        </div>

        {/* Error / Success */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg shadow p-8">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">First Name *</label>
                <input type="text" name="first_name" value={formData.first_name} onChange={handleChange}
                  placeholder="John"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Last Name *</label>
                <input type="text" name="last_name" value={formData.last_name} onChange={handleChange}
                  placeholder="Doe"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Username *</label>
                <input type="text" name="username" value={formData.username} onChange={handleChange}
                  placeholder="johndoe"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email *</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange}
                  placeholder="john@example.com"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Role *</label>
                <select name="role" value={formData.role} onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" required>
                  {roles.map(role => (
                    <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
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

            <div className="flex gap-4">
              <button type="submit" disabled={loading}
                className="flex-1 bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition font-medium disabled:bg-orange-400 flex items-center justify-center gap-2">
                {loading && <Loader size={18} className="animate-spin" />}
                {loading ? 'Creating User...' : 'Create User'}
              </button>
              <button type="button" onClick={() => navigate('/admin')}
                className="flex-1 bg-slate-300 text-slate-800 px-6 py-2 rounded-lg hover:bg-slate-400 transition font-medium">
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-8 p-6 bg-slate-100 rounded-lg">
          <h3 className="font-semibold text-slate-800 mb-2">Information</h3>
          <ul className="text-sm text-slate-700 space-y-1">
            <li>• Username must be unique</li>
            <li>• Email must be valid and unique</li>
            <li>• Default password: <span className="font-mono">{DEFAULT_PASSWORD}</span></li>
            <li>• Users can change their password after logging in</li>
          </ul>
        </div>
      </div>

      {/* ── Archive List Modal ── */}
      {showArchiveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col">

            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Archive size={20} className="text-orange-600" /> Archived Users
              </h2>
              <button onClick={() => setShowArchiveModal(false)} className="text-gray-400 hover:text-gray-600 transition">
                <X size={22} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1">
              {archiveLoading ? (
                <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
                  <Loader size={20} className="animate-spin" /> Loading archived users...
                </div>
              ) : archivedUsers.length === 0 ? (
                <div className="py-16 text-center text-gray-400">
                  <Archive size={36} className="mx-auto mb-3 opacity-40" />
                  <p className="font-medium">No archived users found.</p>
                  <p className="text-sm mt-1 text-gray-400">Wire up the API call in <span className="font-mono">handleOpenArchive</span> to populate this list.</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {archivedUsers.map(user => (
                      <tr key={user.id} className="opacity-60 hover:opacity-100 transition-opacity">
                        <td className="px-6 py-4 text-sm font-medium text-gray-800">
                          {user.first_name} {user.last_name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 font-mono">{user.username}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium capitalize">
                            {user.role}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t bg-gray-50 rounded-b-xl flex justify-between items-center">
              <p className="text-sm text-gray-500">
                {archiveLoading ? '—' : `${archivedUsers.length} archived user${archivedUsers.length !== 1 ? 's' : ''}`}
              </p>
              <button onClick={() => setShowArchiveModal(false)}
                className="bg-white text-orange-600 border-2 border-orange-600 px-4 py-1.5 rounded-lg hover:bg-orange-50 transition text-sm font-medium">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


// import { useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { ArrowLeft, Loader } from 'lucide-react'
// import { createUser } from '../../api/core'

// export default function AddUser() {
//   const navigate = useNavigate()
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState('')
//   const [success, setSuccess] = useState('')
//   const DEFAULT_PASSWORD = 'Stardom123'

//   const [formData, setFormData] = useState({
//     username: '',
//     email: '',
//     first_name: '',
//     last_name: '',
//     role: 'student',
//     password: DEFAULT_PASSWORD,
//   })

//   const roles = ['student', 'teacher', 'admin']

//   const handleChange = (e) => {
//     const { name, value } = e.target
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }))
//     setError('')
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setLoading(true)
//     setError('')
//     setSuccess('')

//     try {
//       // Validate required fields
//       if (!formData.username || !formData.email || !formData.first_name || !formData.last_name) {
//         throw new Error('All fields are required')
//       }

//       // Validate email format
//       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
//       if (!emailRegex.test(formData.email)) {
//         throw new Error('Please enter a valid email address')
//       }

//       await createUser(formData)
//       setSuccess(`User ${formData.first_name} ${formData.last_name} created successfully!`)
      
//       // Reset form
//       setFormData({
//         username: '',
//         email: '',
//         first_name: '',
//         last_name: '',
//         role: 'student',
//         password: DEFAULT_PASSWORD,
//       })

//       // Redirect after 2 seconds
//       setTimeout(() => {
//         navigate('/admin')
//       }, 2000)
//     } catch (err) {
//       setError(err.response?.data?.detail || err.message || 'Failed to create user')
//       console.error('Error creating user:', err)
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="p-8 bg-slate-50 min-h-screen">
//       <div className="max-w-2xl mx-auto">
//         {/* Header */}
//         <div className="flex items-center gap-4 mb-8">
//           <button
//             onClick={() => navigate('/admin')}
//             className="p-2 hover:bg-slate-200 rounded-lg transition"
//           >
//             <ArrowLeft size={24} className="text-slate-600" />
//           </button>
//           <h1 className="text-3xl font-bold text-slate-800">Add New User</h1>
//         </div>

//         {/* Error Message */}
//         {error && (
//           <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
//             {error}
//           </div>
//         )}

//         {/* Success Message */}
//         {success && (
//           <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
//             {success}
//           </div>
//         )}

//         {/* Form */}
//         <div className="bg-white rounded-lg shadow p-8">
//           <form onSubmit={handleSubmit}>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//               {/* First Name */}
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-2">
//                   First Name *
//                 </label>
//                 <input
//                   type="text"
//                   name="first_name"
//                   value={formData.first_name}
//                   onChange={handleChange}
//                   placeholder="John"
//                   className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
//                   required
//                 />
//               </div>

//               {/* Last Name */}
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-2">
//                   Last Name *
//                 </label>
//                 <input
//                   type="text"
//                   name="last_name"
//                   value={formData.last_name}
//                   onChange={handleChange}
//                   placeholder="Doe"
//                   className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
//                   required
//                 />
//               </div>

//               {/* Username */}
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-2">
//                   Username *
//                 </label>
//                 <input
//                   type="text"
//                   name="username"
//                   value={formData.username}
//                   onChange={handleChange}
//                   placeholder="johndoe"
//                   className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
//                   required
//                 />
//               </div>

//               {/* Email */}
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-2">
//                   Email *
//                 </label>
//                 <input
//                   type="email"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleChange}
//                   placeholder="john@example.com"
//                   className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
//                   required
//                 />
//               </div>

//               {/* Role */}
//               <div className="md:col-span-2">
//                 <label className="block text-sm font-medium text-slate-700 mb-2">
//                   Role *
//                 </label>
//                 <select
//                   name="role"
//                   value={formData.role}
//                   onChange={handleChange}
//                   className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
//                   required
//                 >
//                   {roles.map(role => (
//                     <option key={role} value={role} className="capitalize">
//                       {role.charAt(0).toUpperCase() + role.slice(1)}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>

//             {/* Password Info */}
//             <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
//               <p className="text-sm text-slate-700">
//                 <span className="font-semibold">Default Password:</span> {DEFAULT_PASSWORD}
//               </p>
//               <p className="text-xs text-slate-600 mt-1">
//                 Users should change their password on first login.
//               </p>
//             </div>

//             {/* Buttons */}
//             <div className="flex gap-4">
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="flex-1 bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition font-medium disabled:bg-orange-400 flex items-center justify-center gap-2"
//               >
//                 {loading && <Loader size={18} className="animate-spin" />}
//                 {loading ? 'Creating User...' : 'Create User'}
//               </button>
//               <button
//                 type="button"
//                 onClick={() => navigate('/admin')}
//                 className="flex-1 bg-slate-300 text-slate-800 px-6 py-2 rounded-lg hover:bg-slate-400 transition font-medium"
//               >
//                 Cancel
//               </button>
//             </div>
//           </form>
//         </div>

//         {/* Info Box */}
//         <div className="mt-8 p-6 bg-slate-100 rounded-lg">
//           <h3 className="font-semibold text-slate-800 mb-2">Information</h3>
//           <ul className="text-sm text-slate-700 space-y-1">
//             <li>• Username must be unique</li>
//             <li>• Email must be valid and unique</li>
//             <li>• Default password: <span className="font-mono">{DEFAULT_PASSWORD}</span></li>
//             <li>• Users can change their password after logging in</li>
//           </ul>
//         </div>
//       </div>
//     </div>
//   )
// }
