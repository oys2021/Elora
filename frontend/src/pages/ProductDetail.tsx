import { useParams, Link, Navigate } from 'react-router-dom'
import { LeftOutlined } from '@ant-design/icons'
import { Spin } from 'antd'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import FloatingActions from '../components/common/FloatingActions'
import ImageGallery from '../components/product-detail/ImageGallery'
import PurchasePanel from '../components/product-detail/PurchasePanel'
import ReviewsSection from '../components/product-detail/ReviewsSection'
import CommentsSection from '../components/product-detail/CommentsSection'
import ProductSection from '../components/home/ProductSection'
import { useProduct, useProducts } from '../queries/products'
import { useProductVariants } from '../queries/productVariants'

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { data: product, isLoading, isError } = useProduct(slug)
  const { data: variants = [], isLoading: variantsLoading } = useProductVariants(product?.id)
  const { data: allProducts = [] } = useProducts()

  if (!slug || isError) {
    return <Navigate to="/" replace />
  }

  if (isLoading || variantsLoading || !product) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spin size="large" />
      </div>
    )
  }

  const relatedProducts = allProducts.filter((p) => p.id !== product.id)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6">
          <Link to="/" className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900">
            <LeftOutlined className="text-[10px]" /> Back to collection
          </Link>
        </div>

        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-6 sm:px-6 lg:grid-cols-2">
          <ImageGallery images={product.imageUrls} />
          <PurchasePanel product={product} variants={variants} />
        </div>

        <ReviewsSection productId={product.id} />
        <CommentsSection productId={product.id} />

        {relatedProducts.length > 0 && (
          <ProductSection title="Customers Also Viewed" products={relatedProducts} showViewMore />
        )}
      </main>

      <Footer />
      <FloatingActions />
    </div>
  )
}
