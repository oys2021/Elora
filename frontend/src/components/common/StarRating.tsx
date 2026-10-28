import { useState } from 'react'
import { StarFilled } from '@ant-design/icons'

interface StarRatingProps {
  value: number
  onChange?: (value: number) => void
  size?: 'sm' | 'lg'
}

export default function StarRating({ value, onChange, size = 'sm' }: StarRatingProps) {
  const [hover, setHover] = useState(0)
  const interactive = !!onChange
  const displayValue = hover || value
  const textSize = size === 'lg' ? 'text-xl' : 'text-xs'

  return (
    // The colour goes on a wrapper, not the icon: antd's `.anticon { color: inherit }`
    // is unlayered CSS, so it beats a Tailwind colour class put on the icon itself.
    <span className={`flex items-center gap-0.5 ${textSize}`}>
      {[1, 2, 3, 4, 5].map((n) =>
        interactive ? (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange?.(n)}
            aria-label={`Rate ${n} star${n > 1 ? 's' : ''}`}
            className={n <= displayValue ? 'text-yellow-400' : 'text-neutral-300'}
          >
            <StarFilled />
          </button>
        ) : (
          <span key={n} className={n <= Math.round(displayValue) ? 'text-yellow-400' : 'text-neutral-300'}>
            <StarFilled />
          </span>
        ),
      )}
    </span>
  )
}
