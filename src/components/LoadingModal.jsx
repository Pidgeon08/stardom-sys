import { Loader2 } from 'lucide-react'

export default function LoadingModal({ isOpen, message = "Loading..." }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-opacity-100 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xs w-full p-8 flex flex-col items-center">
        <div className="relative mb-6">
          {/* Decorative background circle */}
          <div className="absolute inset-0 bg-orange-100 rounded-full scale-150 blur-xl opacity-50 animate-pulse"></div>
          
          <Loader2 
            size={48} 
            className="text-orange-600 animate-spin relative z-10" 
          />
        </div>
        
        <h3 className="text-xl font-bold text-gray-800 text-center animate-pulse">
          {message}
        </h3>
        
        <p className="text-gray-500 text-sm text-center mt-2 font-medium">
          Please wait a moment.
        </p>
      </div>
    </div>
  )
}
