import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Modal, Spin } from 'antd'
import { ShoppingCartOutlined } from '@ant-design/icons'
import type { Product } from '../../schemas/product'
import type { ProductVariant } from '../../schemas/productVariant'
import { useProductVariants } from '../../queries/productVariants'
import { useCart } from '../../context/CartContext'
import { useVariantSelection } from '../../hooks/useVariantSelection'
import VariantPicker, { QuantityStepper } from '../common/VariantPicker'

// Pick length / density / colour and add to cart straight from a product
// card, without leaving the page. Clicking the product itself still opens the
// full details page.
export default function QuickAddModal({ product, open, onClose }: { product: Product; open: boolean; onClose: () => void }) {
  // Only fetched once the popup opens, so a page of cards costs nothing extra.
  const { data: variants, isLoading } = useProductVariants(open ? product.id : undefined)

  return (
    <Modal open={open} onCancel={onClose} footer={null} width={460} centered destroyOnHidden title={null}>
      {isLoading || !variants ? (
        <div className="flex justify-center py-12">
          <Spin />
        </div>
      ) : (
        <QuickAddContent product={product} variants={variants} onDone={onClose} />
      )}
    </Modal>
  )
}

function QuickAddContent({ product, variants, onDone }: { product: Product; variants: ProductVariant[]; onDone: () => void }) {
  const { addItem } = useCart()
  const { dimensions, matchedVariant, selectOption, price, inStock, lowStock, variantLabel } = useVariantSelection(product, variants)
  const [quantity, setQuantity] = useState(1)

  const handleAdd = () => {
    if (!matchedVariant || !inStock) return
    addItem(
      { id: matchedVariant.id, name: product.name, variant: variantLabel || undefined, price, image: product.imageUrls[0] ?? '' },
      quantity
    )
    onDone() // the cart drawer opens by itself
  }

  return (
    <div className="pt-1">
      <div className="flex gap-4 pr-6">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
          {product.imageUrls[0] && <img src={product.imageUrls[0]} alt="" className="h-full w-full object-cover" />}
        </div>
        <div className="min-w-0">
          {product.Category?.name && <p className="text-[11px] text-neutral-400">{product.Category.name}</p>}
          <p className="text-sm font-semibold leading-snug text-neutral-900">{product.name}</p>
          <p className="mt-1 text-lg font-semibold text-rose-700">GHS {price.toFixed(2)}</p>
          <p className={`text-[11px] font-medium ${inStock ? 'text-neutral-500' : 'text-red-600'}`}>
            {!inStock ? 'Out of stock' : lowStock ? `Only ${matchedVariant?.stockQuantity} left` : 'In stock'}
          </p>
        </div>
      </div>

      {/* A scroll area clips whatever pokes past its edges, so pad it (and pull
          it back out with a negative margin) to leave room for the selected
          swatch's outline ring. */}
      <div className="-mx-2 max-h-[50vh] overflow-y-auto px-2 pb-2">
        <VariantPicker dimensions={dimensions} selected={matchedVariant} onSelect={selectOption} compact />

        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold text-neutral-900">Quantity</p>
          <QuantityStepper value={quantity} onChange={setQuantity} />
        </div>
      </div>

      <button
        type="button"
        onClick={handleAdd}
        disabled={!inStock}
        className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-rose-500 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ShoppingCartOutlined />
        {inStock ? `Add to Cart · GHS ${(price * quantity).toFixed(2)}` : 'Out of Stock'}
      </button>
      <Link
        to={`/product/${product.slug}`}
        onClick={onDone}
        className="mt-3 block text-center text-xs font-medium !text-neutral-500 underline-offset-4 hover:!text-neutral-900 hover:underline"
      >
        View full details
      </Link>
    </div>
  )
}
