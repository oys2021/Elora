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
      <div className="mx-auto max-w-[1300px]">
        <div className="mb-6 flex items-end justify-between sm:mb-8">
          <div>
            <p className="eyebrow">Shop the edit</p>
            <h2 className="mt-1.5 text-2xl text-neutral-900 sm:text-3xl">{title}</h2>
          </div>
        </div>

        {/* 2-column mobile, 4-column desktop grid with responsive gaps */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-4">
          {visible.map((product, i) => (
            <ProductCard key={`${product.id}-${i}`} product={product} />
          ))}
        </div>

        {showViewMore && !expanded && products.length > 8 && (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="flex items-center gap-2 rounded-full border border-neutral-300 px-6 py-2.5 text-sm font-semibold text-neutral-800 transition hover:border-rose-500 hover:bg-rose-500 hover:text-white"
            >
              View more <DownOutlined className="text-xs" />
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
