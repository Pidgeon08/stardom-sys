import React, { useState } from 'react'
import { Settings, Lock, CheckCircle2, AlertCircle, Save } from 'lucide-react'
import { changePassword } from '../../api/core'
import { useAuth } from '../../context/AuthContext'

export default function SettingsTeacher() {
  const { user } = useAuth()

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // Validation functions
  const validatePassword = (password) => {
    const errors = []
    if (password.length < 10 || password.length > 20) {
      errors.push('Must be between 10 and 20 characters')
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Must contain at least one uppercase letter')
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Must contain at least one lowercase letter')
    }
    if (!/\d/.test(password)) {
      errors.push('Must contain at least one digit')
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Must contain at least one special character')
    }
    return errors
  }

  const handleChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    })
    setErrorMsg('')
    setSuccessMsg('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (!passwordData.currentPassword) {
      setErrorMsg('Please enter your current password.')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMsg('New passwords do not match.')
      return
    }

    const validationErrors = validatePassword(passwordData.newPassword)
    if (validationErrors.length > 0) {
      setErrorMsg(validationErrors.join('. '))
      return
    }

    if (!user?.id) {
      setErrorMsg('User identity could not be verified.')
      return
    }

    setLoading(true)
    try {
      // Assuming backend expects these fields
      await changePassword(user.id, {
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword
      })

      setSuccessMsg('Password successfully changed!')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (err) {
      // Handle the "past password" error if backend returns one, or standard errors
      const message = err.response?.data?.message || err.response?.data?.detail || err.response?.data?.error || 'Failed to change password. It may be a past password or incorrect current password.'
      setErrorMsg(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="mb-8 border-l-4 border-orange-600 pl-4">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
          <Settings className="text-orange-600" size={32} />
          Settings
        </h1>
        <p className="text-slate-500 mt-1">
          Manage your account preferences and security
        </p>
      </div>

      <div className="max-w-2xl bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
          <div className="bg-orange-100 p-3 rounded-xl">
            <Lock className="text-orange-600" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Change Password</h2>
            <p className="text-sm text-slate-500">Update your account password</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex gap-3 text-red-700 items-start">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <p className="text-sm font-medium leading-relaxed">{errorMsg}</p>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex gap-3 text-emerald-700 items-center">
            <CheckCircle2 size={20} />
            <p className="text-sm font-bold">{successMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Current Password</label>
            <input
              type="password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handleChange}
              className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              placeholder="Enter current password"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">New Password</label>
            <input
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handleChange}
              className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              placeholder="Enter new password"
            />
            <div className="mt-2 text-xs text-slate-500 space-y-1">
              <p>Requirements:</p>
              <ul className="list-disc pl-5 space-y-0.5">
                <li>10 to 20 characters</li>
                <li>At least one uppercase and one lowercase letter</li>
                <li>At least one number and one special character</li>
                <li>Cannot be a previously used password</li>
              </ul>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handleChange}
              className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              placeholder="Confirm new password"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white" />
                  Updating...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save Password
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
