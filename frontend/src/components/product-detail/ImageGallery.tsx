import { useState } from 'react'

export default function ImageGallery({ images }: { images: string[] }) {
  const [active, setActive] = useState(0)

  return (
    <div className="flex gap-3">
      <div className="flex flex-col gap-3">
        {images.map((img, i) => (
          <button
            key={img}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`View image ${i + 1}`}
            className={`h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 transition sm:h-20 sm:w-20 ${
              i === active ? 'border-neutral-900' : 'border-transparent hover:border-neutral-300'
            }`}
          >
            <img src={img} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>

      <div className="aspect-square flex-1 overflow-hidden rounded-lg bg-neutral-100">
        <img src={images[active]} alt="" className="h-full w-full object-cover" />
      </div>
    </div>
  )
}
