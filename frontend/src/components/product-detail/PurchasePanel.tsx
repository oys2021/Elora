import { useMemo, useState } from 'react'
import { ExportOutlined, MinusOutlined, PlusOutlined, ShoppingCartOutlined } from '@ant-design/icons'
import type { Product } from '../../schemas/product'
import type { ProductVariant } from '../../schemas/productVariant'
import { useCart } from '../../context/CartContext'
import { useReviews } from '../../queries/reviews'
import StarRating from '../common/StarRating'
import FavoriteButton from '../common/FavoriteButton'
import { colorHex } from '../../utils/hairColors'

const payments = ['MTN', 'Telecel', 'AirtelTigo']

type VariantDimensionKey = 'lengthOption' | 'densityOption' | 'colorOption'

const dimensionLabels: Record<VariantDimensionKey, string> = {
  lengthOption: 'Length',
  densityOption: 'Density',
  colorOption: 'Colour',
}

interface PurchasePanelProps {
  product: Product
  variants: ProductVariant[]
}

export default function PurchasePanel({ product, variants }: PurchasePanelProps) {
  const { addItem } = useCart()
  const { data: reviewData } = useReviews(product.id)

  const dimensions = useMemo(() => {
    const keys: VariantDimensionKey[] = ['lengthOption', 'densityOption', 'colorOption']
    return keys
      .map((key) => ({
        key,
        label: dimensionLabels[key],
        options: Array.from(new Set(variants.map((v) => v[key]).filter((v): v is string => !!v))),
      }))
      .filter((dim) => dim.options.length > 0)
  }, [variants])

  // The selection is always a real variant, so the price and stock shown are
  // always those of something the customer can actually buy. Start on the
  // first variant that is in stock.
  const [variantId, setVariantId] = useState<string | undefined>(
    () => (variants.find((v) => v.stockQuantity > 0) ?? variants[0])?.id,
  )
  const [quantity, setQuantity] = useState(1)

  const matchedVariant: ProductVariant | undefined =
    variants.find((v) => v.id === variantId) ?? variants[0]

  // Picking an option moves to the closest variant that has it: keep the other
  // current choices if that combination exists, otherwise prefer one in stock.
  const selectOption = (key: VariantDimensionKey, option: string) => {
    const withOption = variants.filter((v) => v[key] === option)
    const best =
      withOption.find((v) => dimensions.every((d) => d.key === key || v[d.key] === matchedVariant?.[d.key])) ??
      withOption.find((v) => v.stockQuantity > 0) ??
      withOption[0]
    if (best) setVariantId(best.id)
  }

  const price = matchedVariant ? matchedVariant.price : product.basePrice
  // A product with no variants can't be bought, so it is out of stock.
  const inStock = matchedVariant ? matchedVariant.stockQuantity > 0 : false
  const variantLabel = matchedVariant
    ? [matchedVariant.lengthOption, matchedVariant.densityOption, matchedVariant.colorOption]
        .filter(Boolean)
        .join(' / ')
    : undefined

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

  const lowStock = matchedVariant && inStock && matchedVariant.stockQuantity <= 10

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
        <h1 className="text-[15px] font-medium leading-snug text-neutral-900 sm:text-base">{product.name}</h1>
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
            ? `Low stock: ${matchedVariant.stockQuantity} left`
            : 'In stock'}
      </p>

      {dimensions.map((dim) => (
        <div key={dim.key} className="mt-6">
          <p className="mb-2.5 text-sm font-semibold text-neutral-900">
            {dim.label}
            {dim.key === 'colorOption' && matchedVariant?.colorOption && (
              <span className="font-normal"> : {matchedVariant.colorOption}</span>
            )}
          </p>

          {dim.key === 'colorOption' ? (
            <div className="flex flex-wrap gap-3">
              {dim.options.map((opt) => {
                const selectedColour = matchedVariant?.colorOption === opt
                return (
                  <button
                    key={opt}
                    type="button"
                    title={opt}
                    aria-label={opt}
                    aria-pressed={selectedColour}
                    onClick={() => selectOption('colorOption', opt)}
                    className={`h-16 w-16 rounded transition ${
                      selectedColour
                        ? 'ring-2 ring-neutral-900 ring-offset-2'
                        : 'ring-1 ring-black/10 hover:ring-neutral-400'
                    }`}
                    style={{ backgroundColor: colorHex(opt) ?? '#d4d4d4' }}
                  />
                )
              })}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {dim.options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => selectOption(dim.key, opt)}
                  className={`rounded-xl border px-3.5 py-1.5 text-[11px] font-semibold shadow-sm transition ${
                    matchedVariant?.[dim.key] === opt
                      ? 'border-neutral-500 bg-neutral-500 text-white'
                      : 'border-neutral-200 bg-white text-neutral-900 hover:border-neutral-400'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}

      <div className="mt-6">
        <p className="mb-2.5 text-sm font-semibold text-neutral-900">Quantity</p>
        <div className="inline-flex items-center rounded-xl border border-neutral-300">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex h-9 w-9 items-center justify-center text-neutral-600 hover:text-black"
          >
            <MinusOutlined className="text-xs" />
          </button>
          <span className="w-10 text-center text-sm">{quantity}</span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQuantity((q) => q + 1)}
            className="flex h-9 w-9 items-center justify-center text-neutral-600 hover:text-black"
          >
            <PlusOutlined className="text-xs" />
          </button>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!inStock}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#b97a8c] text-sm font-semibold text-white transition hover:bg-[#a56b7d] disabled:cursor-not-allowed disabled:opacity-50"
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
