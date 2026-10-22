import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import FloatingActions from '../components/common/FloatingActions'

export default function AboutUs() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      {/* Main container matches Header width and expands vertically */}
      <main className="mx-auto w-full max-w-[1300px] flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="text-2xl font-semibold text-neutral-900 sm:text-3xl">About Elora</h1>
        
        <div className="mt-6 max-w-3xl space-y-4 text-sm leading-relaxed text-neutral-600 sm:text-base">
          <p>
            Elora was founded on a simple belief: everyone deserves hair and skincare that's crafted for
            them, not just sold to them. From premium human-hair wigs to gentle, effective skincare, every
            product in our catalog is chosen to work with every skin tone and hair texture — not around it.
          </p>
          <p>
            We're a small team obsessed with the details: how a lace front sits against a hairline, how a
            serum feels in the first ten seconds after application, how confident you feel walking out the
            door. That obsession is the whole business.
          </p>
          <p>
            Thank you for shopping with us — we're just getting started.
          </p>
        </div>
      </main>

      <Footer />
      <FloatingActions />
    </div>
  )
}