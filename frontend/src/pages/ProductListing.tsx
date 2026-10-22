import { useParams } from 'react-router-dom'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import FloatingActions from '../components/common/FloatingActions'
import ProductSection from '../components/home/ProductSection'
import { useProducts } from '../queries/products'
import { useCategories } from '../queries/categories'

const productTypeLabels: Record<string, string> = {
  wigs: 'Wigs',
  skincare: 'Skincare',
  'body-care': 'Body Care',
  fragrances: 'Fragrances',
}

interface ProductListingProps {
  title?: string
  filter?: 'bestsellers' | 'featured'
}

export default function ProductListing({ title, filter }: ProductListingProps) {
  const { productType, categorySlug } = useParams<{ productType?: string; categorySlug?: string }>()
  const { data: products = [], isLoading } = useProducts()
  const { data: categories = [] } = useCategories()

  const category = categorySlug ? categories.find((c) => c.slug === categorySlug) : undefined
  let visibleProducts = category ? products.filter((p) => p.categoryId === category.id) : products
  if (filter === 'bestsellers') visibleProducts = visibleProducts.filter((p) => p.isBestseller)
  if (filter === 'featured') visibleProducts = visibleProducts.filter((p) => p.isFeatured)
  const heading = title ?? (productType && productTypeLabels[productType]) ?? category?.name ?? 'Products'

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      {/* Container wrapper matching Header boundaries */}
      <main className="mx-auto w-full max-w-[1300px] flex-1 px-4 py-6 sm:px-6">
        {!isLoading && visibleProducts.length === 0 ? (
          <p className="py-16 text-center text-sm text-neutral-500">No products found.</p>
        ) : (
          <ProductSection title={heading} products={visibleProducts} showViewMore />
        )}
      </main>

      <Footer />
      <FloatingActions />
    </div>
  )
}
