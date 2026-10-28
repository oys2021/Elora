import { Spin } from 'antd'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import HeroCarousel from '../components/home/HeroCarousel'
import CategoryList from '../components/home/CategoryList'
import ProductSection from '../components/home/ProductSection'
import FloatingActions from '../components/common/FloatingActions'
import { useProducts } from '../queries/products'

export default function Home() {
  const { data: products = [], isLoading } = useProducts()
  const featured = products.filter((p) => p.isFeatured)
  const bestsellers = products.filter((p) => p.isBestseller)

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      {/* Full-width header */}
      <Header />

      {/* Main page content container */}
      <main className="mx-auto w-full max-w-[1300px] flex-1 px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          // One clean loading state instead of the hero/categories popping in
          // while the product sections below them are still hidden.
          <div className="flex min-h-[60vh] items-center justify-center">
            <Spin size="large" />
          </div>
        ) : (
          <>
            <HeroCarousel />
            <CategoryList />
            {featured.length > 0 && <ProductSection title="For You" products={featured} />}
            {bestsellers.length > 0 && (
              <ProductSection title="Bestsellers" products={bestsellers} showViewMore />
            )}
            {products.length > 0 && <ProductSection title="New Arrivals" products={products} />}
          </>
        )}
      </main>

      {/* Full-width footer */}
      <Footer />

      <FloatingActions />
    </div>
  )
}