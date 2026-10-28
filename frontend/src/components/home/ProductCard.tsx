import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LoadingOutlined, ShoppingCartOutlined } from '@ant-design/icons'
import { useQueryClient } from '@tanstack/react-query'
import type { Product } from '../../schemas/product'
import { useReviews } from '../../queries/reviews'
import { productVariantsQuery } from '../../queries/productVariants'
import { useCart } from '../../context/CartContext'
import FavoriteButton from '../common/FavoriteButton'
import StarRating from '../common/StarRating'
import QuickAddModal from './QuickAddModal'

export default function ProductCard({ product }: { product: Product }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { addItem } = useCart()
  const { data: reviewData } = useReviews(product.id)
  const [adding, setAdding] = useState(false)
  const [quickAddOpen, setQuickAddOpen] = useState(false)

  // Products with no variants, no stock left in any of them, or flagged out
  // of stock by an admin can't be bought.
  const outOfStock = product.isOutOfStock || product.variantCount === 0 || product.totalStock === 0
  const price = product.minPrice ?? product.basePrice
  const productPath = `/product/${product.slug}`

  // A single-variant product has nothing to choose, so it goes straight into
  // the cart. Anything with options (length, density, colour) opens the
  // quick-add popup right here; clicking the card still opens the full page.
  const handleAddToCart = async () => {
    if (product.variantCount > 1) {
      setQuickAddOpen(true)
      return
    }
    setAdding(true)
    try {
      const { data: variants } = await queryClient.fetchQuery(productVariantsQuery(product.id))
      const variant = variants.find((v) => v.stockQuantity > 0)
      if (!variant) {
        navigate(productPath)
        return
      }
      const variantLabel = [variant.lengthOption, variant.densityOption, variant.colorOption]
        .filter(Boolean)
        .join(' / ')
      addItem({
        id: variant.id,
        name: product.name,
        variant: variantLabel || undefined,
        price: variant.price,
        image: product.imageUrls[0] ?? '',
      })
    } catch {
      // Couldn't load the variant: let the product page handle it.
      navigate(productPath)
    } finally {
      setAdding(false)
    }
  }

  return (
    // The popup sits outside the <Link>: clicks inside it must not open the product page.
    <>
      <Link
        to={productPath}
        className="group flex flex-col rounded-2xl border border-neutral-200/70 bg-white p-2.5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.06)] transition duration-300 animate-fade-up hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-14px_rgba(0,0,0,0.18)] sm:p-3"
      >
        {/* Image sits inset in the card on a soft tile */}
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-neutral-100">
          {product.imageUrls[0] && (
            <img
              src={product.imageUrls[0]}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
            />
          )}
  
          {outOfStock && (
            <span className="absolute left-2.5 top-2.5 rounded-full bg-neutral-900/80 px-2 py-0.5 text-[10px] font-medium text-white sm:left-3 sm:top-3">
              Out of stock
            </span>
          )}
  
          <FavoriteButton
            productId={product.id}
            className="absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur text-xs text-neutral-600 shadow-sm transition hover:text-rose-600 sm:right-3 sm:top-3"
          />
        </div>
  
        {/* Card Details */}
        <div className="flex flex-1 flex-col px-1 pb-0.5 pt-3">
          {product.Category?.name && (
            <p className="line-clamp-1 text-[11px] text-neutral-400">{product.Category.name}</p>
          )}
          <p className="mt-0.5 line-clamp-1 text-sm font-semibold text-neutral-900" title={product.name}>
            {product.name}
          </p>
  
          <div className="mt-1.5 flex items-center gap-1.5">
            <StarRating value={reviewData?.averageRating ?? 0} />
            {/* Show the average next to the stars so the count isn't mistaken for the rating. */}
            <span className="line-clamp-1 text-[11px] text-neutral-400">
              {reviewData && reviewData.reviewCount > 0
                ? `${reviewData.averageRating.toFixed(1)} · ${reviewData.reviewCount} review${reviewData.reviewCount === 1 ? '' : 's'}`
                : 'No reviews yet'}
            </span>
          </div>
  
          <div className="mt-auto flex items-end justify-between gap-2 pt-2">
            <p className="text-base font-semibold text-rose-700 sm:text-[17px]">
              GHS {price.toFixed(2)}
            </p>
  
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                void handleAddToCart()
              }}
              disabled={outOfStock || adding}
              aria-busy={adding}
              aria-label={outOfStock ? 'Out of stock' : product.variantCount > 1 ? 'Choose options' : 'Add to cart'}
              title={outOfStock ? 'Out of stock' : product.variantCount > 1 ? 'Choose options' : 'Add to cart'}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-50 text-base text-rose-600 transition hover:bg-rose-600 hover:text-white disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-300"
            >
              {adding ? <LoadingOutlined /> : <ShoppingCartOutlined />}
            </button>
          </div>
        </div>
      </Link>
      {product.variantCount > 1 && (
        <QuickAddModal product={product} open={quickAddOpen} onClose={() => setQuickAddOpen(false)} />
      )}
    </>
  )
}