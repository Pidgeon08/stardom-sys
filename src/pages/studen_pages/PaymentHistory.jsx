export default function PaymentHistory() {
  const records = [
    { date: "May 15, 2025", amount: "₱1,000", method: "GCash", status: "Paid" },
    { date: "Apr 15, 2025", amount: "₱1,000", method: "Maya", status: "Paid" },
    { date: "Mar 15, 2025", amount: "₱1,000", method: "Bank Transfer", status: "Paid" },
  ];

  return (
    <div className="p-6 flex-1">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-800">Payment History</h1>
        <p className="text-xs text-gray-400">Dashboard / Payment History</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-gray-400 border-b border-gray-100">
              {["Date", "Amount", "Payment Method", "Status", "Receipt"].map((h) => (
                <th key={h} className="text-left pb-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((r, i) => (
              <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                <td className="py-3 text-gray-600">{r.date}</td>
                <td className="py-3 font-semibold text-gray-700">{r.amount}</td>
                <td className="py-3 text-gray-600">{r.method}</td>
                <td className="py-3">
                  <span className="bg-green-100 text-green-700 text-xs px-2.5 py-0.5 rounded-full font-medium">
                    {r.status}
                  </span>
                </td>
                <td className="py-3">
                  <button className="text-red-500 hover:text-red-700 transition-colors" title="Download Receipt">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-gray-400 mt-4 pt-3 border-t border-gray-50">
          Showing 1 to 3 of 3 entries
        </p>
      </div>
    </div>
  );
}