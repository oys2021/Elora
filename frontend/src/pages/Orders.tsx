import { Tag, Spin } from 'antd'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import FloatingActions from '../components/common/FloatingActions'
import { useAuth } from '../context/AuthContext'
import { useOrders } from '../queries/orders'
import { orderStatusColors } from '../schemas/order'

export default function Orders() {
  const { user, isLoading: authLoading } = useAuth()
  const { data, isLoading } = useOrders({ userId: user?.id, enabled: !!user?.id })
  const orders = data?.orders ?? []

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="text-2xl font-semibold text-neutral-900">My Orders</h1>

        {(authLoading || (isLoading && user)) && (
          <div className="mt-10 flex justify-center">
            <Spin />
          </div>
        )}

        {!authLoading && !user && <p className="mt-6 text-sm text-neutral-500">Sign in to see your orders.</p>}

        {!authLoading && user && !isLoading && orders.length === 0 && (
          <p className="mt-6 text-sm text-neutral-500">You haven't placed any orders yet.</p>
        )}

        {user && !isLoading && orders.length > 0 && (
          <div className="mt-6 divide-y divide-neutral-100 rounded-xl border border-neutral-200">
            {orders.map((order) => (
              <div key={order.id} className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-neutral-900">{order.id.slice(0, 8).toUpperCase()}</p>
                    <Tag color={orderStatusColors[order.status]}>{order.status}</Tag>
                  </div>
                  <p className="mt-1 text-xs text-neutral-500">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''}
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    {order.OrderItems.map((item) => item.ProductVariant?.Product?.name ?? 'Item').join(', ')}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                  <p className="text-sm font-semibold text-neutral-900">GHS {order.totalAmount.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
      <FloatingActions />
    </div>
  )
}
