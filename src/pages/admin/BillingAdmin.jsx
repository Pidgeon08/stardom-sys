import { useState, useEffect } from 'react'
import { Plus, Edit, DollarSign, CheckCircle } from 'lucide-react'
import { getBillings, createBilling, updateBilling, markBillingPaid, getStudents, getCourses } from '../../api/core'

export default function BillingAdmin() {
  const [billings, setBillings]   = useState([])
  const [students, setStudents]   = useState([])
  const [courses, setCourses]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [editingBilling, setEditing] = useState(null)
  const [formData, setFormData]   = useState({ student:'', course:'', amount:0, due_date:'', payment_type:'fullpayment' })

  useEffect(() => {
    Promise.all([getBillings(), getStudents(), getCourses()])
      .then(([b, s, c]) => {
        const toArray = (res) => Array.isArray(res) ? res : (res?.results || res?.data || [])
        // FIX 1: use toArray() instead of .data, and is_active instead of .active
        setBillings(toArray(b))
        setStudents(toArray(s).filter(s => s.is_active))
        setCourses(toArray(c).filter(c => c.is_active))
      })
      .catch(() => alert('Failed to load billing data'))
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingBilling) {
        // FIX 2: handle both direct response and Axios-style { data } response
        const res = await updateBilling(editingBilling.id, formData)
        const data = res?.data ?? res
        setBillings(billings.map(b => b.id === data.id ? data : b))
      } else {
        const res = await createBilling({ ...formData, status:'Pending' })
        const data = res?.data ?? res
        setBillings([...billings, data])
      }
      resetForm()
    } catch { alert('Failed to save billing') }
  }

  const handleMarkPaid = async (id) => {
    try {
      const res = await markBillingPaid(id)
      const data = res?.data ?? res
      setBillings(billings.map(b => b.id === id ? data : b))
    } catch { alert('Failed to mark as paid') }
  }

  const handleEdit = (billing) => {
    setEditing(billing)
    setFormData({ student:billing.student, course:billing.course, amount:billing.amount, due_date:billing.due_date, payment_type:billing.payment_type || 'fullpayment' })
    setShowForm(true)
  }

  const resetForm = () => {
    setShowForm(false); setEditing(null)
    setFormData({ student:'', course:'', amount:0, due_date:'', payment_type:'fullpayment' })
  }

  const getStatusColor = (status) => ({
    Paid:    'bg-green-100 text-green-800',
    Pending: 'bg-yellow-100 text-yellow-800',
    Overdue: 'bg-red-100 text-red-800',
  }[status] ?? 'bg-gray-100 text-gray-800')

  const totalRevenue  = billings.filter(b => b.status==='Paid').reduce((s,b) => s + parseFloat(b.amount || 0), 0)
  const pendingAmount = billings.filter(b => b.status==='Pending').reduce((s,b) => s + parseFloat(b.amount || 0), 0)
  const overdueAmount = billings.filter(b => b.status==='Overdue').reduce((s,b) => s + parseFloat(b.amount || 0), 0)

  if (loading) return <div className="p-8 text-gray-500">Loading billing...</div>

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Billing</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition">
          <Plus size={20} /> Add Billing
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label:'Total Revenue',  value:totalRevenue,  color:'text-green-600',  icon:'text-green-500'  },
          { label:'Pending',        value:pendingAmount, color:'text-yellow-600', icon:'text-yellow-500' },
          { label:'Overdue',        value:overdueAmount, color:'text-red-600',    icon:'text-red-500'    },
        ].map(({ label, value, color, icon }) => (
          <div key={label} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{label}</p>
                <p className={`text-3xl font-bold ${color}`}>₱{value.toLocaleString()}</p>
              </div>
              <DollarSign className={icon} size={32} />
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-bold mb-4">{editingBilling ? 'Edit Billing' : 'Add New Billing'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Student</label>
                <select value={formData.student} onChange={e => setFormData({...formData, student:e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" required>
                  <option value="">Select Student</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.user?.first_name} {s.user?.last_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Course</label>
                <select value={formData.course} onChange={e => setFormData({...formData, course:e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" required>
                  <option value="">Select Course</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Amount (₱)</label>
                <input type="number" min="0" step="0.01" value={formData.amount}
                  onChange={e => setFormData({...formData, amount:parseFloat(e.target.value)})}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" required />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Due Date</label>
                <input type="date" value={formData.due_date}
                  onChange={e => setFormData({...formData, due_date:e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" required />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Payment Type</label>
                <select value={formData.payment_type} onChange={e => setFormData({...formData, payment_type:e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" required>
                  <option value="fullpayment">Full Payment</option>
                  <option value="downpayment">Down Payment</option>
                  <option value="online">Online</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition">
                {editingBilling ? 'Update' : 'Add'} Billing
              </button>
              <button type="button" onClick={resetForm}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50"><tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-200">
            {billings.map(billing => (
              <tr key={billing.id}>
                <td className="px-6 py-4 font-medium">{billing.student_name}</td>
                <td className="px-6 py-4 text-gray-600">{billing.course_name}</td>
                <td className="px-6 py-4 font-semibold">₱{parseFloat(billing.amount || 0).toLocaleString()}</td>
                <td className="px-6 py-4 text-gray-600 capitalize">{billing.payment_type_display || billing.payment_type || 'N/A'}</td>
                <td className="px-6 py-4 text-gray-600">{billing.due_date}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(billing.status)}`}>{billing.status}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {billing.status !== 'Paid' && (
                      <button onClick={() => handleMarkPaid(billing.id)}
                        className="flex items-center gap-1 text-green-600 hover:text-green-800">
                        <CheckCircle size={16} /> Mark Paid
                      </button>
                    )}
                    <button onClick={() => handleEdit(billing)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800">
                      <Edit size={16} /> Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}