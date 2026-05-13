import { X, AlertTriangle } from 'lucide-react'

export default function ConfirmationModal({ isOpen, title, message, confirmText, onConfirm, onCancel, isDangerous = false, isLoading = false }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-opacity-100 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {isDangerous && <AlertTriangle size={24} className="text-red-600" />}
            <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          <p className="text-gray-700">{message}</p>
        </div>

        {/* Modal Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2 rounded-lg transition font-medium disabled:opacity-50 ${
              isDangerous
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-orange-600 text-white hover:bg-orange-700'
            }`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
