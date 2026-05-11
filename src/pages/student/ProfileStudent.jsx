import { User, Mail, BookOpen } from 'lucide-react'

export default function ProfileStudent() {
  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">
        My Profile
      </h1>

      <div className="bg-white rounded-xl shadow p-8 max-w-3xl">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center">
            <User size={40} className="text-blue-600" />
          </div>

          <div>
            <h2 className="text-2xl font-bold">
              Juan Dela Cruz
            </h2>

            <p className="text-gray-500">
              Student
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Mail className="text-blue-600" />
            <span>juan@gmail.com</span>
          </div>

          <div className="flex items-center gap-4">
            <BookOpen className="text-blue-600" />
            <span>Piano Beginner</span>
          </div>
        </div>
      </div>
    </div>
  )
}