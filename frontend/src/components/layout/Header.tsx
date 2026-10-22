import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Dropdown } from 'antd'
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
  { label: 'HOME', to: '/' },
  { label: 'NEW IN', to: '/new-in' },
  { label: 'HOT SELLERS', to: '/hot-sellers' },
]

export default function Header() {
  const [query, setQuery] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { totalItems, openCart } = useCart()

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
    { key: 'account', label: <Link to="/account">Account Details</Link>, icon: <IdcardOutlined /> },
    { key: 'orders', label: <Link to="/orders">My Orders</Link>, icon: <ShoppingOutlined /> },
    ...(user?.isAdmin
      ? [{ key: 'admin', label: <Link to="/admin">Admin Panel</Link>, icon: <DashboardOutlined /> }]
      : []),
    { type: 'divider' },
    { key: 'logout', label: 'Sign Out', icon: <LogoutOutlined />, danger: true, onClick: () => logout() },
  ]

  return (
    <header className="w-full bg-[#FAF8F5] border-b border-neutral-200/50 font-sans">
      {/* TOP SECTION: Logo, Search Bar, Account / Favorites / Cart */}
      <div className="mx-auto max-w-[1300px] px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          
          {/* Mobile Menu Button + Logo */}
          <div className="flex items-center gap-3 sm:w-1/4 justify-start">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="flex h-8 w-8 items-center justify-center text-lg text-neutral-800 sm:hidden"
            >
              {mobileMenuOpen ? <CloseOutlined /> : <MenuOutlined />}
            </button>
            <Link to="/" className="flex items-center">
              <img src={logo} alt="Elora" className="h-10 w-auto sm:h-11" />
            </Link>
          </div>

          {/* Centered Search Bar */}
          <div className="hidden flex-1 max-w-lg mx-auto sm:block">
            <div className="relative flex items-center">
              <SearchOutlined className="absolute left-4 text-neutral-400 text-xs" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full rounded-full bg-[#F3EFEA] py-2 pl-9 pr-4 text-xs text-neutral-800 placeholder-neutral-400 outline-none border border-neutral-200/60 focus:border-neutral-300 transition"
              />
            </div>
          </div>

          {/* Action Links */}
          <div className="flex items-center justify-end gap-5 text-xs text-[#554743] sm:w-1/4">
            {user ? (
              <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
                <button type="button" className="flex items-center gap-1.5 hover:text-black transition">
                  <UserOutlined className="text-sm" />
                  <span className="hidden md:inline text-[11px] font-medium">Sign In</span>
                </button>
              </Dropdown>
            ) : (
              <button
                type="button"
                onClick={() => setAuthOpen(true)}
                className="flex items-center gap-1.5 hover:text-black transition"
              >
                <UserOutlined className="text-sm" />
                <span className="hidden md:inline text-[11px] font-medium">Sign In</span>
              </button>
            )}

            <Link to="/favorites" className="flex items-center gap-1.5 hover:text-black transition">
              <HeartOutlined className="text-sm" />
              <span className="hidden md:inline text-[11px] font-medium">Favorites</span>
            </Link>

            <button type="button" onClick={openCart} className="relative flex items-center hover:text-black transition">
              <ShoppingCartOutlined className="text-base" />
              {totalItems > 0 && (
                <span className="absolute -right-2 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#E5484D] text-[9px] font-bold text-white">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* LOWER NAVIGATION BAR */}
      <nav className="border-t border-neutral-200/40 py-2.5 hidden sm:flex justify-center">
        <ul className="flex items-center gap-8 text-[11px] font-semibold tracking-wider text-[#6E5D57]">
          {navLinks.map((link) => (
            <li key={link.label}>
              <Link to={link.to} className="hover:text-black transition-colors">
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Dropdown
              menu={{ items: productLinks, onClick: (info) => navigate(`/products/${info.key}`) }}
              trigger={['hover']}
            >
              <Link to="/products" className="flex items-center gap-1 hover:text-black transition-colors">
                PRODUCTS <DownOutlined className="text-[8px]" />
              </Link>
            </Dropdown>
          </li>
          <li>
            <Link to="/about" className="hover:text-black transition-colors">
              ABOUT US
            </Link>
          </li>
          <li>
            <Link to="/contact" className="hover:text-black transition-colors">
              CONTACT
            </Link>
          </li>
        </ul>
      </nav>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <nav className="border-t border-neutral-200 bg-white py-3 sm:hidden">
          <ul className="flex flex-col space-y-2 px-6 text-xs font-semibold text-neutral-800">
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link to={link.to} onClick={() => setMobileMenuOpen(false)} className="block py-1">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="block py-1">
                PRODUCTS
              </Link>
            </li>
            <li>
              <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="block py-1">
                ABOUT US
              </Link>
            </li>
            <li>
              <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="block py-1">
                CONTACT
              </Link>
            </li>
          </ul>
        </nav>
      )}

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </header>
  )
}