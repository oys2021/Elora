import type { MomoProvider } from '../../schemas/order'

// Mobile money network badges in each brand's colours. Styled text rather
// than image files; to use official artwork, swap the markup for an <img>
// here and every place that shows a network (checkout, footer) updates.
export default function NetworkLogo({ provider, className = '' }: { provider: MomoProvider; className?: string }) {
  if (provider === 'MTN') {
    return (
      <span className={`inline-flex h-8 w-12 items-center justify-center rounded bg-[#FFCC00] ${className}`}>
        <span className="rounded-full border border-black/80 px-1 py-0.5 text-[9px] font-black leading-none text-black">
          MTN
        </span>
      </span>
    )
  }
  if (provider === 'TELECEL') {
    return (
      <span className={`inline-flex h-8 items-center justify-center rounded bg-white px-2 ${className}`}>
        <span className="text-xs font-bold text-red-600">
          <span className="font-extrabold">t</span> telecel
        </span>
      </span>
    )
  }
  return (
    <span className={`inline-flex h-8 items-center justify-center rounded bg-white px-2 ${className}`}>
      <span className="text-xs font-bold text-blue-700">
        airtel<span className="text-red-500">tigo</span>
      </span>
    </span>
  )
}
