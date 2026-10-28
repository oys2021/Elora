import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import { useCategories } from '../../queries/categories'

export default function CategoryList() {
  const { data: categories = [] } = useCategories()
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  // The arrows only light up when there is more to see in that direction.
  const updateArrows = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    setCanPrev(el.scrollLeft > 4)
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    updateArrows()
    const observer = new ResizeObserver(updateArrows)
    observer.observe(el)
    return () => observer.disconnect()
  }, [categories.length, updateArrows])

  const scrollBy = (direction: 1 | -1) => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: 'smooth' })
  }

  if (categories.length === 0) return null

  const hasOverflow = canPrev || canNext
  const arrowClass =
    'flex h-9 w-9 items-center justify-center rounded-full border border-neutral-300 text-xs text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-neutral-300'

  return (
    <section className="w-full py-10 sm:py-14">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div><p className="eyebrow">Browse</p><h2 className="mt-1.5 text-2xl text-neutral-900 sm:text-3xl">Popular categories</h2></div>
        <div className="flex items-center gap-3">
          <Link to="/products" className="text-sm font-semibold text-neutral-700 underline-offset-4 hover:text-rose-600 hover:underline">
            See all
          </Link>
          {hasOverflow && (
            <div className="hidden items-center gap-2 sm:flex">
              <button type="button" aria-label="Previous categories" onClick={() => scrollBy(-1)} disabled={!canPrev} className={arrowClass}>
                <LeftOutlined />
              </button>
              <button type="button" aria-label="Next categories" onClick={() => scrollBy(1)} disabled={!canNext} className={arrowClass}>
                <RightOutlined />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* One scrollable row, so any number of categories keeps the section the same height. */}
      <div
        ref={scrollerRef}
        onScroll={updateArrows}
        className="-mx-1 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-1 py-2 [scrollbar-width:none] sm:gap-10 lg:gap-14 [&::-webkit-scrollbar]:hidden"
      >
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/categories/${category.slug}`}
            title={category.name}
            className="group flex w-24 shrink-0 snap-start flex-col items-center gap-2 text-center text-xs font-medium text-neutral-700 hover:text-rose-700 sm:w-28 sm:text-sm"
          >
            <div className="h-20 w-20 overflow-hidden rounded-full bg-blush ring-1 ring-neutral-200 ring-offset-4 ring-offset-background transition group-hover:ring-rose-400 sm:h-24 sm:w-24">
              {category.imageUrl && (
                <img src={category.imageUrl} alt={category.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
              )}
            </div>
            <span className="line-clamp-2 leading-snug">{category.name}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
