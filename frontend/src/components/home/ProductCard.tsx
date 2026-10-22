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
      className="group flex flex-col animate-fade-up"
    >
      {/* Full-width Image Container */}
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-cream">
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
      <div className="flex flex-1 flex-col justify-between px-1 pt-3 sm:pt-4">
        <div>
          <p className="line-clamp-2 text-sm font-medium leading-snug text-neutral-800">{product.name}</p>
          <p className="mt-1.5 font-display text-base text-neutral-900 sm:text-lg">
            {product.variantCount > 1 && <span className="font-normal text-neutral-500">From </span>}
            GHS {price.toFixed(2)}
          </p>
        </div>

        {/* Responsive Footer Row */}
        <div className="mt-2.5 flex flex-col gap-2 sm:mt-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-1 text-[10px] text-neutral-400 sm:text-[11px]">
            <StarFilled className="text-yellow-400" />
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
            className="w-full rounded-full border border-neutral-900 py-2 text-center text-xs font-semibold text-neutral-900 transition hover:bg-neutral-900 hover:text-white disabled:cursor-not-allowed disabled:border-neutral-300 disabled:text-neutral-400 sm:w-auto sm:px-4"
          >
            {outOfStock ? 'Out of Stock' : 'Select Options'}
          </button>
        </div>
      </div>
    </Link>
  )
}
