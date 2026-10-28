import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export interface AuthUser {
  id: string
  name: string
  email: string
  avatar?: string
  isAdmin?: boolean
}

interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  login: (values: { identifier: string; password: string }) => Promise<void>
  register: (values: { username: string; email: string; password: string }) => Promise<void>
  // Always resolves, even if the email isn't registered — the server
  // intentionally never reveals whether an account exists for it.
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (values: { token: string; password: string }) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const API_URL = import.meta.env.VITE_API_URL

// Thrown for failed sign-in / sign-up. `fields` maps form field names to the
// server's message for that field (e.g. { username: 'That username is taken' }).
export class AuthError extends Error {
  fields?: Record<string, string>
  code?: string

  constructor(message: string, fields?: Record<string, string>, code?: string) {
    super(message)
    this.name = 'AuthError'
    this.fields = fields
    this.code = code
  }
}

async function authRequest<T>(
  path: '/login' | '/register' | '/forgot-password' | '/reset-password',
  body: object,
): Promise<T> {
  const res = await fetch(`${API_URL}/auth${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const json = await res.json().catch(() => null)
  if (!res.ok) {
    throw new AuthError(json?.error?.message ?? 'Something went wrong. Please try again.', json?.error?.details, json?.error?.code)
  }
  return json.data as T
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    fetch(`${API_URL}/auth/user`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setUser(data)
      })
      .catch(() => {
        if (!cancelled) setUser(null)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const login: AuthContextValue['login'] = async (values) => {
    setUser(await authRequest<AuthUser>('/login', values))
  }

  const register: AuthContextValue['register'] = async (values) => {
    setUser(await authRequest<AuthUser>('/register', values))
  }

  const forgotPassword: AuthContextValue['forgotPassword'] = async (email) => {
    await authRequest<{ message: string }>('/forgot-password', { email })
  }

  // On success the server also starts a session (see auth.controller.js), so
  // the account is signed in immediately — no separate login step needed.
  const resetPassword: AuthContextValue['resetPassword'] = async (values) => {
    setUser(await authRequest<AuthUser>('/reset-password', values))
  }

  const logout = () => {
    window.location.href = `${API_URL}/auth/logout`
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, forgotPassword, resetPassword, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}


// import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

// export interface AuthUser {
//   id: string
//   name: string
//   email: string
//   avatar?: string
// }

// interface AuthContextValue {
//   user: AuthUser | null
//   isLoading: boolean
//   login: (email: string, password: string) => Promise<void>
//   logout: () => void
// }

// const AuthContext = createContext<AuthContextValue | undefined>(undefined)

// const API_URL = import.meta.env.VITE_API_URL

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [user, setUser] = useState<AuthUser | null>(null)
//   const [isLoading, setIsLoading] = useState(true)

//   useEffect(() => {
//     let cancelled = false
//     const token = localStorage.getItem('token')

//     if (!token) {
//       setIsLoading(false)
//       return
//     }

//     fetch(`${API_URL}/auth/me`, {
//       headers: { Authorization: `Bearer ${token}` },
//     })
//       .then((res) => {
//         if (!res.ok) throw new Error('Invalid session')
//         return res.json()
//       })
//       .then((res) => {
//         if (!cancelled) setUser(res.data)
//       })
//       .catch(() => {
//         if (!cancelled) {
//           localStorage.removeItem('token')
//           setUser(null)
//         }
//       })
//       .finally(() => {
//         if (!cancelled) setIsLoading(false)
//       })

//     return () => {
//       cancelled = true
//     }
//   }, [])

//   const login = async (email: string, password: string) => {
//     const res = await fetch(`${API_URL}/auth/login`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ email, password }),
//     })

//     if (!res.ok) throw new Error('Login failed')

//     const { data } = await res.json()
//     localStorage.setItem('token', data.token)
//     setUser(data.user)
//   }

//   const logout = () => {
//     localStorage.removeItem('token')
//     setUser(null)
//   }

//   return (
//     <AuthContext.Provider value={{ user, isLoading, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   )
// }

// export function useAuth() {
//   const ctx = useContext(AuthContext)
//   if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
//   return ctx
// }


// const { login } = useAuth()

// const handleSubmit = async (e) => {
//   e.preventDefault()
//   try {
//     await login(email, password)
//     navigate('/dashboard')
//   } catch {
//     setError('Invalid credentials')
//   }
// }


// src/components/ProtectedRoute.tsx
// import { Navigate } from 'react-router-dom'
// import { useAuth } from '../context/AuthContext'
// import type { ReactNode } from 'react'

// export function ProtectedRoute({ children }: { children: ReactNode }) {
//   const { user, isLoading } = useAuth()

//   if (isLoading) return <p>Loading...</p>
//   if (!user) return <Navigate to="/login" replace />

//   return <>{children}</>
// }

// src/api/todos.ts — a small helper so components don't repeat fetch/header logic

// typescript
// const API_URL = import.meta.env.VITE_API_URL

// export interface Todo {
//   id: string
//   title: string
//   isDone: boolean
// }

// const authHeaders = () => ({
//   Authorization: `Bearer ${localStorage.getItem('token')}`,
// })

// export async function fetchTodos(): Promise<Todo[]> {
//   const res = await fetch(`${API_URL}/todos`, { headers: authHeaders() })
//   if (!res.ok) throw new Error('Failed to fetch todos')
//   const { data } = await res.json()
//   return data
// }

// src/api/todos.ts — a small helper so components don't repeat fetch/header logic

// typescript
// const API_URL = import.meta.env.VITE_API_URL

// export interface Todo {
//   id: string
//   title: string
//   isDone: boolean
// }

// const authHeaders = () => ({
//   Authorization: `Bearer ${localStorage.getItem('token')}`,
// })

// export async function fetchTodos(): Promise<Todo[]> {
//   const res = await fetch(`${API_URL}/todos`, { headers: authHeaders() })
//   if (!res.ok) throw new Error('Failed to fetch todos')
//   const { data } = await res.json()
//   return data
// }



// src/pages/TodosPage.tsx — the actual listing page

// import { useQuery } from '@tanstack/react-query'
// import { fetchTodos } from '../api/todos'
// import { useAuth } from '../context/AuthContext'

// export function TodosPage() {
//   const { user, logout } = useAuth()

//   const { data: todos, isLoading, isError } = useQuery({
//     queryKey: ['todos'],
//     queryFn: fetchTodos,
//   })

//   if (isLoading) return <p>Loading todos...</p>
//   if (isError) return <p>Something went wrong loading your todos.</p>

//   return (
//     <div>
//       <header>
//         <p>Welcome, {user?.name}</p>
//         <button onClick={logout}>Logout</button>
//       </header>

//       <ul>
//         {todos?.map((todo) => (
//           <li key={todo.id}>
//             {todo.title} — {todo.isDone ? '✅' : '⏳'}
//           </li>
//         ))}
//       </ul>
//     </div>
//   )
// }

// src/pages/LoginPage.tsx

// import { useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { useAuth } from '../context/AuthContext'

// export function LoginPage() {
//   const { login } = useAuth()
//   const navigate = useNavigate()
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [error, setError] = useState('')

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     try {
//       await login(email, password)
//       navigate('/todos')
//     } catch {
//       setError('Invalid email or password')
//     }
//   }

//   return (
//     <form onSubmit={handleSubmit}>
//       <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
//       <input
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//         placeholder="Password"
//         type="password"
//       />
//       {error && <p>{error}</p>}
//       <button type="submit">Login</button>
//     </form>
//   )
// }


// src/App.tsx — ties everything together

// import { BrowserRouter, Routes, Route } from 'react-router-dom'
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// import { AuthProvider } from './context/AuthContext'
// import { ProtectedRoute } from './components/ProtectedRoute'
// import { LoginPage } from './pages/LoginPage'
// import { TodosPage } from './pages/TodosPage'

// const queryClient = new QueryClient()

// function App() {
//   return (
//     <QueryClientProvider client={queryClient}>
//       <AuthProvider>
//         <BrowserRouter>
//           <Routes>
//             <Route path="/login" element={<LoginPage />} />
//             <Route
//               path="/todos"
//               element={
//                 <ProtectedRoute>
//                   <TodosPage />
//                 </ProtectedRoute>
//               }
//             />
//           </Routes>
//         </BrowserRouter>
//       </AuthProvider>
//     </QueryClientProvider>
//   )
// }

// export default App



/* <Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/> */



// api/apiClient.ts
// const API_BASE = `${import.meta.env.VITE_API_URL}/api/v1`

// export class ApiError extends Error {
//   status: number
//   code?: string
//   constructor(message: string, status: number, code?: string) {
//     super(message)
//     this.name = 'ApiError'
//     this.status = status
//     this.code = code
//   }
// }

// interface ErrorBody {
//   error?: { message?: string; code?: string }
// }

// let refreshPromise: Promise<string> | null = null

// async function refreshAccessToken(): Promise<string> {
//   const refreshToken = localStorage.getItem('refreshToken')
//   if (!refreshToken) throw new ApiError('No refresh token', 401, 'NO_REFRESH_TOKEN')

//   const res = await fetch(`${API_BASE}/auth/refresh`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ refreshToken }),
//   })

//   if (!res.ok) {
//     localStorage.removeItem('token')
//     localStorage.removeItem('refreshToken')
//     throw new ApiError('Session expired', 401, 'REFRESH_FAILED')
//   }

//   const { data } = await res.json()
//   localStorage.setItem('token', data.accessToken)
//   return data.accessToken
// }

// async function request<T>(path: string, options?: RequestInit, isRetry = false): Promise<T> {
//   const token = localStorage.getItem('token')

//   const res = await fetch(`${API_BASE}${path}`, {
//     headers: {
//       'Content-Type': 'application/json',
//       ...(token && { Authorization: `Bearer ${token}` }),
//     },
//     ...options,
//   })

//   // Access token expired — try to refresh once, then retry the original request
//   if (res.status === 401 && !isRetry) {
//     try {
//       // multiple simultaneous requests share one refresh call, not one each
//       if (!refreshPromise) {
//         refreshPromise = refreshAccessToken().finally(() => {
//           refreshPromise = null
//         })
//       }
//       await refreshPromise
//       return request<T>(path, options, true) // retry, marked so it won't loop forever
//     } catch {
//       window.location.href = '/login'
//       throw new ApiError('Session expired', 401, 'SESSION_EXPIRED')
//     }
//   }

//   if (res.status === 204) return undefined as T

//   const body = await res.json().catch(() => null)

//   if (!res.ok) {
//     const errBody = body as ErrorBody | null
//     throw new ApiError(errBody?.error?.message ?? 'Request failed', res.status, errBody?.error?.code)
//   }

//   return body as T
// }

// export const apiClient = {
//   get: <T>(path: string) => request<T>(path),
//   post: <T>(path: string, data: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(data) }),
//   put: <T>(path: string, data: unknown) => request<T>(path, { method: 'PUT', body: JSON.stringify(data) }),
//   delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
// }





// src/api/todos.ts — add functions alongside fetchTodos

// typescript
// import { apiClient } from './client'

// export interface Todo {
//   id: string
//   title: string
//   isDone: boolean
// }

// export interface CreateTodoInput {
//   title: string
// }

// export interface UpdateTodoInput {
//   title?: string
//   isDone?: boolean
// }

// export const fetchTodos = () => apiClient.get<Todo[]>('/todos')

// export const createTodo = (data: CreateTodoInput) => apiClient.post<Todo>('/todos', data)

// export const updateTodo = (id: string, data: UpdateTodoInput) =>
//   apiClient.put<Todo>(`/todos/${id}`, data)

// export const deleteTodo = (id: string) => apiClient.delete<void>(`/todos/${id}`)



// src/pages/TodosPage.tsx — wire up mutations with React Query

// typescriptreact
// import { useState } from 'react'
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
// import { fetchTodos, createTodo, updateTodo, deleteTodo } from '../api/todos'
// import { useAuth } from '../context/AuthContext'

// export function TodosPage() {
//   const { user, logout } = useAuth()
//   const queryClient = useQueryClient()
//   const [newTitle, setNewTitle] = useState('')

//   const { data: todos, isLoading, isError } = useQuery({
//     queryKey: ['todos'],
//     queryFn: fetchTodos,
//   })

//   const createMutation = useMutation({
//     mutationFn: createTodo,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['todos'] })
//     },
//   })

//   const toggleMutation = useMutation({
//     mutationFn: ({ id, isDone }: { id: string; isDone: boolean }) =>
//       updateTodo(id, { isDone }),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['todos'] })
//     },
//   })

//   const deleteMutation = useMutation({
//     mutationFn: deleteTodo,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['todos'] })
//     },
//   })

//   const handleCreate = (e: React.FormEvent) => {
//     e.preventDefault()
//     if (!newTitle.trim()) return
//     createMutation.mutate({ title: newTitle })
//     setNewTitle('')
//   }

//   if (isLoading) return <p>Loading todos...</p>
//   if (isError) return <p>Something went wrong loading your todos.</p>

//   return (
//     <div>
//       <header>
//         <p>Welcome, {user?.name}</p>
//         <button onClick={logout}>Logout</button>
//       </header>

//       <form onSubmit={handleCreate}>
//         <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="New todo" />
//         <button type="submit" disabled={createMutation.isPending}>Add</button>
//       </form>

//       <ul>
//         {todos?.map((todo) => (
//           <li key={todo.id}>
//             <input
//               type="checkbox"
//               checked={todo.isDone}
//               onChange={() => toggleMutation.mutate({ id: todo.id, isDone: !todo.isDone })}
//             />
//             {todo.title}
//             <button onClick={() => deleteMutation.mutate(todo.id)}>Delete</button>
//           </li>
//         ))}
//       </ul>
//     </div>
//   )
// }