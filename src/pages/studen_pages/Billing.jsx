export default function Billing() {
  return (
    <div className="p-6 flex-1">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-800">Billing & Payments</h1>
        <p className="text-xs text-gray-400">Dashboard / Billing & Payments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: "Total Fee", value: "₱6,000", cls: "text-gray-800" },
          { label: "Paid Amount", value: "₱3,000", cls: "text-green-600" },
          { label: "Remaining Balance", value: "₱3,000", cls: "text-red-600" },
          { label: "Payment Status", value: "Partial", cls: "text-orange-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 text-center">
            <p className="text-xs text-gray-400 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.cls}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Payment Details */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5 flex gap-10">
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Payment Details</h2>
          <table className="w-full text-xs">
            <tbody>
              {[
                { label: "Tuition Fee", value: "₱6,000" },
                { label: "Enrollment Fee", value: "₱0" },
                { label: "Total Amount", value: "₱6,000" },
                { label: "Paid Amount", value: "₱3,000" },
                { label: "Remaining Balance", value: "₱3,000", bold: true },
              ].map((r) => (
                <tr key={r.label} className="border-b border-gray-50 last:border-0">
                  <td className="py-2 text-gray-500">{r.label}</td>
                  <td className={`py-2 text-right ${r.bold ? "font-bold text-gray-800" : "text-gray-600"}`}>
                    {r.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pay Now */}
        <div className="flex flex-col items-center justify-center gap-2 min-w-[130px]">
          <button className="w-full bg-red-700 text-white text-xs font-semibold px-5 py-2 rounded hover:bg-red-800 transition-colors">
            Pay Now
          </button>
          <p className="text-[10px] text-gray-400 text-center leading-tight">
            You can pay online via our payment partners.
          </p>
        </div>
      </div>
    </div>
  );
}