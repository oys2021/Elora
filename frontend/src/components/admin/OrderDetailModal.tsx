import { useState, type ReactNode } from 'react'
import { Drawer, Tag, Spin, Alert } from 'antd'
import { CarOutlined, EnvironmentOutlined, MailOutlined, PhoneOutlined, ShopOutlined, UserOutlined } from '@ant-design/icons'
import { useOrder } from '../../queries/orders'
import { orderStatusColors, paymentMethodLabels, type Order } from '../../schemas/order'
import { formatDateTime } from '../../utils/formatDateTime'

interface OrderDetailModalProps {
  orderId: string | null
  onClose: () => void
}

const money = (amount: number) => `GHS ${amount.toFixed(2)}`

// Big orders show this many lines until "Show more" is clicked.
const ITEMS_PREVIEW = 3

// How the payment stands, in words an admin can act on.
function paymentState(order: Order): { label: string; color: string } {
  if (order.status === 'PAID') return { label: 'Paid', color: 'green' }
  if (order.status === 'REFUNDED') return { label: 'Refunded', color: 'purple' }
  if (order.status === 'CANCELLED') return { label: 'Not paid', color: 'red' }
  if (order.paymentMethod === 'CASH') {
    return { label: order.fulfillmentMethod === 'DELIVERY' ? 'Pay on delivery' : 'Pay at pickup', color: 'gold' }
  }
  return { label: 'Awaiting payment', color: 'blue' }
}

function Section({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-neutral-900">{title}</h3>
      </div>
      {children}
    </section>
  )
}

function Row({ label, value, strong }: { label: ReactNode; value: ReactNode; strong?: boolean }) {
  return (
    <div className={`flex items-start justify-between gap-4 py-1.5 text-sm ${strong ? 'font-semibold text-neutral-900' : 'text-neutral-600'}`}>
      <span>{label}</span>
      <span className="text-right">{value}</span>
    </div>
  )
}

export default function OrderDetailModal({ orderId, onClose }: OrderDetailModalProps) {
  const { data: order, isLoading } = useOrder(orderId ?? undefined)

  return (
    // Slides in from the right so the orders list stays visible behind it.
    <Drawer
      open={!!orderId}
      onClose={onClose}
      placement="right"
      size={Math.min(720, typeof window !== 'undefined' ? window.innerWidth : 720)}
      title="Order details"
      destroyOnHidden
      styles={{ body: { background: '#faf8f5' } }}
    >
      {isLoading || !order ? (
        <div className="flex justify-center py-16">
          <Spin />
        </div>
      ) : (
        <OrderDetail order={order} />
      )}
    </Drawer>
  )
}

function OrderDetail({ order }: { order: Order }) {
  const isDelivery = order.fulfillmentMethod === 'DELIVERY'
  const itemCount = order.OrderItems.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = order.OrderItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const payment = paymentState(order)
  const [showAllItems, setShowAllItems] = useState(false)
  const hiddenCount = Math.max(0, order.OrderItems.length - ITEMS_PREVIEW)
  const visibleItems = showAllItems ? order.OrderItems : order.OrderItems.slice(0, ITEMS_PREVIEW)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">Order #{order.id.slice(0, 8).toUpperCase()}</h2>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <Tag color={orderStatusColors[order.status]} className="!m-0">
              {order.status}
            </Tag>
            <Tag icon={isDelivery ? <CarOutlined /> : <ShopOutlined />} className="!m-0">
              {isDelivery ? 'Delivery' : 'Pick up'}
            </Tag>
          </div>
          <p className="mt-1.5 text-xs text-neutral-500">
            {formatDateTime(order.createdAt)} · from {order.User ? 'a customer account' : 'guest checkout'}
          </p>
        </div>
      </div>

      {/* Items */}
      <Section
        title={
          <>
            Order items <Tag className="!m-0">{itemCount} {itemCount === 1 ? 'item' : 'items'}</Tag>
          </>
        }
      >
        <div className="divide-y divide-neutral-100">
          {visibleItems.map((item) => {
            const variant = item.ProductVariant
            const options = [variant?.lengthOption, variant?.densityOption, variant?.colorOption].filter(Boolean).join(' / ')
            const image = variant?.Product?.imageUrls[0]
            return (
              <div key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                  {image && <img src={image} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-neutral-900">{variant?.Product?.name ?? 'Item'}</p>
                  {options && <p className="text-xs text-neutral-500">{options}</p>}
                  {variant?.sku && <p className="text-[11px] text-neutral-400">SKU {variant.sku}</p>}
                </div>
                <p className="shrink-0 text-right text-sm text-neutral-700">
                  {money(item.unitPrice)} × {item.quantity}
                  <span className="block font-semibold text-neutral-900">{money(item.unitPrice * item.quantity)}</span>
                </p>
              </div>
            )
          })}
        </div>
        {hiddenCount > 0 && (
          <button
            type="button"
            onClick={() => setShowAllItems((v) => !v)}
            className="mt-3 w-full rounded-lg border border-dashed border-neutral-300 py-2 text-xs font-semibold text-neutral-600 transition hover:border-neutral-400 hover:text-neutral-900"
          >
            {showAllItems ? 'Show fewer items' : `Show ${hiddenCount} more ${hiddenCount === 1 ? 'item' : 'items'}`}
          </button>
        )}
      </Section>

      {/* Summary + payment */}
      <Section
        title={
          <>
            Order summary
            <Tag color={payment.color} className="!m-0">
              {payment.label}
            </Tag>
          </>
        }
      >
        <Row label={`Subtotal (${itemCount} ${itemCount === 1 ? 'item' : 'items'})`} value={money(subtotal)} />
        <Row
          label={isDelivery ? `Delivery${order.DeliveryZone ? ` · ${order.DeliveryZone.location}` : ''}` : 'Pick up'}
          value={isDelivery ? money(order.deliveryFee) : 'Free'}
        />
        <div className="my-1 border-t border-neutral-100" />
        <Row label="Total" value={money(order.totalAmount)} strong />
        <div className="my-1 border-t border-neutral-100" />
        <Row
          label="Paid by customer"
          value={
            <span>
              {order.status === 'PAID' ? money(order.totalAmount) : money(0)}
              <span className="block text-xs text-neutral-400">
                {paymentMethodLabels[order.paymentMethod]}
                {order.paymentChannel && ` · ${order.paymentChannel.replace('_', ' ')}`}
              </span>
            </span>
          }
        />
        {order.paidAt && <Row label="Paid at" value={formatDateTime(order.paidAt)} />}
        {order.paymentReference && (
          <Row label="Reference" value={<span className="font-mono text-xs">{order.paymentReference}</span>} />
        )}
        {order.paymentReviewReason && (
          <Alert type="warning" showIcon className="!mt-3" message="Payment needs review" description={order.paymentReviewReason} />
        )}
      </Section>

      {/* Customer */}
      <Section title="Customer details">
        <div className="space-y-2 text-sm text-neutral-700">
          <p className="flex items-center gap-2 font-medium text-neutral-900">
            <UserOutlined className="text-neutral-400" />
            {order.customerName}
          </p>
          <a href={`mailto:${order.customerEmail}`} className="flex items-center gap-2 break-all hover:text-rose-600">
            <MailOutlined className="text-neutral-400" />
            {order.customerEmail}
          </a>
          <a href={`tel:${order.customerPhone}`} className="flex items-center gap-2 hover:text-rose-600">
            <PhoneOutlined className="text-neutral-400" />
            {order.customerPhone}
          </a>
          <p className="text-xs text-neutral-400">
            {order.User ? `Registered account (${order.User.email})` : 'Guest checkout — no account'}
          </p>
        </div>
      </Section>

      {/* Address */}
      <Section
        title={
          <>
            <EnvironmentOutlined className="text-neutral-400" /> {isDelivery ? 'Delivery address' : 'Pick-up location'}
          </>
        }
      >
        {isDelivery ? (
          <div className="text-sm text-neutral-700">
            <p>{order.deliveryAddress || '—'}</p>
            {order.deliveryCity && <p className="text-neutral-500">{order.deliveryCity}</p>}
            {order.DeliveryZone && (
              <p className="mt-1 text-xs text-neutral-400">
                Arrives: {order.DeliveryZone.deliveryDuration}
              </p>
            )}
          </div>
        ) : (
          <div className="text-sm text-neutral-700">
            <p>Elora Beauty Salon Store</p>
            <p className="text-neutral-500">14 Street, Dome Pillar 2, Accra</p>
          </div>
        )}
      </Section>
    </div>
  )
}
