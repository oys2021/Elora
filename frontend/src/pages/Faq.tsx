import { Link } from 'react-router-dom'
import { Collapse } from 'antd'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import FloatingActions from '../components/common/FloatingActions'

const faqs = [
  {
    question: 'How long does shipping take?',
    answer:
      'Orders within Accra typically arrive within 1-2 business days. Other regions in Ghana take 3-5 business days. You will receive a tracking update once your order ships.',
  },
  {
    question: 'Can I pick up my order in person?',
    answer:
      'Yes — choose "Pick Up" at checkout and collect your order from our Elora Beauty Salon Store, Monday to Friday, 9:00am - 5:00pm.',
  },
  {
    question: 'How do I care for my wig?',
    answer:
      'Detangle gently from the ends up, wash with sulfate-free shampoo every 10-15 wears, and air dry on a wig stand. Avoid direct heat unless the wig is heat-resistant.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept Cash on pickup, MTN Mobile Money, Telecel Cash, and AirtelTigo Money.',
  },
  {
    question: 'Can I return a product if it does not fit?',
    answer:
      'Yes, unused items in original packaging can be returned within 7 days of delivery. See our Returns page for the full process.',
  },
]

export default function Faq() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="text-2xl font-semibold text-neutral-900">Frequently Asked Questions</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Can't find what you're looking for? <Link to="/contact" className="underline hover:text-neutral-900">Contact us</Link>.
        </p>

        <Collapse
          className="mt-6"
          items={faqs.map((faq, i) => ({
            key: String(i),
            label: <span className="text-sm font-medium text-neutral-900">{faq.question}</span>,
            children: <p className="text-sm text-neutral-600">{faq.answer}</p>,
          }))}
        />
      </main>

      <Footer />
      <FloatingActions />
    </div>
  )
}
