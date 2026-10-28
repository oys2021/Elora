import { useState } from 'react'
import { NavLink, Outlet, Link } from 'react-router-dom'
import { Button, Spin } from 'antd'
import AuthModal from '../../components/layout/AuthModal'
import { useAuth } from '../../context/AuthContext'
import NotificationBell from '../../components/common/NotificationBell'
import {
  DashboardOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  FileTextOutlined,
  DollarOutlined,
  PictureOutlined,
  TeamOutlined,
  CarOutlined,
} from '@ant-design/icons'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: <DashboardOutlined />, end: true },
  { to: '/admin/products', label: 'Products', icon: <ShoppingOutlined />, end: false },
  { to: '/admin/categories', label: 'Categories', icon: <AppstoreOutlined />, end: false },
  { to: '/admin/users', label: 'Users', icon: <TeamOutlined />, end: false },
  { to: '/admin/banners', label: 'Banners', icon: <PictureOutlined />, end: false },
  { to: '/admin/delivery', label: 'Delivery Rates', icon: <CarOutlined />, end: false },
  { to: '/admin/orders', label: 'Orders', icon: <FileTextOutlined />, end: false },
  { to: '/admin/transactions', label: 'Transactions', icon: <DollarOutlined />, end: false },
]

export default function AdminLayout() {
  const { user, isLoading, logout } = useAuth()
  const [authOpen, setAuthOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spin size="large" />
      </div>
    )
  }

  // The API enforces this too. This screen just tells people why they see nothing.
  if (!user || !user.isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
        <div className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-8 text-center">
          <h1 className="font-serif text-xl font-semibold text-neutral-900">Elora Admin</h1>
          {!user ? (
            <>
              <p className="mb-6 mt-2 text-sm text-neutral-500">Sign in with an admin account to continue.</p>
              <Button
                type="primary"
                block
                size="large"
                onClick={() => setAuthOpen(true)}
                className="!border-none !bg-[#b97a8c] hover:!bg-[#a56b7d]"
              >
                Sign in
              </Button>
              <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
            </>
          ) : (
            <>
              <p className="mb-6 mt-2 text-sm text-neutral-500">
                You are signed in as {user.name}, but this account does not have admin access.
              </p>
              <Button
                type="primary"
                block
                size="large"
                onClick={logout}
                className="!border-none !bg-[#b97a8c] hover:!bg-[#a56b7d]"
              >
                Sign out
              </Button>
            </>
          )}
          <Link to="/" className="mt-4 block text-xs text-neutral-500 underline hover:text-neutral-900">
            Back to the store
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <aside className="hidden w-56 shrink-0 border-r border-neutral-200 bg-white sm:block">
        <div className="border-b border-neutral-100 px-5 py-4">
          <Link to="/" className="font-display text-xl font-semibold text-neutral-900">
            Elora <span className="text-xs font-normal text-neutral-400">Admin</span>
          </Link>
        </div>
        <nav className="p-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `mb-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive ? 'bg-[#b97a8c] text-white' : 'text-neutral-600 hover:bg-neutral-100'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="border-b border-neutral-200 bg-white px-4 py-3 sm:hidden">
          <nav className="flex gap-4 overflow-x-auto text-sm font-medium text-neutral-700">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `whitespace-nowrap ${isActive ? 'font-semibold text-[#b97a8c] underline' : ''}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
          <h1 className="text-sm font-semibold text-neutral-900">Admin</h1>
          <div className="flex items-center gap-4">
            <NotificationBell audience="admin" className="text-neutral-600" />
            <Link to="/" className="text-xs text-neutral-500 underline hover:text-neutral-900">
              View Storefront
            </Link>
            <button
              type="button"
              onClick={logout}
              className="rounded-full bg-[#b97a8c] px-3 py-1 text-xs font-medium text-white hover:bg-[#a56b7d]"
            >
              Sign out
            </button>
          </div>
        </header>

        <main className="min-w-0 flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
