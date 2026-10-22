import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import { useBanners } from '../../queries/banners'
import heroSlide1 from '../../assets/hero/slide-1.jpg'
import heroSlide2 from '../../assets/hero/slide-2.jpg'
import heroSlide3 from '../../assets/hero/slide-3.jpg'

interface Slide {
  id: string
  image: string
  link?: string | null
}

// Shown only when no banners have been added in the admin panel (or they can't be loaded).
const defaultSlides: Slide[] = [
  { id: 'default-1', image: heroSlide1 },
  { id: 'default-2', image: heroSlide2 },
  { id: 'default-3', image: heroSlide3 },
]

function SlideLink({ href, children }: { href: string; children: React.ReactNode }) {
  const className = 'absolute inset-0 z-[1]'
  // A path on this site stays inside the app; anything else opens in a new tab.
  return href.startsWith('/') ? (
    <Link to={href} className={className} aria-label="Open banner link">
      {children}
    </Link>
  ) : (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className} aria-label="Open banner link">
      {children}
    </a>
  )
}

export default function HeroCarousel() {
  const { data: banners, isLoading } = useBanners()
  const [index, setIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const slides: Slide[] = banners?.length
    ? banners.map((b) => ({ id: b.id, image: b.imageUrl, link: b.linkUrl }))
    : isLoading
      ? [] // wait for the banners instead of flashing the defaults first
      : defaultSlides

  // The list can shrink while the page is open (banner removed or hidden).
  const current = slides.length ? index % slides.length : 0
  const multiple = slides.length > 1

  const go = (delta: number) => {
    setIndex((prev) => (prev + delta + slides.length) % slides.length)
  }

  useEffect(() => {
    if (isPaused || slides.length < 2) return
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [isPaused, index, slides.length])

  return (
    <div className="w-full pb-6 pt-2">
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="relative h-[320px] w-full overflow-hidden rounded-lg bg-neutral-900 md:h-[500px]"
      >
        {slides.map((slide, i) => (
          <img
            key={slide.id}
            src={slide.image}
            alt=""
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
              i === current ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}

        {slides[current]?.link && <SlideLink href={slides[current].link!}>{null}</SlideLink>}

        {multiple && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous slide"
              className="absolute left-4 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-black shadow hover:bg-white"
            >
              <LeftOutlined />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next slide"
              className="absolute right-4 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-black shadow hover:bg-white"
            >
              <RightOutlined />
            </button>

            <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
              {slides.map((slide, i) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={`h-2 w-2 rounded-full transition-colors ${i === current ? 'bg-white' : 'bg-white/40'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
