import { useState } from 'react'
import { DownOutlined } from '@ant-design/icons'
import ProductCard from './ProductCard'
import type { Product } from '../../schemas/product'

interface ProductSectionProps {
  title: string
  products: Product[]
  showViewMore?: boolean
}

export default function ProductSection({ title, products, showViewMore }: ProductSectionProps) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? products : products.slice(0, 8)

  return (
    <section className="w-full py-6 sm:py-10">
      <div className="mx-auto max-w-[1300px] px-4 sm:px-6">
        <h2 className="mb-4 text-base font-semibold text-neutral-900 sm:mb-6 sm:text-lg">
          {title}
        </h2>

        {/* 2-column mobile, 4-column desktop grid with responsive gaps */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-x-6 sm:gap-y-8">
          {visible.map((product, i) => (
            <ProductCard key={`${product.id}-${i}`} product={product} />
          ))}
        </div>

        {showViewMore && !expanded && products.length > 8 && (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="flex items-center gap-2 rounded-full border border-neutral-300 px-5 py-2 text-xs text-neutral-700 hover:border-black hover:text-black sm:text-sm"
            >
              View more <DownOutlined className="text-xs" />
            </button>
          </div>
        )}
      </div>
    </section>
  )
}