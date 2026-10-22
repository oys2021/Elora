import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Input, Checkbox, Button, Alert } from 'antd'
import { LeftOutlined, EnvironmentOutlined, CheckOutlined, LoadingOutlined } from '@ant-design/icons'
import { ZodError } from 'zod'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import FloatingActions from '../components/common/FloatingActions'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useCreateOrder } from '../queries/orders'
import { createOrderSchema, type Order, type PaymentMethod as ApiPaymentMethod } from '../schemas/order'
import { ApiError } from '../api/client'

type Step = 'details' | 'payment' | 'confirm' | 'success'
type Fulfillment = 'delivery' | 'pickup'
type PaymentMethod = 'cash' | 'mtn' | 'telecel' | 'airteltigo'

const steps: { key: Step; label: string }[] = [
  { key: 'details', label: 'Enter Your Details' },
  { key: 'payment', label: 'Payment' },
  { key: 'confirm', label: 'Confirm Payment' },
]

const paymentOptions: { key: PaymentMethod; label: string; description: string }[] = [
  { key: 'cash', label: 'Cash', description: 'Pay at the counter' },
  { key: 'mtn', label: 'MTN Money Mobile', description: 'Pay via prompt' },
  { key: 'telecel', label: 'Telecel Cash', description: 'Pay via prompt' },
  { key: 'airteltigo', label: 'AirtelTigo Money', description: 'Pay via prompt' },
]

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default function Checkout() {
  const navigate = useNavigate()
  const { items, subtotal, clearCart } = useCart()
  const { user } = useAuth()
  const createOrder = useCreateOrder()

  const [step, setStep] = useState<Step>('details')
  const [fulfillment, setFulfillment] = useState<Fulfillment>('pickup')
  const [firstName, setFirstName] = useState(() => user?.name.split(' ')[0] ?? '')
  const [lastName, setLastName] = useState(() => user?.name.split(' ').slice(1).join(' ') ?? '')
  const [email, setEmail] = useState(() => user?.email ?? '')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [saveInfo, setSaveInfo] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null)
  const [orderError, setOrderError] = useState<string | null>(null)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  const stepIndex = steps.findIndex((s) => s.key === step)

  const detailsValid =
    firstName.trim() && lastName.trim() && phone.trim() && email.trim() && (fulfillment === 'pickup' || address.trim())

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
      deliveryCity: fulfillment === 'delivery' ? city.trim() : undefined,
      paymentMethod: paymentMethod.toUpperCase() as ApiPaymentMethod,
    })
    if (!values.success) {
      setOrderError(values.error.issues[0]?.message ?? 'Please check your details and try again.')
      return
    }

    try {
      if (paymentMethod !== 'cash') {
        setIsProcessingPayment(true)
        await sleep(1200)
      }
      const order = await createOrder.mutateAsync(values.data)
      setPlacedOrder(order)
      clearCart()
      setStep('success')
    } catch (err) {
      if (err instanceof ZodError) {
        clearCart()
        setPlacedOrder(null)
        setStep('success')
      } else if (err instanceof ApiError) {
        setOrderError(err.message)
        if (err.code === 'INSUFFICIENT_STOCK' || err.code === 'VARIANT_NOT_FOUND') {
          setStep('details')
        }
      } else {
        setOrderError('Could not reach the server. Please try again.')
      }
    } finally {
      setIsProcessingPayment(false)
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

        {/* Delivery / Pickup toggle */}
        <div className="mb-6 flex rounded-full bg-neutral-200/60 p-1">
          <button
            type="button"
            onClick={() => setFulfillment('delivery')}
            className={`flex-1 rounded-full py-2 text-xs font-semibold transition ${
              fulfillment === 'delivery' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500'
            }`}
          >
            Delivery
          </button>
          <button
            type="button"
            onClick={() => setFulfillment('pickup')}
            className={`flex-1 rounded-full py-2 text-xs font-semibold transition ${
              fulfillment === 'pickup' ? 'bg-[#b56b82] text-white shadow-sm' : 'text-neutral-500'
            }`}
          >
            Pick Up
          </button>
        </div>

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

            {fulfillment === 'pickup' ? (
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-neutral-900 bg-white p-4 shadow-sm">
                <input type="radio" checked readOnly className="mt-1 accent-[#b56b82]" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-neutral-900">Elora Beauty Salon Store</p>
                    <EnvironmentOutlined className="text-neutral-400" />
                  </div>
                  <p className="mt-1 text-xs text-neutral-500">14 Street, Dome Pillar 2, Accra</p>
                  <p className="mt-2 text-[11px] text-neutral-400">
                    Opening Hours: Monday - Friday (9:00am - 5:00pm)
                  </p>
                </div>
              </label>
            ) : (
              <div className="rounded-xl border border-neutral-200/80 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold text-neutral-900">Delivery Address</p>
                <Input
                  placeholder="Street address"
                  size="large"
                  className="mt-3 !text-xs !rounded-lg"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
                <Input placeholder="City" size="large" className="mt-3 !text-xs !rounded-lg" value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
            )}

            <div className="mt-6 rounded-xl border border-neutral-200/80 bg-white p-5 shadow-sm">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-900">Enter Your Details</h3>
              <p className="mt-1 text-[11px] text-neutral-500">
                We take your details so we know who is coming for their products
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                    First Name *
                  </label>
                  <Input
                    placeholder="Jane"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    size="large"
                    className="!text-xs !rounded-lg"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                    Last Name *
                  </label>
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
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                  Email *
                </label>
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
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                  Phone Number *
                </label>
                <Input
                  addonBefore="GH +233"
                  placeholder="24 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  size="large"
                  className="!text-xs"
                />
              </div>

              <Checkbox checked={saveInfo} onChange={(e) => setSaveInfo(e.target.checked)} className="mt-4">
                <span className="text-xs text-neutral-700">Save this info for next time</span>
              </Checkbox>
            </div>

            <Button
              type="primary"
              size="large"
              block
              disabled={!detailsValid}
              onClick={() => setStep('payment')}
              className="!mt-6 !h-11 !rounded-full !border-none !bg-[#b56b82] !text-xs !font-semibold !uppercase !tracking-wider hover:!bg-[#a35c72]"
            >
              Confirm Order
            </Button>
          </div>
        )}

        {step === 'payment' && (
          <div className="rounded-xl border border-neutral-200/80 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-neutral-900">How do you intend to pay?</h3>
            <div className="space-y-3">
              {paymentOptions.map((option) => (
                <label
                  key={option.key}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                    paymentMethod === option.key ? 'border-neutral-900 bg-neutral-50' : 'border-neutral-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === option.key}
                    onChange={() => setPaymentMethod(option.key)}
                    className="accent-[#b56b82]"
                  />
                  <div>
                    <p className="text-xs font-semibold text-neutral-900">{option.label}</p>
                    <p className="text-[11px] text-neutral-500">{option.description}</p>
                  </div>
                </label>
              ))}
            </div>

            <Button
              type="primary"
              size="large"
              block
              disabled={!paymentMethod}
              onClick={() => setStep('confirm')}
              className="!mt-6 !h-11 !rounded-full !border-none !bg-[#b56b82] !text-xs !font-semibold !uppercase !tracking-wider hover:!bg-[#a35c72]"
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
                  <span>Delivery</span>
                  <span>{fulfillment === 'pickup' ? 'Pick Up' : 'Free'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment</span>
                  <span>{paymentOptions.find((o) => o.key === paymentMethod)?.label}</span>
                </div>
              </div>

              <div className="mt-4 flex justify-between border-t border-neutral-200 pt-3 text-sm font-semibold text-neutral-900">
                <span>Total</span>
                <span>GHS {subtotal.toFixed(2)}</span>
              </div>
            </div>

            <Button
              type="primary"
              size="large"
              block
              loading={createOrder.isPending || isProcessingPayment}
              icon={isProcessingPayment ? <LoadingOutlined /> : undefined}
              onClick={handlePlaceOrder}
              className="!mt-6 !h-11 !rounded-full !border-none !bg-[#b56b82] !text-xs !font-semibold !uppercase !tracking-wider hover:!bg-[#a35c72]"
            >
              {isProcessingPayment ? 'Processing payment…' : 'Confirm order'}
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