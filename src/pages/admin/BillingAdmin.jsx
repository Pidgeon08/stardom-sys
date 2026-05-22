import { useState, useEffect } from 'react'
import {
  Plus,
  Edit,
  CreditCard,
  CheckCircle,
  Archive,
  RotateCcw,
  Trash2,
  Loader,
  X,
} from 'lucide-react'

import {
  getBillings,
  createBilling,
  updateBilling,
  markBillingPaid,
  getStudents,
  getCourses,
  archiveBilling,
  deleteBilling,
} from '../../api/core'

import ConfirmationModal from '../../components/ConfirmationModal'
import api from '../../api/axios'

export default function BillingAdmin() {
  const [billings, setBillings] = useState([])
  const [students, setStudents] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  const [showForm, setShowForm] = useState(false)
  const [editingBilling, setEditing] = useState(null)

  const [showArchiveListModal, setShowArchiveListModal] = useState(false)
  const [showArchiveModal, setShowArchiveModal] = useState(false)
  const [archivingBillingId, setArchivingBillingId] = useState(null)
  const [archiveLoading, setArchiveLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingBillingId, setDeletingBillingId] = useState(null)
  const [deletingLoading, setDeletingLoading] = useState(false)
  const [unarchiveLoading, setUnarchiveLoading] = useState(null)

  // Filtering for active billings
  const [activeSearch, setActiveSearch] = useState('')
  const [activeStatusFilter, setActiveStatusFilter] = useState('all')

  // Filtering for archived billings
  const [archiveSearch, setArchiveSearch] = useState('')
  const [archiveStatusFilter, setArchiveStatusFilter] = useState('all')

  const [formData, setFormData] = useState({
    student: '',
    course: '',
    amount: 0,
    due_date: '',
    payment_type: 'fullpayment',
  })

  useEffect(() => {
    Promise.all([
      getBillings(),
      getStudents(),
      getCourses(),
    ])
      .then(([b, s, c]) => {
        const toArray = (res) =>
          Array.isArray(res)
            ? res
            : res?.results || res?.data || []

        setBillings(toArray(b))

        setStudents(
          toArray(s).filter((s) => s.is_active)
        )

        setCourses(
          toArray(c).filter((c) => c.is_active)
        )
      })
      .catch(() => alert('Failed to load billing data'))
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (editingBilling) {
        const res = await updateBilling(
          editingBilling.id,
          formData
        )

        const data = res?.data ?? res

        setBillings(
          billings.map((b) =>
            b.id === data.id ? data : b
          )
        )
      } else {
        const res = await createBilling({
          ...formData,
          status: 'Pending',
        })

        const data = res?.data ?? res

        setBillings([...billings, data])
      }

      resetForm()
    } catch {
      alert('Failed to save billing')
    }
  }

  const handleMarkPaid = async (id) => {
    try {
      const res = await markBillingPaid(id)
      const data = res?.data ?? res

      setBillings(
        billings.map((b) =>
          b.id === id ? data : b
        )
      )
    } catch (err) {
      alert('Failed to mark as paid')
      console.error(err)
    }
  }

  const handleArchive = (id) => {
    setArchivingBillingId(id)
    setShowArchiveModal(true)
  }

  const confirmArchive = async () => {
    try {
      setArchiveLoading(true)
      const res = await archiveBilling(archivingBillingId)
      const data = res?.data ?? res

      setBillings(
        billings.map((b) =>
          b.id === archivingBillingId ? data : b
        )
      )
      setShowArchiveModal(false)
      setArchivingBillingId(null)
    } catch (err) {
      alert('Failed to archive billing')
      console.error(err)
    } finally {
      setArchiveLoading(false)
    }
  }

  const handleUnarchive = async (id) => {
    try {
      setUnarchiveLoading(id)
      const res = await api.patch(`/billings/${id}/`, { is_active: true })
      const data = res?.data ?? res

      setBillings(
        billings.map((b) =>
          b.id === id ? data : b
        )
      )
    } catch (err) {
      alert('Failed to unarchive billing')
      console.error(err)
    } finally {
      setUnarchiveLoading(null)
    }
  }

  const handleDelete = (id) => {
    setDeletingBillingId(id)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    try {
      setDeletingLoading(true)
      await deleteBilling(deletingBillingId)
      setBillings(billings.filter((b) => b.id !== deletingBillingId))
      setShowDeleteModal(false)
      setDeletingBillingId(null)
    } catch (err) {
      alert('Failed to delete billing')
      console.error(err)
    } finally {
      setDeletingLoading(false)
    }
  }

  const handleEdit = (billing) => {
    setEditing(billing)

    setFormData({
      student: billing.student,
      course: billing.course,
      amount: billing.amount,
      due_date: billing.due_date,
      payment_type:
        billing.payment_type || 'fullpayment',
    })

    setShowForm(true)
  }

  const resetForm = () => {
    setShowForm(false)

    setEditing(null)

    setFormData({
      student: '',
      course: '',
      amount: 0,
      due_date: '',
      payment_type: 'fullpayment',
    })
  }

  const getStatusColor = (status) =>
    ({
      Paid: 'bg-green-100 text-green-800',
      Pending: 'bg-yellow-100 text-yellow-800',
      Overdue: 'bg-red-100 text-red-800',
    }[status] ?? 'bg-gray-100 text-gray-800')

  const totalRevenue = billings
    .filter((b) => b.status === 'Paid')
    .reduce(
      (s, b) => s + parseFloat(b.amount || 0),
      0
    )

  const pendingAmount = billings
    .filter((b) => b.status === 'Pending')
    .reduce(
      (s, b) => s + parseFloat(b.amount || 0),
      0
    )

  const overdueAmount = billings
    .filter((b) => b.status === 'Overdue')
    .reduce(
      (s, b) => s + parseFloat(b.amount || 0),
      0
    )

  const activeBillings = billings.filter((b) => b.is_active)
  const archivedBillings = billings.filter((b) => !b.is_active)

  const applyFilters = (list, search, statusFilter) => {
    const q = search.toLowerCase()
    return list.filter((b) => {
      const matchesSearch =
        !q ||
        (b.student_name && b.student_name.toLowerCase().includes(q)) ||
        (b.course_name && b.course_name.toLowerCase().includes(q))
      const matchesStatus = statusFilter === 'all' || b.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }

  const filteredActiveBillings = applyFilters(
    activeBillings,
    activeSearch,
    activeStatusFilter
  )

  const filteredArchivedBillings = applyFilters(
    archivedBillings,
    archiveSearch,
    archiveStatusFilter
  )

  if (loading) {
    return (
      <div className="p-8 text-gray-500">
        Loading billing...
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Manage Billing
        </h1>

        <div className="flex items-center gap-3">
          {/* View Archives Button — white with orange outline */}
          <button
            onClick={() => setShowArchiveListModal(true)}
            className="flex items-center gap-2 bg-white text-orange-600 border-2 border-orange-600 px-4 py-2 rounded-lg hover:bg-orange-50 transition font-medium"
          >
            <Archive size={18} /> View Archives
          </button>

          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition font-medium"
          >
            <Plus size={20} />
            Add Billing
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          {
            label: 'Total Revenue',
            value: totalRevenue,
            color: 'text-green-600',
            icon: 'text-green-500',
          },
          {
            label: 'Pending',
            value: pendingAmount,
            color: 'text-yellow-600',
            icon: 'text-yellow-500',
          },
          {
            label: 'Overdue',
            value: overdueAmount,
            color: 'text-red-600',
            icon: 'text-red-500',
          },
        ].map(({ label, value, color, icon }) => (
          <div
            key={label}
            className="bg-white p-6 rounded-lg shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">
                  {label}
                </p>

                <p
                  className={`text-3xl font-bold ${color}`}
                >
                  ₱{value.toLocaleString()}
                </p>
              </div>

              <CreditCard
                className={icon}
                size={32}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingBilling
                ? 'Edit Billing'
                : 'Add New Billing'}
            </h2>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Student */}
              <div>
                <label className="block text-gray-700 mb-2">
                  Student
                </label>

                <select
                  value={formData.student}
                  onChange={(e) => {
                    const studentId = e.target.value;
                    const selectedStudent = students.find(s => s.id == studentId);
                    let newCourse = formData.course;
                    
                    if (selectedStudent && selectedStudent.enrolled_courses) {
                      if (selectedStudent.enrolled_courses.length === 1) {
                        newCourse = selectedStudent.enrolled_courses[0].id;
                      } else if (!selectedStudent.enrolled_courses.find(c => c.id == newCourse)) {
                        newCourse = '';
                      }
                    } else {
                      newCourse = '';
                    }

                    setFormData({
                      ...formData,
                      student: studentId,
                      course: newCourse,
                    })
                  }}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                >
                  <option value="">
                    Select Student
                  </option>

                  {students.map((s) => (
                    <option
                      key={s.id}
                      value={s.id}
                    >
                      {s.user?.first_name}{' '}
                      {s.user?.last_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Course */}
              <div>
                <label className="block text-gray-700 mb-2">
                  Course
                </label>

                <select
                  value={formData.course}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      course: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                >
                  <option value="">
                    Select Course
                  </option>

                  {formData.student ? (
                    students.find(s => s.id == formData.student)?.enrolled_courses?.map((c) => (
                      <option
                        key={c.id}
                        value={c.id}
                      >
                        {c.name}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>Select a student first</option>
                  )}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-gray-700 mb-2">
                  Amount (₱)
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      amount: parseFloat(
                        e.target.value
                      ),
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  required
                />
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-gray-700 mb-2">
                  Due Date
                </label>

                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      due_date: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              {/* Payment Type */}
              <div>
                <label className="block text-gray-700 mb-2">
                  Payment Type
                </label>

                <select
                  value={formData.payment_type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      payment_type:
                        e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                >
                  <option value="fullpayment">
                    Full Payment
                  </option>

                  <option value="downpayment">
                    Down Payment
                  </option>

                  <option value="online">
                    Online
                  </option>
                </select>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition"
              >
                {editingBilling
                  ? 'Update'
                  : 'Add'}{' '}
                Billing
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </form>
          </div>
        </div>
      )}

      {/* Search & Filter — Active Billings */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search by student or course..."
            value={activeSearch}
            onChange={(e) => setActiveSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-sm"
          />
        </div>
        <select
          value={activeStatusFilter}
          onChange={(e) => setActiveStatusFilter(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-sm"
        >
          <option value="all">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Overdue">Overdue</option>
          <option value="Paid">Paid</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredActiveBillings.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            {activeBillings.length === 0 ? (
              <>
                <p className="text-lg">No active billings found</p>
                <p className="text-sm mt-2">Click "Add Billing" to create the first billing record</p>
              </>
            ) : (
              <p className="text-lg">No billings match your search</p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Payment Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredActiveBillings.map((billing) => (
                  <tr key={billing.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-slate-800">
                      {billing.student_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {billing.course_name}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                      ₱{parseFloat(billing.amount || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                      {billing.payment_type_display ||
                        billing.payment_type ||
                        'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {billing.due_date}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          billing.status
                        )}`}
                      >
                        {billing.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        {billing.status !== 'Paid' && (
                          <button
                            onClick={() => handleMarkPaid(billing.id)}
                            className="flex items-center gap-1 text-green-600 hover:text-green-800 font-medium text-sm"
                            title="Mark as paid"
                          >
                            <CheckCircle size={15} />
                            Mark Paid
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(billing)}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-sm"
                          title="Edit billing"
                        >
                          <Edit size={15} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleArchive(billing.id)}
                          className="flex items-center gap-1 text-orange-600 hover:text-orange-800 font-medium text-sm"
                          title="Archive billing"
                        >
                          <Archive size={15} />
                          Archive
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

      {/* ── Archive List Modal ── */}
      {showArchiveListModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Archive size={20} className="text-orange-600" /> Archived Billings
              </h2>
              <button
                onClick={() => setShowArchiveListModal(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X size={22} />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 px-6 py-3 border-b bg-white">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Search by student or course..."
                  value={archiveSearch}
                  onChange={(e) => setArchiveSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                />
              </div>
              <select
                value={archiveStatusFilter}
                onChange={(e) => setArchiveStatusFilter(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Overdue">Overdue</option>
                <option value="Paid">Paid</option>
              </select>
            </div>

            <div className="overflow-y-auto flex-1">
              {filteredArchivedBillings.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  {archivedBillings.length === 0
                    ? 'No archived billings yet.'
                    : 'No billings match your search.'}
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-slate-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                        Course
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                        Due Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredArchivedBillings.map((billing) => (
                      <tr
                        key={billing.id}
                        className="opacity-80 hover:opacity-100 transition-opacity"
                      >
                        <td className="px-6 py-4 text-sm text-slate-800 font-medium">
                          {billing.student_name}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {billing.course_name}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-800 font-semibold">
                          ₱{parseFloat(billing.amount || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {billing.due_date}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              billing.status
                            )}`}
                          >
                            {billing.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center gap-2 justify-center">
                            <button
                              onClick={() => handleUnarchive(billing.id)}
                              disabled={unarchiveLoading === billing.id}
                              className="flex items-center gap-1 text-green-600 hover:text-green-800 hover:bg-green-50 px-3 py-1.5 rounded-lg transition text-sm font-medium disabled:opacity-50"
                              title="Unarchive billing"
                            >
                              {unarchiveLoading === billing.id ? (
                                <Loader size={14} className="animate-spin" />
                              ) : (
                                <RotateCcw size={14} />
                              )}
                              Unarchive
                            </button>
                            <button
                              onClick={() => handleDelete(billing.id)}
                              className="flex items-center gap-1 text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1.5 rounded-lg transition text-sm font-medium"
                              title="Delete billing permanently"
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
                Showing {filteredArchivedBillings.length} of{' '}
                {archivedBillings.length} archived billing
                {archivedBillings.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Archive Confirmation Modal */}
      <ConfirmationModal
        isOpen={showArchiveModal}
        title="Archive Billing"
        message="Are you sure you want to archive this billing record? It will be moved to archives."
        confirmText="Archive"
        onConfirm={confirmArchive}
        onCancel={() => {
          setShowArchiveModal(false)
          setArchivingBillingId(null)
        }}
        isDangerous={true}
        isLoading={archiveLoading}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Delete Billing"
        message="This will permanently delete this billing record. This action cannot be undone."
        confirmText="Delete Forever"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteModal(false)
          setDeletingBillingId(null)
        }}
        isDangerous={true}
        isLoading={deletingLoading}
      />
    </div>
  )
}