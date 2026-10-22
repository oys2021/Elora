import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Badge, Dropdown, Input } from 'antd'
import type { MenuProps } from 'antd'
import {
  HeartOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  DownOutlined,
  MenuOutlined,
  CloseOutlined,
  LogoutOutlined,
  IdcardOutlined,
  ShoppingOutlined,
  DashboardOutlined,
} from '@ant-design/icons'
import AuthModal from './AuthModal'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import logo from '../../assets/brand/logo.png'

const productLinks: MenuProps['items'] = [
  { key: 'wigs', label: 'Wigs' },
  { key: 'skincare', label: 'Skincare' },
  { key: 'body-care', label: 'Body Care' },
  { key: 'fragrances', label: 'Fragrances' },
]

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'New In', to: '/new-in' },
  { label: 'Hot Sellers', to: '/hot-sellers' },
]

const allMobileLinks = [
  ...navLinks,
  { label: 'Products', to: '/products' },
  { label: 'About Us', to: '/about' },
  { label: 'Contact', to: '/contact' },
]

export default function Header() {
  const [query, setQuery] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const { user, logout } = useAuth()

  const navigate = useNavigate()
  const { totalItems, openCart } = useCart()

  // 1. Menu items for Logged In User
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'user-header',
      label: (
        <div className="py-1">
          <p className="font-semibold text-neutral-900">{user?.name || 'Account'}</p>
          <p className="text-[11px] text-neutral-500">{user?.email}</p>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'account',
      label: <Link to="/account">Account Details</Link>,
      icon: <IdcardOutlined />,
    },
    {
      key: 'orders',
      label: <Link to="/orders">My Orders</Link>,
      icon: <ShoppingOutlined />,
    },
    // Only admins get a way into the admin panel.
    ...(user?.isAdmin
      ? [{ key: 'admin', label: <Link to="/admin">Admin Panel</Link>, icon: <DashboardOutlined /> }]
      : []),
    { type: 'divider' },
    {
      key: 'logout',
      label: 'Sign Out',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: () => logout(),
    },
  ]

  // 2. Menu items for Logged Out User
  const guestMenuItems: MenuProps['items'] = [
    {
      key: 'signin',
      label: 'Sign In / Register',
      icon: <UserOutlined className="text-rose-500" />,
      onClick: () => setAuthOpen(true),
    },
  ]

  return (
    <header className="relative w-full bg-white">
      {/* 1. TOP BAR */}
      <div className="border-b border-neutral-200/80">
        <div className="mx-auto flex max-w-[1300px] flex-col gap-2.5 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-3">

          {/* Mobile Navigation Toggle / Brand Logo */}
          <div className="flex items-center justify-between gap-2 sm:w-1/4 sm:justify-start">
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                onClick={() => setMobileMenuOpen((open) => !open)}
                className="flex h-8 w-8 items-center justify-center text-lg text-neutral-800 sm:hidden"
              >
                {mobileMenuOpen ? <CloseOutlined /> : <MenuOutlined />}
              </button>

              <Link to="/" className="flex items-center">
                <img src={logo} alt="Elora" className="h-11 w-auto sm:h-12" />
              </Link>
            </div>

            {/* Mobile Action Buttons */}
            <div className="flex items-center gap-3.5 text-xs text-neutral-800 sm:hidden">
              <Dropdown menu={{ items: user ? userMenuItems : guestMenuItems }} trigger={['click']} placement="bottomRight">
                <button type="button" className="flex items-center p-1 hover:text-black">
                  <UserOutlined className="text-lg" />
                </button>
              </Dropdown>

              <Link to="/favorites" className="flex items-center p-1 hover:text-black">
                <HeartOutlined className="text-lg" />
              </Link>

              <button type="button" onClick={openCart} className="flex items-center p-1 hover:text-black">
                <Badge count={totalItems} size="small" showZero offset={[0, 0]}>
                  <ShoppingCartOutlined className="text-lg" />
                </Badge>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex w-full justify-center sm:w-2/4">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              prefix={<SearchOutlined className="mr-1.5 text-neutral-400" />}
              placeholder="Search products..."
              className="w-full max-w-xl !rounded-full !border-pink-400 bg-white px-4 py-1.5 text-xs shadow-none transition-all hover:!border-pink-500 focus:!border-pink-500 focus:!shadow-[0_0_0_2px_rgba(244,114,182,0.2)] focus-within:!border-pink-500 focus-within:!shadow-[0_0_0_2px_rgba(244,114,182,0.2)] [&.ant-input-affix-wrapper]:!rounded-full"
              size="middle"
            />
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden items-center justify-end gap-5 text-xs text-neutral-800 sm:flex sm:w-1/4">
            
            {/* Direct click opens Sign-In modal when logged out; opens menu when logged in */}
            {user ? (
              <Dropdown menu={{ items: userMenuItems }} trigger={['click', 'hover']} placement="bottomRight">
                <button
                  type="button"
                  className="flex items-center gap-1.5 transition-colors hover:text-black"
                >
                  <UserOutlined className="text-base" />
                  <span>Account Details</span>
                  <DownOutlined className="text-[9px]" />
                </button>
              </Dropdown>
            ) : (
              <button
                type="button"
                onClick={() => setAuthOpen(true)}
                className="flex items-center gap-1.5 transition-colors hover:text-black"
              >
                <UserOutlined className="text-base" />
                <span>Sign In</span>
              </button>
            )}

            <Link to="/favorites" className="flex items-center gap-1.5 transition-colors hover:text-black">
              <HeartOutlined className="text-base" />
              <span>Favorites</span>
            </Link>

            <button type="button" onClick={openCart} className="flex items-center gap-1.5 transition-colors hover:text-black">
              <Badge count={totalItems} size="small" showZero offset={[2, -2]}>
                <ShoppingCartOutlined className="text-base" />
              </Badge>
            </button>
          </div>

        </div>
      </div>

      {/* 2. SUB NAVIGATION BAR */}
      <nav className="hidden w-full items-center justify-center py-3.5 sm:flex">
        <ul className="flex items-center justify-center gap-8 text-xs font-medium text-neutral-700">
          {navLinks.map((link) => (
            <li key={link.label}>
              <Link to={link.to} className="transition-colors hover:text-black">
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Dropdown
              menu={{ items: productLinks, onClick: (info) => navigate(`/products/${info.key}`) }}
              trigger={['hover']}
            >
              <Link to="/products" className="flex items-center gap-1 transition-colors hover:text-black">
                Products <DownOutlined className="text-[9px]" />
              </Link>
            </Dropdown>
          </li>
          <li>
            <Link to="/about" className="transition-colors hover:text-black">
              About Us
            </Link>
          </li>
          <li>
            <Link to="/contact" className="transition-colors hover:text-black">
              Contact
            </Link>
          </li>
        </ul>
      </nav>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <nav className="relative left-0 right-0 z-50 border-b border-neutral-200 bg-white shadow-xl sm:hidden">
          <ul className="flex flex-col divide-y divide-neutral-100 px-5 text-sm font-medium text-neutral-800">
            {allMobileLinks.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.to}
                  className="block py-3.5 transition-colors hover:text-rose-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </header>
  )
}