import { useState, type FormEvent } from 'react'
import { Input, Button, Alert } from 'antd'
import { ArrowRightOutlined } from '@ant-design/icons'
import { useMutation } from '@tanstack/react-query'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import FloatingActions from '../components/common/FloatingActions'
import { useAuth } from '../context/AuthContext'
import { apiClient, ApiError } from '../api/client'

export default function Contact() {
  const { user } = useAuth()
  const [submitted, setSubmitted] = useState(false)
  const [firstName, setFirstName] = useState(() => user?.name.split(' ')[0] ?? '')
  const [lastName, setLastName] = useState(() => user?.name.split(' ').slice(1).join(' ') ?? '')
  const [email, setEmail] = useState(() => user?.email ?? '')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')

  // Saved on the server and emailed to the store (and a "we got it" email to the sender).
  const send = useMutation({
    mutationFn: () =>
      apiClient.post('/contact', {
        name: `${firstName.trim()} ${lastName.trim()}`.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
      }),
    onSuccess: () => {
      setSubmitted(true)
      setSubject('')
      setMessage('')
    },
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    send.mutate()
  }
  const sendError =
    send.error instanceof ApiError
      ? Object.values(send.error.details ?? {})[0] ?? send.error.message
      : send.error
        ? 'Could not send your message. Please check your connection and try again.'
        : null

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="mx-auto w-full max-w-[1300px] flex-1 px-4 py-12 sm:px-6 sm:py-20">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">

          {/* Left Column: Brand Statement & Details */}
          <div className="flex flex-col justify-between lg:col-span-5">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
                Customer Care
              </span>
              <h1 className="mt-2 font-serif text-3xl font-normal text-neutral-900 sm:text-4xl">
                We'd love to hear from you.
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-neutral-600 sm:text-base">
                Whether you have a question about our hair bundles, need personalized skincare advice, or want to check on an existing order, our team is always here to help.
              </p>
            </div>

            {/* Minimalist Contact Info Links */}
            <div className="mt-10 space-y-6 border-t border-neutral-100 pt-8 sm:mt-12">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                  Direct Email
                </p>
                <a
                  href="mailto:hello@elora.com"
                  className="mt-1 block text-base font-medium text-neutral-900 transition hover:text-pink-500"
                >
                  hello@elora.com
                </a>
              </div>

              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                  Phone & WhatsApp
                </p>
                <a
                  href="tel:+233200000000"
                  className="mt-1 block text-base font-medium text-neutral-900 transition hover:text-pink-500"
                >
                  +233 20 000 0000
                </a>
              </div>

              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                  Location
                </p>
                <p className="mt-1 text-base font-medium text-neutral-900">
                  Accra, Ghana
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Minimalist Form */}
          <div className="lg:col-span-7 lg:pl-10">
            {submitted ? (
              <div className="flex h-full flex-col justify-center rounded-2xl bg-neutral-50 p-8 text-center sm:p-12">
                <h3 className="font-serif text-2xl text-neutral-900">Thank you!</h3>
                <p className="mt-2 text-sm text-neutral-600">
                  Your message has been sent. We've emailed you a copy and will get back to you within 1–2 working days.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    send.reset()
                    setSubmitted(false)
                  }}
                  className="mt-6 text-xs font-semibold text-neutral-900 underline hover:text-pink-500"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {sendError && <Alert type="error" showIcon message={sendError} />}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-medium text-neutral-700">
                      First Name
                    </label>
                    <Input
                      placeholder="Jane"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      size="large"
                      required
                      className="!rounded-none !border-0 !border-b !border-neutral-300 !px-0 !pb-2.5 !shadow-none transition-colors hover:!border-neutral-900 focus:!border-neutral-900 focus:!shadow-none"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-medium text-neutral-700">
                      Last Name
                    </label>
                    <Input
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      size="large"
                      required
                      className="!rounded-none !border-0 !border-b !border-neutral-300 !px-0 !pb-2.5 !shadow-none transition-colors hover:!border-neutral-900 focus:!border-neutral-900 focus:!shadow-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-neutral-700">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="jane@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    size="large"
                    required
                    className="!rounded-none !border-0 !border-b !border-neutral-300 !px-0 !pb-2.5 !shadow-none transition-colors hover:!border-neutral-900 focus:!border-neutral-900 focus:!shadow-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-neutral-700">
                    Subject
                  </label>
                  <Input
                    placeholder="Order Inquiry, Product Recommendation..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    size="large"
                    required
                    className="!rounded-none !border-0 !border-b !border-neutral-300 !px-0 !pb-2.5 !shadow-none transition-colors hover:!border-neutral-900 focus:!border-neutral-900 focus:!shadow-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-neutral-700">
                    Your Message
                  </label>
                  <Input.TextArea
                    placeholder="Write your message here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    required
                    className="!rounded-none !border-0 !border-b !border-neutral-300 !px-0 !pb-2.5 !shadow-none transition-colors hover:!border-neutral-900 focus:!border-neutral-900 focus:!shadow-none"
                  />
                </div>

                <div className="pt-4">
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={send.isPending}
                    size="large"
                    className="!flex !h-12 !items-center !justify-center !gap-3 !rounded-full !bg-neutral-900 !px-8 text-xs font-medium uppercase tracking-widest text-white transition hover:!bg-black hover:!opacity-90"
                  >
                    <span>{send.isPending ? 'Sending…' : 'Submit Request'}</span>
                    <ArrowRightOutlined className="text-xs" />
                  </Button>
                </div>
              </form>
            )}
          </div>

        </div>
      </main>

      <Footer />
      <FloatingActions />
    </div>
  )
}
