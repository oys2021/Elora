import { useState } from 'react'
import { ExportOutlined, ShoppingCartOutlined } from '@ant-design/icons'
import type { Product } from '../../schemas/product'
import type { ProductVariant } from '../../schemas/productVariant'
import { useCart } from '../../context/CartContext'
import { useReviews } from '../../queries/reviews'
import { useVariantSelection } from '../../hooks/useVariantSelection'
import StarRating from '../common/StarRating'
import FavoriteButton from '../common/FavoriteButton'
import VariantPicker, { QuantityStepper } from '../common/VariantPicker'

const payments = ['MTN', 'Telecel', 'AirtelTigo']

interface PurchasePanelProps {
  product: Product
  variants: ProductVariant[]
}

export default function PurchasePanel({ product, variants }: PurchasePanelProps) {
  const { addItem } = useCart()
  const { data: reviewData } = useReviews(product.id)
  // Same option-picking as the quick-add popup on product cards.
  const { dimensions, matchedVariant, selectOption, price, inStock, lowStock, variantLabel } = useVariantSelection(product, variants)
  const [quantity, setQuantity] = useState(1)

  const handleAddToCart = () => {
    if (!matchedVariant) return
    addItem(
      {
        id: matchedVariant.id,
        name: product.name,
        variant: variantLabel || undefined,
        price,
        image: product.imageUrls[0] ?? '',
      },
      quantity,
    )
  }

  return (
    <div>
      {product.isBestseller && (
        <div className="mb-2 flex justify-end">
          <span className="rounded-sm bg-amber-400 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
            Bestseller
          </span>
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <h1 className="text-3xl leading-tight text-neutral-900 sm:text-4xl">{product.name}</h1>
        <button
          type="button"
          aria-label="Open in new tab"
          className="shrink-0 text-neutral-400 hover:text-neutral-700"
        >
          <ExportOutlined />
        </button>
      </div>

      {reviewData && reviewData.reviewCount > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-neutral-600">
          <StarRating value={reviewData.averageRating} />
          <span className="font-medium text-neutral-900">{reviewData.averageRating.toFixed(1)}</span>
          <span className="text-neutral-500">out of 5</span>
          <a href="#reviews" className="text-neutral-700 underline hover:text-neutral-900">
            {reviewData.reviewCount} Review{reviewData.reviewCount === 1 ? '' : 's'}
          </a>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="text-3xl font-bold tracking-tight text-neutral-900">GHS {price.toFixed(2)}</span>
      </div>

      <p className={`mt-3 text-xs ${inStock ? 'font-medium text-neutral-800' : 'font-medium text-red-600'}`}>
        {!inStock
          ? 'Out of stock'
          : lowStock
            ? `Low stock: ${matchedVariant?.stockQuantity} left`
            : 'In stock'}
      </p>

      <VariantPicker dimensions={dimensions} selected={matchedVariant} onSelect={selectOption} />

      <div className="mt-6">
        <p className="mb-2.5 text-sm font-semibold text-neutral-900">Quantity</p>
        <QuantityStepper value={quantity} onChange={setQuantity} />
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!inStock}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-rose-500 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ShoppingCartOutlined />
          {inStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
        <FavoriteButton
          productId={product.id}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-lg text-neutral-800 transition hover:bg-neutral-200 hover:text-red-500"
        />
      </div>

      <div className="mt-6">
        <p className="mb-2 text-sm font-semibold text-neutral-900">We Accept</p>
        <div className="flex flex-wrap gap-2">
          {payments.map((provider) => (
            <span
              key={provider}
              className="rounded bg-neutral-100 px-2 py-1 text-[10px] font-semibold text-neutral-700"
            >
              {provider}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
