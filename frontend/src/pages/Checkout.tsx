import { useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Input, Checkbox, Button, Alert, Select } from 'antd'
import { LeftOutlined, EnvironmentOutlined, CheckOutlined, LoadingOutlined } from '@ant-design/icons'
import { ZodError } from 'zod'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import FloatingActions from '../components/common/FloatingActions'
import NetworkLogo from '../components/common/NetworkLogo'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useCreateOrder } from '../queries/orders'
import { useDeliveryZones } from '../queries/deliveryZones'
import { deliveryModeLabels } from '../schemas/deliveryZone'
import {
  createOrderSchema,
  momoProviderLabels,
  momoProviderValues,
  type CheckoutPaymentMethod,
  type MomoProvider,
  type Order,
} from '../schemas/order'
import { PENDING_PAYMENT_KEY } from '../queries/payments'
import { ApiError } from '../api/client'

type Step = 'details' | 'payment' | 'confirm' | 'success'
type Fulfillment = 'delivery' | 'pickup'
type PaymentMethod = 'cash' | 'mobile_money' | 'card'

const steps: { key: Step; label: string }[] = [
  { key: 'details', label: 'Details' },
  { key: 'payment', label: 'Payment' },
  { key: 'confirm', label: 'Review' },
]

// "Save this info for next time": kept on this device only.
const SAVED_DETAILS_KEY = 'elora-checkout-details'
interface SavedDetails {
  firstName: string
  lastName: string
  email: string
  phone: string
  fulfillment: Fulfillment
  address: string
  deliveryZoneId: string | null
}

function readSavedDetails(): Partial<SavedDetails> | null {
  try {
    const raw = localStorage.getItem(SAVED_DETAILS_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : null
    return parsed && typeof parsed === 'object' ? (parsed as Partial<SavedDetails>) : null
  } catch {
    return null
  }
}

function isGhanaMobile(value: string) {
  let digits = value.replace(/\D/g, '')
  if (digits.startsWith('233')) digits = `0${digits.slice(3)}`
  else if (digits.length === 9) digits = `0${digits}`
  return /^0[2-5]\d{8}$/.test(digits)
}

const labelClass ='mb-1 block text-[10px] font-semibold uppercase tracking-wider text-neutral-500'

const paymentOptions: { key: PaymentMethod; label: string; description: string }[] = [
  { key: 'cash', label: 'Cash', description: 'Pay when you collect or receive your order' },
  { key: 'mobile_money', label: 'Mobile Money', description: 'MTN, Telecel or AirtelTigo · secured by Paystack' },
  { key: 'card', label: 'Debit / Credit Card', description: 'Visa or Mastercard · secured by Paystack' },
]

const newCheckoutKey = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`

export default function Checkout() {
  const navigate = useNavigate()
  const { items, subtotal, clearCart } = useCart()
  const { user } = useAuth()
  const createOrder = useCreateOrder()
  const { data: deliveryZones = [] } = useDeliveryZones()

  const [saved] = useState(readSavedDetails)
  const [step, setStep] = useState<Step>('details')
  const [fulfillment, setFulfillment] = useState<Fulfillment>(() => (saved?.fulfillment === 'delivery' ? 'delivery' : 'pickup'))
  const [firstName, setFirstName] = useState(() => saved?.firstName ?? user?.name.split(' ')[0] ?? '')
  const [lastName, setLastName] = useState(() => saved?.lastName ?? user?.name.split(' ').slice(1).join(' ') ?? '')
  const [email, setEmail] = useState(() => saved?.email ?? user?.email ?? '')
  const [phone, setPhone] = useState(() => saved?.phone ?? '')
  const [address, setAddress] = useState(() => saved?.address ?? '')
  const [deliveryZoneId, setDeliveryZoneId] = useState<string | null>(() => saved?.deliveryZoneId ?? null)
  const [saveInfo, setSaveInfo] = useState(() => saved !== null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)
  const [momoProvider, setMomoProvider] = useState<MomoProvider | null>(null)
  const [momoPhone, setMomoPhone] = useState(() => saved?.phone ?? '')
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null)
  const [orderError, setOrderError] = useState<string | null>(null)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  // One key per checkout attempt. Re-sending the same order (double click,
  // retry after a dropped connection) reuses it, so the server hands back the
  // order it already made instead of creating and charging a second one.
  const attemptRef = useRef<{ fingerprint: string; key: string } | null>(null)

  const stepIndex = steps.findIndex((s) => s.key === step)

  const selectedZone = deliveryZones.find((z) => z.id === deliveryZoneId) ?? null
  const deliveryFee = fulfillment === 'delivery' ? (selectedZone?.firstKgPrice ?? 0) : 0
  const total = subtotal + deliveryFee

  const detailsValid =
    firstName.trim() &&
    lastName.trim() &&
    phone.trim() &&
    email.trim() &&
    (fulfillment === 'pickup' || (address.trim() && deliveryZoneId))

  const continueToPayment = () => {
    try {
      if (saveInfo) {
        const details: SavedDetails = { firstName, lastName, email, phone, fulfillment, address, deliveryZoneId }
        localStorage.setItem(SAVED_DETAILS_KEY, JSON.stringify(details))
      } else {
        localStorage.removeItem(SAVED_DETAILS_KEY)
      }
    } catch {
      // Storage blocked: checkout still works, the details just aren't remembered.
    }
    // Most people pay from the number they just gave us.
    if (!momoPhone.trim()) setMomoPhone(phone.trim())
    setStep('payment')
  }

  const momoReady = !!momoProvider && isGhanaMobile(momoPhone)
  const paymentReady = !!paymentMethod && (paymentMethod !== 'mobile_money' || momoReady)

  const handlePlaceOrder = async () => {
    if (!paymentMethod) return
    setOrderError(null)

    const values = createOrderSchema.safeParse({
      customerName: `${firstName.trim()} ${lastName.trim()}`.trim(),
      customerEmail: email.trim(),
      customerPhone: phone.trim(),
      items: items.map((item) => ({ variantId: item.id, quantity: item.quantity })),
      fulfillmentMethod: fulfillment === 'pickup' ? 'PICKUP' : 'DELIVERY',
      deliveryAddress: fulfillment === 'delivery' ? address.trim() : undefined,
      deliveryZoneId: fulfillment === 'delivery' ? (deliveryZoneId ?? undefined) : undefined,
      paymentMethod: paymentMethod.toUpperCase() as CheckoutPaymentMethod,
      momoProvider: paymentMethod === 'mobile_money' ? (momoProvider ?? undefined) : undefined,
      momoPhone: paymentMethod === 'mobile_money' ? momoPhone.trim() : undefined,
    })
    if (!values.success) {
      setOrderError(values.error.issues[0]?.message ?? 'Please check your details and try again.')
      return
    }

    // Same order details as the last attempt -> same key; anything changed -> new attempt.
    const fingerprint = JSON.stringify(values.data)
    if (attemptRef.current?.fingerprint !== fingerprint) {
      attemptRef.current = { fingerprint, key: newCheckoutKey() }
    }
    const payOnline = paymentMethod !== 'cash'

    try {
      setIsProcessingPayment(payOnline)
      const order = await createOrder.mutateAsync({ ...values.data, idempotencyKey: attemptRef.current.key })

      if (payOnline) {
        if (order.status === 'PAID') {
          // A retry of an attempt that was already paid for.
          clearCart()
          setPlacedOrder(order)
          setStep('success')
          setIsProcessingPayment(false)
          return
        }
        const action = order.paymentAction
        if (order.status !== 'PENDING' || !action || !order.paymentReference) {
          attemptRef.current = null
          setOrderError("We couldn't start your payment. Please try again.")
          setIsProcessingPayment(false)
          return
        }
        // The cart stays until the payment is confirmed on /checkout/payment,
        // so nothing is lost if the customer backs out.
        try {
          sessionStorage.setItem(PENDING_PAYMENT_KEY, order.paymentReference)
        } catch {
          // Storage blocked: the reference also travels in the URL.
        }
        if (action.type === 'momo') {
          // The prompt is on its way to their phone; wait for it on the result page.
          navigate(`/checkout/payment?reference=${encodeURIComponent(order.paymentReference)}`, {
            state: { momo: action },
          })
          return
        }
        window.location.assign(action.url) // card: off to Paystack's page
        return // keep the button in its loading state while the browser leaves
      }

      setPlacedOrder(order)
      clearCart()
      setStep('success')
    } catch (err) {
      setIsProcessingPayment(false)
      if (err instanceof ZodError) {
        // The order was created; only reading the response failed.
        clearCart()
        setPlacedOrder(null)
        setStep('success')
      } else if (err instanceof ApiError) {
        // The server answered. A 4xx means nothing was created, so the next
        // try is a fresh attempt; on a 5xx keep the key in case it was.
        if (err.status < 500 || err.code === 'PAYMENT_INIT_FAILED') attemptRef.current = null
        setOrderError(err.message)
        if (err.code === 'INSUFFICIENT_STOCK' || err.code === 'VARIANT_NOT_FOUND' || err.code === 'PRODUCT_OUT_OF_STOCK') {
          setStep('details')
        }
      } else {
        // No answer: the order may or may not exist, so retrying keeps the
        // same key and can't create a duplicate.
        setOrderError('Could not reach the server. Please try again.')
      }
    }
  }

  if (step !== 'success' && items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-[#FAF8F5]">
        <Header />
        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center px-4 py-24 text-center sm:px-6">
          <h1 className="font-serif text-2xl font-semibold text-neutral-900">Your bag is empty</h1>
          <p className="mt-2 text-sm text-neutral-500">Add something to your bag before checking out.</p>
          <Link
            to="/products"
            className="mt-6 rounded-full bg-neutral-900 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-neutral-800"
          >
            Browse products
          </Link>
        </main>
        <Footer />
        <FloatingActions />
      </div>
    )
  }

  if (step === 'success') {
    const paid = placedOrder?.status === 'PAID'
    return (
      <div className="flex min-h-screen flex-col bg-[#FAF8F5]">
        <Header />
        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center px-4 py-24 text-center sm:px-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-700 text-white shadow-sm">
            <CheckOutlined className="text-2xl" />
          </div>
          <h1 className="mt-6 font-serif text-xl font-semibold text-neutral-900 sm:text-2xl">
            Your order is being prepared for {fulfillment === 'pickup' ? 'pickup' : 'delivery'}!
          </h1>
          {placedOrder && (
            <div className="mt-4 rounded-xl border border-neutral-200/80 bg-white px-6 py-4 text-xs shadow-sm">
              <p className="text-neutral-500">
                Order <span className="font-medium text-neutral-900">#{placedOrder.id.slice(0, 8).toUpperCase()}</span>
              </p>
              <p className="mt-1 text-neutral-500">
                {paid ? (
                  <span className="font-medium text-emerald-700">Paid{placedOrder.paymentReference ? ` · ${placedOrder.paymentReference}` : ''}</span>
                ) : (
                  <span className="font-medium text-amber-600">
                    Pay {fulfillment === 'pickup' ? 'at pickup' : 'on delivery'}
                  </span>
                )}
              </p>
            </div>
          )}
          <p className="mt-3 text-xs text-neutral-500">We will contact you once ready.</p>
          <div className="mt-8 flex w-full max-w-xs flex-col gap-2.5">
            {user && (
              <Link
                to="/orders"
                className="w-full rounded-full border border-neutral-300 py-3 text-center text-xs font-semibold uppercase tracking-wider text-neutral-800 transition hover:bg-neutral-50"
              >
                View my orders
              </Link>
            )}
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full rounded-full bg-[#b56b82] py-3 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-[#a35c72]"
            >
              Continue shopping
            </button>
          </div>
        </main>
        <Footer />
        <FloatingActions />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF8F5]">
      <Header />

      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <button
          type="button"
          onClick={() => (stepIndex > 0 ? setStep(steps[stepIndex - 1].key) : navigate(-1))}
          className="mb-6 inline-flex items-center gap-1 text-xs text-neutral-500 transition hover:text-neutral-900"
        >
          <LeftOutlined className="text-[10px]" />
          Back to {stepIndex > 0 ? steps[stepIndex - 1].label.toLowerCase() : 'cart'}
        </button>

        {/* Step indicator */}
        <div className="mb-8 flex items-center justify-between">
          {steps.map((s, i) => (
            <div key={s.key} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${
                    i <= stepIndex ? 'bg-neutral-900 text-white' : 'border border-neutral-300 text-neutral-400'
                  }`}
                >
                  {i + 1}
                </div>
                <span
                  className={`whitespace-nowrap text-center text-[10px] font-medium ${
                    i <= stepIndex ? 'text-neutral-900' : 'text-neutral-400'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`mx-1 h-px flex-1 ${i < stepIndex ? 'bg-neutral-900' : 'bg-neutral-200'}`} />
              )}
            </div>
          ))}
        </div>

        {step === 'details' && (
          <div>
            {orderError && <Alert type="error" showIcon closable message={orderError} className="mb-6" onClose={() => setOrderError(null)} />}

            {/* One form: who you are, then how you get the order. */}
            <div className="rounded-xl border border-neutral-200/80 bg-white p-5 shadow-sm">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-900">Your details</h3>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>First name *</label>
                  <Input
                    placeholder="Jane"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    size="large"
                    className="!text-xs !rounded-lg"
                  />
                </div>
                <div>
                  <label className={labelClass}>Last name *</label>
                  <Input
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    size="large"
                    className="!text-xs !rounded-lg"
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className={labelClass}>Email *</label>
                <Input
                  type="email"
                  placeholder="jane@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  size="large"
                  className="!text-xs !rounded-lg"
                />
              </div>

              <div className="mt-3">
                <label className={labelClass}>Phone number *</label>
                <Input
                  addonBefore="GH +233"
                  placeholder="24 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  size="large"
                  className="!text-xs"
                />
              </div>

              <div className="mt-6 border-t border-neutral-100 pt-5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-900">
                  How would you like to get your order?
                </h3>

                <div role="radiogroup" className="mt-3 grid grid-cols-2 gap-3">
                  {(
                    [
                      { key: 'pickup', title: 'Pick up', note: 'Free · from our store' },
                      { key: 'delivery', title: 'Delivery', note: 'Fee depends on your area' },
                    ] as const
                  ).map((option) => {
                    const selected = fulfillment === option.key
                    return (
                      <button
                        key={option.key}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => setFulfillment(option.key)}
                        className={`rounded-xl border p-3 text-left transition ${
                          selected
                            ? 'border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900'
                            : 'border-neutral-200 hover:border-neutral-400'
                        }`}
                      >
                        <span className="flex items-center gap-2 text-xs font-semibold text-neutral-900">
                          <span
                            className={`flex h-3.5 w-3.5 items-center justify-center rounded-full border ${
                              selected ? 'border-[#b56b82]' : 'border-neutral-300'
                            }`}
                          >
                            {selected && <span className="h-2 w-2 rounded-full bg-[#b56b82]" />}
                          </span>
                          {option.title}
                        </span>
                        <span className="mt-1 block pl-5.5 text-[11px] text-neutral-500">{option.note}</span>
                      </button>
                    )
                  })}
                </div>

                {fulfillment === 'pickup' ? (
                  <div className="mt-3 flex items-start gap-3 rounded-xl bg-neutral-50 p-3">
                    <EnvironmentOutlined className="mt-0.5 text-neutral-400" />
                    <div>
                      <p className="text-xs font-semibold text-neutral-900">Elora Beauty Salon Store</p>
                      <p className="mt-0.5 text-xs text-neutral-500">14 Street, Dome Pillar 2, Accra</p>
                      <p className="mt-1 text-[11px] text-neutral-400">Monday – Friday, 9:00am – 5:00pm</p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 space-y-3">
                    <div>
                      <label className={labelClass}>Delivery area *</label>
                      <Select
                        placeholder="Type to search your town"
                        size="large"
                        className="!w-full"
                        showSearch={{ optionFilterProp: 'label' }}
                        listHeight={240}
                        value={deliveryZoneId ?? undefined}
                        onChange={(value) => setDeliveryZoneId(value)}
                        notFoundContent={
                          <p className="px-1 py-2 text-xs text-neutral-500">
                            We don't deliver there yet. You can choose <span className="font-semibold">Pick up</span> instead.
                          </p>
                        }
                        options={[...deliveryZones]
                          .sort((a, b) => a.location.localeCompare(b.location))
                          .map((zone) => ({ value: zone.id, label: zone.location, zone }))}
                        optionRender={(option) => {
                          const zone = option.data.zone
                          return (
                            <div className="flex items-center justify-between gap-3 py-0.5">
                              <span className="truncate text-sm text-neutral-900">{zone.location}</span>
                              <span className="shrink-0 text-right">
                                <span className="text-xs font-semibold text-neutral-900">GHS {zone.firstKgPrice.toFixed(2)}</span>
                                <span className="ml-1.5 text-[11px] text-neutral-400">{zone.deliveryDuration}</span>
                              </span>
                            </div>
                          )
                        }}
                      />
                      {selectedZone && (
                        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg bg-neutral-50 px-3 py-2 text-[11px] text-neutral-600">
                          <span>
                            Delivery fee <span className="font-semibold text-neutral-900">GHS {selectedZone.firstKgPrice.toFixed(2)}</span>
                          </span>
                          <span className="text-neutral-300">·</span>
                          <span>Arrives: {selectedZone.deliveryDuration}</span>
                          <span className="text-neutral-300">·</span>
                          <span>{deliveryModeLabels[selectedZone.deliveryMode]}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className={labelClass}>Street address *</label>
                      <Input
                        placeholder="House number, street, landmark"
                        size="large"
                        className="!text-xs !rounded-lg"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              <Checkbox checked={saveInfo} onChange={(e) => setSaveInfo(e.target.checked)} className="!mt-5">
                <span className="text-xs text-neutral-700">Save this info for next time</span>
              </Checkbox>
            </div>

            <Button
              type="primary"
              size="large"
              block
              disabled={!detailsValid}
              onClick={continueToPayment}
              className="!mt-6 !h-11 !rounded-full !border-none !bg-[#b56b82] !text-xs !font-semibold !uppercase !tracking-wider !text-white hover:!bg-[#a35c72] disabled:!opacity-50 disabled:!cursor-not-allowed"
            >
              Continue to payment
            </Button>
            {!detailsValid && (
              <p className="mt-2 text-center text-[11px] text-neutral-400">
                Fill in the fields marked * to continue
              </p>
            )}
          </div>
        )}

        {step === 'payment' && (
          <div className="rounded-xl border border-neutral-200/80 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-neutral-900">How do you intend to pay?</h3>
            <div className="space-y-3">
              {paymentOptions.map((option) => {
                const selected = paymentMethod === option.key
                return (
                  <div
                    key={option.key}
                    className={`rounded-xl border transition ${selected ? 'border-neutral-900 bg-neutral-50' : 'border-neutral-200'}`}
                  >
                    <label className="flex cursor-pointer items-center gap-3 p-4">
                      <input
                        type="radio"
                        name="payment"
                        checked={selected}
                        onChange={() => setPaymentMethod(option.key)}
                        className="accent-[#b56b82]"
                      />
                      <div>
                        <p className="text-xs font-semibold text-neutral-900">{option.label}</p>
                        <p className="text-[11px] text-neutral-500">{option.description}</p>
                      </div>
                    </label>

                    {/* Mobile money: pick the network and the number to prompt. */}
                    {selected && option.key === 'mobile_money' && (
                      <div className="space-y-3 border-t border-neutral-200 px-4 pb-4 pt-3">
                        <div>
                          <p className={labelClass}>Network *</p>
                          <div role="radiogroup" className="grid grid-cols-3 gap-2">
                            {momoProviderValues.map((provider) => (
                              <button
                                key={provider}
                                type="button"
                                role="radio"
                                aria-checked={momoProvider === provider}
                                aria-label={momoProviderLabels[provider]}
                                onClick={() => setMomoProvider(provider)}
                                className={`flex h-12 items-center justify-center rounded-lg border bg-white transition ${
                                  momoProvider === provider
                                    ? 'border-[#b56b82] ring-1 ring-[#b56b82]'
                                    : 'border-neutral-200 hover:border-neutral-400'
                                }`}
                              >
                                <NetworkLogo provider={provider} />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className={labelClass}>Mobile money number *</label>
                          <Input
                            inputMode="tel"
                            placeholder="024 123 4567"
                            value={momoPhone}
                            onChange={(e) => setMomoPhone(e.target.value)}
                            size="large"
                            status={momoPhone && !isGhanaMobile(momoPhone) ? 'error' : undefined}
                            className="!text-xs !rounded-lg"
                          />
                          <p className="mt-1 text-[11px] text-neutral-400">
                            {momoPhone && !isGhanaMobile(momoPhone)
                              ? 'Enter a 10-digit Ghana number, e.g. 024 123 4567'
                              : "We'll send a payment prompt to this number."}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <Button
              type="primary"
              size="large"
              block
              disabled={!paymentReady}
              onClick={() => setStep('confirm')}
              className="!mt-6 !h-11 !rounded-full !border-none !bg-[#b56b82] !text-xs !font-semibold !uppercase !tracking-wider !text-white hover:!bg-[#a35c72] disabled:!opacity-50 disabled:!cursor-not-allowed"
            >
              Continue
            </Button>
          </div>
        )}

        {step === 'confirm' && (
          <div>
            {orderError && <Alert type="error" showIcon closable message={orderError} className="mb-6" onClose={() => setOrderError(null)} />}

            <div className="rounded-xl border border-neutral-200/80 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-900">Order Summary ({items.length} items)</p>

              {items.map((item) => (
                <div key={item.id} className="mt-3 space-y-1.5 border-b border-neutral-100 pb-3 text-xs">
                  <div className="flex justify-between text-neutral-500">
                    <span>Product</span>
                    <span className="text-right font-medium text-neutral-900">
                      {item.name}
                      {item.variant && <span className="block text-[10px] text-neutral-400">{item.variant}</span>}
                    </span>
                  </div>
                  <div className="flex justify-between text-neutral-500">
                    <span>Quantity</span>
                    <span className="text-neutral-900">{item.quantity}</span>
                  </div>
                  <div className="flex justify-between text-neutral-500">
                    <span>Amount</span>
                    <span className="text-neutral-900">GHS {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              ))}

              <div className="mt-3 space-y-1.5 pt-2 text-xs text-neutral-500">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>GHS {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery{selectedZone ? ` (${selectedZone.location})` : ''}</span>
                  <span>{fulfillment === 'pickup' ? 'Pick Up' : `GHS ${deliveryFee.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment</span>
                  <span className="text-right">
                    {paymentOptions.find((o) => o.key === paymentMethod)?.label}
                    {paymentMethod === 'mobile_money' && momoProvider && (
                      <span className="block text-[10px] text-neutral-400">
                        {momoProviderLabels[momoProvider]} · {momoPhone}
                      </span>
                    )}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex justify-between border-t border-neutral-200 pt-3 text-sm font-semibold text-neutral-900">
                <span>Total</span>
                <span>GHS {total.toFixed(2)}</span>
              </div>
            </div>

            <Button
              type="primary"
              size="large"
              block
              loading={createOrder.isPending || isProcessingPayment}
              icon={isProcessingPayment ? <LoadingOutlined /> : undefined}
              onClick={handlePlaceOrder}
              className="!mt-6 !h-11 !rounded-full !border-none !bg-[#b56b82] !text-xs !font-semibold !uppercase !tracking-wider !text-white hover:!bg-[#a35c72] disabled:!opacity-50 disabled:!cursor-not-allowed"
            >
              {isProcessingPayment
                ? 'Taking you to secure payment…'
                : paymentMethod === 'cash'
                  ? 'Confirm order'
                  : `Pay GHS ${total.toFixed(2)}`}
            </Button>
            <Button
              size="large"
              block
              disabled={createOrder.isPending || isProcessingPayment}
              onClick={() => navigate('/')}
              className="!mt-3 !h-11 !rounded-full !text-xs !font-semibold !uppercase !tracking-wider"
            >
              Cancel
            </Button>
          </div>
        )}
      </main>

      <Footer />
      <FloatingActions />
    </div>
  )
}