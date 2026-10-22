import { Spin } from 'antd'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import FloatingActions from '../components/common/FloatingActions'
import ProductSection from '../components/home/ProductSection'
import { useAuth } from '../context/AuthContext'
import { useFavorites } from '../queries/favorites'
import type { Product } from '../schemas/product'

export default function Favorites() {
  const { user, isLoading: authLoading } = useAuth()
  const { data: favorites = [], isLoading } = useFavorites({ enabled: !!user })

  const products = favorites
    .map((f) => f.Product)
    .filter((p): p is Product => !!p)

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex-1">
        {(authLoading || (isLoading && user)) && (
          <div className="flex justify-center py-24">
            <Spin size="large" />
          </div>
        )}

        {!authLoading && !user && (
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6">
            <h1 className="text-xl font-semibold text-neutral-900">Sign in to see your favorites</h1>
            <p className="mt-2 text-sm text-neutral-500">
              Tap the heart icon on any product while signed in to save it here.
            </p>
          </div>
        )}

        {user && !isLoading && products.length > 0 && (
          <ProductSection title="Your Favorites" products={products} />
        )}

        {user && !isLoading && products.length === 0 && (
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6">
            <h1 className="text-xl font-semibold text-neutral-900">No favorites yet</h1>
            <p className="mt-2 text-sm text-neutral-500">
              Tap the heart icon on any product to save it here.
            </p>
          </div>
        )}
      </main>

      <Footer />
      <FloatingActions />
    </div>
  )
}
