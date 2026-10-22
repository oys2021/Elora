import { Link, useNavigate } from 'react-router-dom'
import { StarFilled } from '@ant-design/icons'
import type { Product } from '../../schemas/product'
import { useReviews } from '../../queries/reviews'
import FavoriteButton from '../common/FavoriteButton'

export default function ProductCard({ product }: { product: Product }) {
  const navigate = useNavigate()
  const { data: reviewData } = useReviews(product.id)

  // Products with no variants, or no stock left in any of them, can't be bought.
  const outOfStock = product.variantCount === 0 || product.totalStock === 0
  const price = product.minPrice ?? product.basePrice

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition hover:border-neutral-300 hover:shadow-md"
    >
      {/* Full-width Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-neutral-100">
        {product.imageUrls[0] && (
          <img
            src={product.imageUrls[0]}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}

        {outOfStock && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-neutral-900/80 px-2 py-0.5 text-[10px] font-medium text-white sm:left-3 sm:top-3">
            Out of stock
          </span>
        )}

        <FavoriteButton
          productId={product.id}
          className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-xs text-neutral-600 shadow-sm transition hover:text-red-500 sm:right-3 sm:top-3"
        />
      </div>

      {/* Card Details */}
      <div className="flex flex-1 flex-col justify-between p-2.5 sm:p-3.5">
        <div>
          <p className="line-clamp-1 text-xs text-neutral-500">{product.name}</p>
          <p className="mt-1 text-xs font-bold text-neutral-900 sm:text-sm">
            {product.variantCount > 1 && <span className="font-normal text-neutral-500">From </span>}
            GHS {price.toFixed(2)}
          </p>
        </div>

        {/* Responsive Footer Row */}
        <div className="mt-2.5 flex flex-col gap-2 sm:mt-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-1 text-[10px] text-neutral-400 sm:text-[11px]">
            <StarFilled className="text-amber-400" />
            <span className="font-medium text-neutral-600">{(reviewData?.averageRating ?? 0).toFixed(1)}</span>
            <span>({reviewData?.reviewCount ?? 0})</span>
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              // Length / density / colour are chosen on the product page.
              navigate(`/product/${product.slug}`)
            }}
            disabled={outOfStock}
            className="w-full rounded-full bg-black py-1.5 text-center text-[10px] font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300 sm:w-auto sm:px-3"
          >
            {outOfStock ? 'Out of Stock' : 'Select Options'}
          </button>
        </div>
      </div>
    </Link>
  )
}
