import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Input } from 'antd'
import { CheckOutlined, CloseOutlined, LoadingOutlined } from '@ant-design/icons'
import { ApiError } from '../api/client'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { PENDING_PAYMENT_KEY, useSubmitPaymentOtp, useVerifyPayment } from '../queries/payments'
import { paymentMethodLabels } from '../schemas/order'

// Re-check every 5s while a payment is still in progress (e.g. the customer
// hasn't approved the MoMo prompt yet). Networks give them 180 seconds to
// approve, so keep going a little past that (~3.5 minutes).
const POLL_MS = 5000
const MAX_POLLS = 42

function readStoredReference() {
  try {
    return sessionStorage.getItem(PENDING_PAYMENT_KEY)
  } catch {
    return null
  }
}

// Paystack sends the customer here after paying (or cancelling). The page
// only *asks* the backend what happened; the backend checks with Paystack.
export default function PaymentResult() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { clearCart } = useCart()
  const { user } = useAuth()
  const reference = params.get('reference') || params.get('trxref') || readStoredReference()

  const location = useLocation()
  // Set by checkout for mobile money: the network's first reply to the charge.
  const momo = (location.state as { momo?: { status: string; displayText: string | null } } | null)?.momo
  const { mutate: verify, data: result, error, isPending } = useVerifyPayment()
  const submitOtp = useSubmitPaymentOtp()
  const [polls, setPolls] = useState(0)
  const [needsOtp, setNeedsOtp] = useState(momo?.status === 'send_otp')
  const [prompt, setPrompt] = useState<string | null>(momo?.displayText ?? null)
  const [otp, setOtp] = useState('')
  const [otpError, setOtpError] = useState<string | null>(null)
  const clearedRef = useRef(false)

  useEffect(() => {
    if (reference) verify(reference)
  }, [reference, verify])

  // A MoMo charge can sit in an early state before the customer has even seen
  // the prompt, so keep waiting until the network says it failed.
  const isMomo = result?.paymentMethod === 'MOBILE_MONEY'
  const waiting =
    !!result &&
    result.status === 'PENDING' &&
    (result.inProgress ||
      result.paystackStatus === 'unknown' ||
      (isMomo && !['failed', 'reversed', 'timeout'].includes(result.paystackStatus)))

  const handleSubmitOtp = () => {
    if (!reference || !otp.trim()) return
    setOtpError(null)
    submitOtp.mutate(
      { reference, otp: otp.trim() },
      {
        onSuccess: (r) => {
          setOtp('')
          if (r.chargeStatus === 'send_otp') {
            // Some networks ask for a second code.
            setPrompt(r.displayText ?? 'Enter the next code you received.')
            return
          }
          setNeedsOtp(false)
          setPrompt(r.displayText ?? null)
          setPolls(0)
          verify(reference)
        },
        onError: (err) => setOtpError(err instanceof ApiError ? err.message : 'Could not send the code. Please try again.'),
      }
    )
  }

  useEffect(() => {
    if (!reference || !waiting || polls >= MAX_POLLS) return
    const id = setTimeout(() => {
      setPolls((n) => n + 1)
      verify(reference)
    }, POLL_MS)
    return () => clearTimeout(id)
  }, [reference, waiting, polls, verify])

  // Paid: now (and only now) the cart can go.
  useEffect(() => {
    if (result?.status !== 'PAID' || clearedRef.current) return
    clearedRef.current = true
    clearCart()
    try {
      sessionStorage.removeItem(PENDING_PAYMENT_KEY)
    } catch {
      // ignore
    }
  }, [result?.status, clearCart])

  const checkAgain = () => {
    if (!reference) return
    setPolls(0)
    verify(reference)
  }

  let body: ReactNode

  if (!reference) {
    body = (
      <Outcome
        tone="error"
        title="We couldn't find your payment"
        text="If you were charged, your order will still be confirmed automatically. Check your orders or contact us."
      >
        <PrimaryButton onClick={() => navigate('/checkout')}>Back to checkout</PrimaryButton>
      </Outcome>
    )
  } else if (needsOtp && result?.status !== 'PAID' && result?.status !== 'CANCELLED') {
    // The network wants a code (OTP / voucher) before it will take the money.
    body = (
      <Outcome
        tone="neutral"
        title="Enter the code you received"
        text={prompt ?? 'Your network sent you a code to approve this payment. Enter it below.'}
      >
        <div className="mt-6 flex w-full max-w-xs flex-col gap-2">
          <Input
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="Code"
            size="large"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            onPressEnter={handleSubmitOtp}
            status={otpError ? 'error' : undefined}
            className="!rounded-lg text-center"
          />
          {otpError && <p className="text-xs text-red-600">{otpError}</p>}
        </div>
        <PrimaryButton onClick={handleSubmitOtp}>{submitOtp.isPending ? 'Checking…' : 'Confirm payment'}</PrimaryButton>
      </Outcome>
    )
  } else if (!result && (isPending || !error)) {
    body = <Outcome tone="loading" title="Confirming your payment…" text="This only takes a moment. Please don't close this page." />
  } else if (!result) {
    body = (
      <Outcome
        tone="error"
        title="We couldn't check your payment just now"
        text="Don't worry: if you were charged, your order will be confirmed automatically."
      >
        <PrimaryButton onClick={checkAgain}>Check again</PrimaryButton>
      </Outcome>
    )
  } else if (result.status === 'PAID') {
    body = (
      <Outcome tone="success" title="Payment received. Thank you!" text="We'll contact you once your order is ready.">
        <div className="mt-4 rounded-xl border border-neutral-200/80 bg-white px-6 py-4 text-xs shadow-sm">
          <p className="text-neutral-500">
            Order <span className="font-medium text-neutral-900">#{result.orderId.slice(0, 8).toUpperCase()}</span>
          </p>
          <p className="mt-1 font-medium text-emerald-700">
            Paid GHS {result.totalAmount.toFixed(2)} · {paymentMethodLabels[result.paymentMethod]}
          </p>
          {result.paymentReference && <p className="mt-1 text-neutral-400">Ref {result.paymentReference}</p>}
        </div>
        <div className="mt-8 flex w-full max-w-xs flex-col gap-2.5">
          {user && <SecondaryLink to="/orders">View my orders</SecondaryLink>}
          <PrimaryButton onClick={() => navigate('/')}>Continue shopping</PrimaryButton>
        </div>
      </Outcome>
    )
  } else if (waiting) {
    const gaveUp = polls >= MAX_POLLS
    body = (
      <Outcome
        tone={gaveUp ? 'neutral' : 'loading'}
        title={gaveUp ? 'Still waiting for your payment' : 'Waiting for your payment…'}
        text={
          result.paymentMethod === 'MOBILE_MONEY'
            ? `${prompt ?? 'Approve the payment prompt on your phone and enter your MoMo PIN.'} This page updates by itself.`
            : 'Your bank is still processing the payment. This page updates by itself.'
        }
      >
        {gaveUp && <PrimaryButton onClick={checkAgain}>Check again</PrimaryButton>}
      </Outcome>
    )
  } else if (result.status === 'CANCELLED') {
    body = (
      <Outcome
        tone="error"
        title={isMomo ? "The payment didn't go through" : 'This order has expired'}
        text={
          isMomo
            ? "We couldn't complete the mobile money payment, so the order was cancelled and nothing was charged. Your bag is still saved — please try again."
            : "It wasn't paid in time, so it was cancelled and nothing was charged. Your bag is still saved."
        }
      >
        <PrimaryButton onClick={() => navigate('/checkout')}>Back to checkout</PrimaryButton>
      </Outcome>
    )
  } else {
    // PENDING, and Paystack says this attempt didn't go through (cancelled, declined, ...).
    body = (
      <Outcome
        tone="error"
        title="Payment not completed"
        text={
          isMomo
            ? 'The prompt was declined or timed out, so no money was taken. Your bag is still saved.'
            : 'No money was taken. You can try again; your bag is still saved.'
        }
      >
        <div className="mt-8 flex w-full max-w-xs flex-col gap-2.5">
          {result.paymentAuthorizationUrl && (
            // Same Paystack transaction as before, so a retry can never charge twice.
            <PrimaryButton onClick={() => window.location.assign(result.paymentAuthorizationUrl!)}>Try paying again</PrimaryButton>
          )}
          <SecondaryLink to="/checkout">Change payment method</SecondaryLink>
        </div>
      </Outcome>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF8F5]">
      <Header />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center px-4 py-24 text-center sm:px-6">
        {body}
      </main>
      <Footer />
    </div>
  )
}

const toneStyles = {
  success: 'bg-emerald-700 text-white',
  error: 'bg-rose-100 text-rose-700',
  loading: 'bg-neutral-100 text-neutral-700',
  neutral: 'bg-amber-100 text-amber-700',
}

function Outcome({
  tone,
  title,
  text,
  children,
}: {
  tone: keyof typeof toneStyles
  title: string
  text: string
  children?: ReactNode
}) {
  return (
    <div className="flex w-full flex-col items-center" aria-live="polite">
      <div className={`flex h-16 w-16 items-center justify-center rounded-full shadow-sm ${toneStyles[tone]}`}>
        {tone === 'success' ? (
          <CheckOutlined className="text-2xl" />
        ) : tone === 'error' ? (
          <CloseOutlined className="text-2xl" />
        ) : (
          <LoadingOutlined className="text-2xl" />
        )}
      </div>
      <h1 className="mt-6 font-serif text-xl font-semibold text-neutral-900 sm:text-2xl">{title}</h1>
      <p className="mt-2 max-w-sm text-sm text-neutral-500">{text}</p>
      {children}
    </div>
  )
}

function PrimaryButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-6 w-full max-w-xs rounded-full bg-[#b56b82] py-3 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-[#a35c72]"
    >
      {children}
    </button>
  )
}

function SecondaryLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="w-full rounded-full border border-neutral-300 py-3 text-center text-xs font-semibold uppercase tracking-wider text-neutral-800 transition hover:bg-neutral-50"
    >
      {children}
    </Link>
  )
}
