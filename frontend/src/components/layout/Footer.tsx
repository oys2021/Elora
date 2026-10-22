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

interface FooterLink {
  label: string
  to: string
}

function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/90 sm:mb-3">
        {title}
      </h3>
      <ul className="space-y-2 text-xs text-white/70">
        {links.map((link) => (
          <li key={link.label}>
            <Link to={link.to} className="transition-colors hover:text-white">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SocialIcons() {
  return (
    <div className="flex gap-2.5">
      <a
        href="#"
        aria-label="Instagram"
        className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-xs text-white transition hover:bg-white/30"
      >
        <InstagramFilled />
      </a>
      <a
        href="#"
        aria-label="Twitter"
        className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-xs text-white transition hover:bg-white/30"
      >
        <TwitterOutlined />
      </a>
      <a
        href="#"
        aria-label="Facebook"
        className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-xs text-white transition hover:bg-white/30"
      >
        <FacebookFilled />
      </a>
    </div>
  )
}

export default function Footer() {
  return (
    <footer className="bg-[#b97a8c] text-white">
      {/* pb-24 ensures floating elements (WhatsApp/Back to Top) don't cover footer content on mobile */}
      <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-12 md:py-12">
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4 md:gap-10 lg:gap-12">

          {/* Brand Info (Full width on mobile) */}
          <div className="col-span-2 space-y-4 md:col-span-1 md:space-y-6">
            <div>
              <Link to="/" className="font-serif text-2xl font-normal tracking-wide text-white">
                Elora
              </Link>
              <p className="mt-0.5 text-[10px] uppercase tracking-widest text-white/70">
                Hair &amp; Skin
              </p>
              <p className="mt-2.5 max-w-xs text-xs leading-relaxed text-white/70">
                Premium wigs and skincare crafted for every skin tone and hair texture.
              </p>
            </div>

            {/* Displayed here on tablet/desktop only to avoid duplication */}
            <div className="hidden md:block">
              <SocialIcons />
            </div>
          </div>

          {/* Navigation Column A (2-column split on mobile) */}
          <div className="space-y-6">
            <FooterColumn title="Business Info" links={businessInfo} />
            <FooterColumn title="Account" links={account} />
          </div>

          {/* Navigation Column B (2-column split on mobile) */}
          <div className="space-y-6">
            <FooterColumn title="Shop" links={shop} />
            <FooterColumn title="Help" links={help} />
          </div>

          {/* Socials & Payments (Full width on mobile) */}
          <div className="col-span-2 space-y-6 md:col-span-1 md:space-y-8">
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/90 sm:mb-3">
                Find us on
              </h3>
              <SocialIcons />
            </div>

            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/90 sm:mb-3">
                We accept
              </h3>
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                {/* MTN Badge */}
                <div className="flex h-9 w-12 items-center justify-center rounded bg-[#FFCC00] shadow-sm sm:h-10 sm:w-14">
                  <span className="rounded-full border border-black/80 px-1 py-0.5 text-[9px] font-black text-black sm:text-[10px]">
                    MTN
                  </span>
                </div>

                {/* Telecel Logo */}
                <div className="flex h-9 items-center justify-center rounded bg-white/90 px-2.5 shadow-sm sm:h-10">
                  <span className="text-xs font-bold text-red-600">
                    <span className="text-sm font-extrabold sm:text-base">t</span> telecel
                  </span>
                </div>

                {/* AirtelTigo Logo */}
                <div className="flex h-9 items-center justify-center rounded bg-white/90 px-2.5 shadow-sm sm:h-10">
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
