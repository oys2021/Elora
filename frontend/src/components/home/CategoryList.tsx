import { Link } from 'react-router-dom'
import { useCategories } from '../../queries/categories'

export default function CategoryList() {
  const { data: categories = [] } = useCategories()

  if (categories.length === 0) return null

  return (
    <section className="w-full py-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-base font-medium text-neutral-900">Explore Popular Categories</h2>
        <Link to="/products" className="text-[10px] text-neutral-400 underline hover:text-black">
          See all
        </Link>
      </div>

      {/* Replaced flex flex-wrap with a structured grid */}
      <div className="grid grid-cols-3 gap-y-6 gap-x-4 sm:grid-cols-4 md:grid-cols-8">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/categories/${category.slug}`}
            className="flex flex-col items-center gap-2 text-center text-xs font-normal text-neutral-700 hover:text-black"
          >
            <div className="h-16 w-16 overflow-hidden rounded-full bg-neutral-100 shadow-sm sm:h-20 sm:w-20">
              {category.imageUrl && (
                <img src={category.imageUrl} alt={category.name} className="h-full w-full object-cover" />
              )}
            </div>
            <span className="line-clamp-1">{category.name}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
