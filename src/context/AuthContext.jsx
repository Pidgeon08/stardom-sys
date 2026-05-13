import {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react'

import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  const [loading, setLoading] = useState(true)

  // ================= RESTORE SESSION =================
  useEffect(() => {
    const token = localStorage.getItem('access_token')

    if (token) {
      api
        .get('/auth/me/')
        .then((res) => {

          // Normalize role
          const normalizedUser = {
            ...res.data,

            role:
              typeof res.data.role === 'string'
                ? res.data.role.toLowerCase()
                : res.data.role?.name?.toLowerCase(),
          }

          setUser(normalizedUser)
        })

        .catch((error) => {
          console.error('Session restore failed:', error)

          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')

          setUser(null)
        })

        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  // ================= LOGIN =================
  const login = async (username, password) => {
    try {
      const { data } = await api.post(
        '/auth/login/',
        {
          username,
          password,
        }
      )

      // Save tokens
      localStorage.setItem(
        'access_token',
        data.tokens.access
      )

      localStorage.setItem(
        'refresh_token',
        data.tokens.refresh
      )

      // Normalize role
      const normalizedUser = {
        ...data.user,

        role:
          typeof data.user.role === 'string'
            ? data.user.role.toLowerCase()
            : data.user.role?.name?.toLowerCase(),
      }

      setUser(normalizedUser)

      return normalizedUser

    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  // ================= LOGOUT =================
  const logout = async () => {
    try {
      const refreshToken =
        localStorage.getItem('refresh_token')

      await api.post('/auth/logout/', {
        refresh: refreshToken,
      })

    } catch (error) {
      console.error(
        'Logout request failed:',
        error
      )

    } finally {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')

      setUser(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// ================= CUSTOM HOOK =================
export const useAuth = () => {
  return useContext(AuthContext)
}