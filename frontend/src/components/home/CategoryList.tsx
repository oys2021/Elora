import { Link } from 'react-router-dom'
import { useCategories } from '../../queries/categories'

export default function CategoryList() {
  const { data: categories = [] } = useCategories()

  if (categories.length === 0) return null

  return (
    <section className="w-full py-10 sm:py-14">
      <div className="mb-6 flex items-center justify-between">
        <div><p className="eyebrow">Browse</p><h2 className="mt-1.5 text-2xl text-neutral-900 sm:text-3xl">Popular categories</h2></div>
        <Link to="/products" className="text-sm font-semibold text-neutral-700 underline-offset-4 hover:text-rose-600 hover:underline">
          See all
        </Link>
      </div>

      {/* Replaced flex flex-wrap with a structured grid */}
      <div className="grid grid-cols-3 gap-y-6 gap-x-4 sm:grid-cols-4 md:grid-cols-8">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/categories/${category.slug}`}
            className="flex flex-col items-center gap-2 text-center group text-sm font-medium text-neutral-700 hover:text-rose-700"
          >
            <div className="h-20 w-20 overflow-hidden rounded-full bg-blush ring-1 ring-neutral-200 ring-offset-4 ring-offset-background transition group-hover:ring-rose-400 sm:h-24 sm:w-24">
              {category.imageUrl && (
                <img src={category.imageUrl} alt={category.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
              )}
            </div>
            <span className="line-clamp-1">{category.name}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
