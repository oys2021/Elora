import { Link } from 'react-router-dom'
import { HomeOutlined, ShoppingOutlined } from '@ant-design/icons'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import FloatingActions from '../components/common/FloatingActions'

// Catches any path that doesn't match a route (see App.tsx's `path="*"`), and
// also any known route that resolves to nothing (e.g. a deleted product).
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center px-4 py-24 text-center sm:px-6">
        <p className="font-display text-7xl font-semibold text-neutral-200 sm:text-8xl">404</p>
        <h1 className="mt-4 text-xl font-semibold text-neutral-900">Page not found</h1>
        <p className="mt-2 max-w-sm text-sm text-neutral-500">
          The page you're looking for doesn't exist, or may have been moved.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-6 py-2.5 text-sm font-medium text-white hover:bg-neutral-800"
          >
            <HomeOutlined />
            Back to Home
          </Link>
          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-300 bg-white px-6 py-2.5 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
          >
            <ShoppingOutlined />
            Browse Products
          </Link>
        </div>
      </main>

      <Footer />
      <FloatingActions />
    </div>
  )
}
