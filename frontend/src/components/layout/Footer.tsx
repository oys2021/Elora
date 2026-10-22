import { Link } from 'react-router-dom'
import { FacebookFilled, InstagramFilled, TwitterOutlined } from '@ant-design/icons'

const businessInfo = [
  { label: 'About Elora', to: '/about' },
  { label: 'Career', to: '/career' },
  { label: 'Contact', to: '/contact' },
]
const account = [
  { label: 'My Account', to: '/account' },
  { label: 'My Orders', to: '/orders' },
  { label: 'Favorites', to: '/favorites' },
]
const shop = [
  { label: 'All Products', to: '/products' },
  { label: 'Wigs', to: '/products/wigs' },
  { label: 'Skincare', to: '/products/skincare' },
  { label: 'Body Care', to: '/products/body-care' },
  { label: 'Fragrances', to: '/products/fragrances' },
]
const help = [
  { label: 'FAQ', to: '/faq' },
  { label: 'Returns', to: '/returns' },
  { label: 'Contact Us', to: '/contact' },
]

function SocialIcons() {
  return (
    <div className="flex gap-2.5">
      <a
        href="#"
        aria-label="Instagram"
        className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-xs text-white transition hover:bg-white/20"
      >
        <InstagramFilled />
      </a>
      <a
        href="#"
        aria-label="Twitter"
        className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-xs text-white transition hover:bg-white/20"
      >
        <TwitterOutlined />
      </a>
      <a
        href="#"
        aria-label="Facebook"
        className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-xs text-white transition hover:bg-white/20"
      >
        <FacebookFilled />
      </a>
    </div>
  )
}

export default function Footer() {
  return (
    <footer className="bg-[#381d28] text-white">
      <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4 md:gap-12">

          {/* Brand Info */}
          <div className="col-span-2 space-y-4 md:col-span-1">
            <div>
              <Link to="/" className="font-display text-2xl font-normal tracking-wide text-white">
                Elora
              </Link>
              <p className="mt-0.5 text-[9px] uppercase tracking-widest text-white/60">
                HAIR &amp; SKIN
              </p>
              <p className="mt-3 max-w-xs text-xs leading-relaxed text-white/70">
                Premium wigs and skincare crafted for every skin tone and hair texture.
              </p>
            </div>
            <SocialIcons />
          </div>

          {/* Business & Account */}
          <div className="space-y-6">
            <div>
              <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-white/90">
                BUSINESS INFO
              </h3>
              <ul className="space-y-2 text-xs text-white/70">
                {businessInfo.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="transition-colors hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-white/90">
                ACCOUNT
              </h3>
              <ul className="space-y-2 text-xs text-white/70">
                {account.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="transition-colors hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Shop & Help */}
          <div className="space-y-6">
            <div>
              <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-white/90">
                SHOP
              </h3>
              <ul className="space-y-2 text-xs text-white/70">
                {shop.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="transition-colors hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-white/90">
                HELP
              </h3>
              <ul className="space-y-2 text-xs text-white/70">
                {help.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="transition-colors hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Socials & Payments */}
          <div className="col-span-2 space-y-6 md:col-span-1">
            <div>
              <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-white/90">
                FIND US ON
              </h3>
              <SocialIcons />
            </div>

            <div>
              <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-white/90">
                WE ACCEPT
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                {/* MTN */}
                <div className="flex h-8 w-12 items-center justify-center rounded bg-[#FFCC00]">
                  <span className="rounded-full border border-black/80 px-1 py-0.5 text-[9px] font-black text-black">
                    MTN
                  </span>
                </div>
                {/* Telecel */}
                <div className="flex h-8 items-center justify-center rounded bg-white px-2">
                  <span className="text-xs font-bold text-red-600">
                    <span className="font-extrabold">t</span> telecel
                  </span>
                </div>
                {/* AirtelTigo */}
                <div className="flex h-8 items-center justify-center rounded bg-white px-2">
                  <span className="text-xs font-bold text-blue-700">
                    airtel<span className="text-red-500">tigo</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </footer>
  )
}