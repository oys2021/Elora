import { useState, useEffect } from 'react'
import { ArrowUpOutlined } from '@ant-design/icons'

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 32 32" className="h-6 w-6 fill-white">
      <path d="M16.004 3C9.376 3 4 8.373 4 15c0 2.35.685 4.54 1.86 6.39L4 29l7.79-1.83A11.93 11.93 0 0 0 16.004 27C22.63 27 28 21.63 28 15S22.63 3 16.004 3Zm6.98 16.36c-.29.82-1.44 1.5-2.36 1.7-.63.13-1.44.24-4.19-.9-3.52-1.46-5.79-5.03-5.97-5.27-.17-.24-1.43-1.9-1.43-3.63 0-1.73.9-2.58 1.22-2.93.32-.35.7-.44.93-.44.23 0 .47 0 .67.01.22.01.5-.08.79.6.29.7.99 2.42 1.08 2.6.09.18.15.39.03.63-.12.24-.18.39-.36.6-.18.21-.38.47-.54.63-.18.18-.37.37-.16.73.21.36.94 1.55 2.02 2.51 1.39 1.24 2.56 1.62 2.93 1.8.37.18.58.15.8-.09.22-.24.94-1.1 1.19-1.48.25-.38.5-.31.83-.19.34.12 2.15 1.01 2.52 1.2.37.18.61.27.7.42.09.15.09.85-.2 1.67Z" />
    </svg>
  )
}

export default function FloatingActions() {
  const [showScroll, setShowScroll] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show button after scrolling down 300px
      if (window.scrollY > 300) {
        setShowScroll(true)
      } else {
        setShowScroll(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <div className="fixed bottom-6 right-4 z-50 flex flex-col items-end gap-3 sm:right-6">
      {/* Scroll to top button - fades/scales in when active */}
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Scroll to top"
        className={`flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-white shadow-lg transition-all duration-300 hover:bg-black hover:scale-105 active:scale-95 ${
          showScroll ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <ArrowUpOutlined className="text-sm" />
      </button>

      {/* WhatsApp Floating Button */}
      <a
        href="https://wa.me/233200000000"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] shadow-lg transition-transform duration-300 hover:scale-105 hover:brightness-105 active:scale-95"
      >
        <WhatsAppIcon />
      </a>
    </div>
  )
}