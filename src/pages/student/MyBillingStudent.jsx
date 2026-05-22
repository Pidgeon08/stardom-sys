import { useEffect, useState } from 'react'
import { Loader } from 'lucide-react'
import { getBillings, getStudents } from '../../api/core'
import { useAuth } from '../../context/AuthContext'

export default function MyBillingStudent() {
  const { user } = useAuth()
  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchBills()
    }
  }, [user])

  const fetchBills = async () => {
    try {
      const [billingsRes, studentsRes] = await Promise.all([
        getBillings(),
        getStudents()
      ])

      const toArray = (res) => Array.isArray(res) ? res : (res?.results || res?.data || [])

      const allStudents = toArray(studentsRes)
      const currentStudent = allStudents.find(s =>
        (s.user?.id || s.user) == user?.id ||
        (s.user?.username || s.username) == user?.username
      )
      const studentId = currentStudent?.id

      const allBillings = toArray(billingsRes)
      const myBillings = studentId
        ? allBillings.filter(b => (b.student?.id || b.student) == studentId)
        : []

      setBills(myBillings)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const totalPending = bills
    .filter(bill => bill.status?.toLowerCase() === 'pending')
    .reduce((sum, bill) => sum + parseFloat(bill.amount || 0), 0)

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <Loader className="animate-spin text-orange-600" />
      </div>
    )
  }

  return (
    <div className="p-8 bg-slate-50 min-h-screen">

      {/* Header */}
      <div className="mb-8 border-l-4 border-orange-600 pl-4">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
          My Billing
        </h1>

        <p className="text-slate-500 mt-1">
          Track your lesson payments and balances
        </p>
      </div>

      {/* Billing Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full">

          {/* Table Header */}
          <thead className="bg-orange-600 text-white">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wide">
                Description
              </th>

              <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wide">
                Amount
              </th>

              <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wide">
                Status
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {bills.length > 0 ? (
              bills.map((bill) => (
                <tr
                  key={bill.id}
                  className="border-b border-slate-100 hover:bg-orange-50/60 transition-colors"
                >
                  {/* Description */}
                  <td className="px-6 py-4 font-medium text-slate-700">
                    {bill.description || 'Billing'}
                  </td>

                  {/* Amount */}
                  <td className="px-6 py-4 font-semibold text-slate-800">
                    ₱{parseFloat(bill.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                        bill.status?.toLowerCase() === 'paid'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          : 'bg-orange-50 text-orange-600 border-orange-100'
                      }`}
                    >
                      {bill.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="3"
                  className="text-center py-12 text-slate-400"
                >
                  No billing records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Card */}
      <div className="mt-6 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-slate-400">
            Total Pending Balance
          </p>

          <h2 className="text-3xl font-bold text-orange-600 mt-2">
            ₱{totalPending.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
        </div>
      </div>
    </div>
  )
}