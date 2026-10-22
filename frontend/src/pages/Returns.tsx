import { Link } from 'react-router-dom'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import FloatingActions from '../components/common/FloatingActions'

const steps = [
  { title: 'Contact us within 7 days', description: 'Reach out within 7 days of delivery with your order number and reason for return.' },
  { title: 'Pack the item', description: 'Place the item back in its original packaging, unused and with tags attached.' },
  { title: 'Ship or drop off', description: 'Send it to our address, or drop it off at Elora Beauty Salon Store.' },
  { title: 'Refund processed', description: "Once inspected, we'll process your refund within 3-5 business days." },
]

export default function Returns() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="text-2xl font-semibold text-neutral-900">Returns &amp; Exchanges</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Not quite right? Here's how to return or exchange your order.
        </p>

        <ol className="mt-8 space-y-6">
          {steps.map((step, i) => (
            <li key={step.title} className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-sm font-medium text-white">
                {i + 1}
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-900">{step.title}</p>
                <p className="mt-1 text-sm text-neutral-500">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-10 rounded-xl bg-neutral-50 p-5 text-sm text-neutral-600">
          Hair products are only eligible for return if unopened and unused, due to hygiene reasons.
          Skincare items must be at least 90% full.
        </div>

        <Link
          to="/contact"
          className="mt-8 inline-block rounded-full bg-black px-6 py-2.5 text-xs font-medium uppercase tracking-wider text-white transition hover:bg-neutral-800"
        >
          Start a Return
        </Link>
      </main>

      <Footer />
      <FloatingActions />
    </div>
  )
}
