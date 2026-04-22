import { useState } from "react";
import { Plus, Edit, DollarSign, CheckCircle } from "lucide-react";

export default function ManageBilling() {
  const [billings, setBillings] = useState([
    { id: 1, student: "John Smith", course: "Guitar", amount: 120, dueDate: "2026-04-01", status: "Paid", paidDate: "2026-03-15" },
    { id: 2, student: "Emma Johnson", course: "Piano", amount: 150, dueDate: "2026-04-01", status: "Pending", paidDate: null },
    { id: 3, student: "Michael Brown", course: "Voice", amount: 100, dueDate: "2026-03-25", status: "Overdue", paidDate: null },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingBilling, setEditingBilling] = useState(null);
  const [formData, setFormData] = useState({
    student: "",
    course: "Guitar",
    amount: 0,
    dueDate: "",
  });

  const courses = ["Guitar", "Voice", "Piano", "Violin"];
  const students = ["John Smith", "Emma Johnson", "Michael Brown"];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingBilling) {
      setBillings(billings.map(b =>
        b.id === editingBilling.id
          ? { ...b, ...formData }
          : b
      ));
    } else {
      setBillings([...billings, {
        id: Date.now(),
        ...formData,
        status: "Pending",
        paidDate: null
      }]);
    }

    setShowForm(false);
    setEditingBilling(null);
    setFormData({ student: "", course: "Guitar", amount: 0, dueDate: "" });
  };

  const handleEdit = (billing) => {
    setEditingBilling(billing);
    setFormData({
      student: billing.student,
      course: billing.course,
      amount: billing.amount,
      dueDate: billing.dueDate,
    });
    setShowForm(true);
  };

  const handleMarkAsPaid = (id) => {
    setBillings(billings.map(b =>
      b.id === id
        ? { ...b, status: "Paid", paidDate: new Date().toISOString().split('T')[0] }
        : b
    ));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Paid": return "bg-green-100 text-green-800";
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "Overdue": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const totalRevenue = billings.filter(b => b.status === "Paid").reduce((sum, b) => sum + b.amount, 0);
  const pendingAmount = billings.filter(b => b.status === "Pending").reduce((sum, b) => sum + b.amount, 0);
  const overdueAmount = billings.filter(b => b.status === "Overdue").reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Billing</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
        >
          <Plus size={20} />
          Add Billing
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Revenue</p>
              <p className="text-3xl font-bold text-green-600">₱{totalRevenue.toLocaleString()}</p>
            </div>
            <DollarSign className="text-green-500" size={32} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">₱{pendingAmount.toLocaleString()}</p>
            </div>
            <DollarSign className="text-yellow-500" size={32} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Overdue</p>
              <p className="text-3xl font-bold text-red-600">₱{overdueAmount.toLocaleString()}</p>
            </div>
            <DollarSign className="text-red-500" size={32} />
          </div>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-bold mb-4">
            {editingBilling ? "Edit Billing" : "Add New Billing"}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Student</label>
                <select
                  value={formData.student}
                  onChange={(e) => setFormData({ ...formData, student: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">Select Student</option>
                  {students.map(student => (
                    <option key={student} value={student}>{student}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Course</label>
                <select
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  {courses.map(course => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Amount (₱)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
              >
                {editingBilling ? "Update" : "Add"} Billing
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingBilling(null);
                  setFormData({ student: "", course: "Guitar", amount: 0, dueDate: "" });
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {billings.map((billing) => (
              <tr key={billing.id}>
                <td className="px-6 py-4 font-medium">{billing.student}</td>
                <td className="px-6 py-4 text-gray-600">{billing.course}</td>
                <td className="px-6 py-4 text-gray-900 font-semibold">₱{billing.amount.toLocaleString()}</td>
                <td className="px-6 py-4 text-gray-600">{billing.dueDate}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(billing.status)}`}>
                    {billing.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {billing.status !== "Paid" && (
                      <button
                        onClick={() => handleMarkAsPaid(billing.id)}
                        className="flex items-center gap-1 text-green-600 hover:text-green-800"
                      >
                        <CheckCircle size={16} />
                        Mark Paid
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(billing)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
