import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Spin } from 'antd'
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

  // Still waiting on the first fetch: show a spinner in the box, not an empty
  // dark rectangle with nothing in it.
  const showSpinner = isLoading && slides.length === 0

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
    <div className="w-full pb-4 pt-5 sm:pt-6">
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="relative flex h-[340px] w-full items-center justify-center overflow-hidden rounded-3xl bg-neutral-100 md:h-[540px]"
      >
        {showSpinner && <Spin size="large" />}

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

        {!banners?.length && !isLoading && (
          <div className="pointer-events-none absolute inset-0 z-[2] flex items-end bg-gradient-to-t from-neutral-950/70 via-neutral-950/15 to-transparent p-6 pb-12 sm:px-24 sm:pb-16">
            <div className="max-w-lg animate-fade-up text-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-rose-200">New season</p>
              <h1 className="mt-3 text-4xl leading-[1.05] sm:text-6xl">Hair &amp; skin, beautifully you.</h1>
              <Link
                to="/products"
                className="pointer-events-auto mt-6 inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-rose-100"
              >
                Shop the collection
              </Link>
            </div>
          </div>
        )}

        {multiple && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous slide"
              className="absolute left-4 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/70 text-neutral-900 shadow-sm backdrop-blur transition hover:bg-white"
            >
              <LeftOutlined />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next slide"
              className="absolute right-4 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/70 text-neutral-900 shadow-sm backdrop-blur transition hover:bg-white"
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
                  className={`h-1.5 rounded-full transition-all duration-500 ${i === current ? 'w-8 bg-white' : 'w-1.5 bg-white/50'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
