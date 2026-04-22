import { useState } from "react";

export default function Profile() {
  const [editing, setEditing] = useState(false);
  const [fields, setFields] = useState({
    fullName: "Juan Dela Cruz",
    email: "juan.delacruz@email.com",
    phone: "0912 345 6789",
    address: "123 Music St., Quezon City, Metro Manila",
  });

  return (
    <div className="p-6 flex-1">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-800">My Profile</h1>
        <p className="text-xs text-gray-400">Dashboard / My Profile</p>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5 mb-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-semibold text-gray-700">Personal Information</h2>
          <button
            onClick={() => setEditing(!editing)}
            className="flex items-center gap-1.5 bg-red-700 text-white text-xs px-3 py-1.5 rounded hover:bg-red-800 transition-colors font-medium"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            {editing ? "Save" : "Edit"}
          </button>
        </div>

        <div className="flex gap-6">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300 overflow-hidden">
              <svg className="w-14 h-14 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <button className="text-xs text-red-600 font-medium hover:underline">Change Photo</button>
          </div>

          {/* Fields */}
          <div className="flex-1 grid grid-cols-2 gap-4">
            {[
              { key: "fullName", label: "Full Name" },
              { key: "email", label: "Email" },
              { key: "phone", label: "Phone Number" },
              { key: "address", label: "Address" },
            ].map((f) => (
              <div key={f.key}>
                <p className="text-xs text-gray-400 mb-0.5">{f.label}</p>
                {editing ? (
                  <input
                    value={fields[f.key]}
                    onChange={(e) => setFields({ ...fields, [f.key]: e.target.value })}
                    className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:border-red-400"
                  />
                ) : (
                  <p className="text-xs text-gray-700 font-medium">{fields[f.key]}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Change Password</h2>
        <div className="grid grid-cols-3 gap-4 mb-4">
          {["Current Password", "New Password", "Confirm New Password"].map((label) => (
            <div key={label}>
              <p className="text-xs text-gray-400 mb-1">{label}</p>
              <input
                type="password"
                defaultValue="••••••••"
                className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:border-red-400"
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <button className="bg-red-700 text-white text-xs px-4 py-2 rounded hover:bg-red-800 transition-colors font-medium">
            Update Password
          </button>
        </div>
      </div>
    </div>
  );
}