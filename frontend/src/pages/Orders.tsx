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
    <div className="flex min-h-screen flex-col bg-[#FAF8F5]">
      <Header />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <span className="text-xs font-semibold uppercase tracking-widest text-[#b97a8c]">Account History</span>
        <h1 className="mt-1 font-serif text-3xl font-normal text-neutral-900 sm:text-4xl">My Orders</h1>

        {(authLoading || (isLoading && user)) && (
          <div className="mt-12 flex justify-center">
            <Spin size="large" />
          </div>
        )}

        {!authLoading && !user && (
          <p className="mt-6 text-xs text-neutral-500 sm:text-sm">Sign in to see your orders.</p>
        )}

        {!authLoading && user && !isLoading && orders.length === 0 && (
          <p className="mt-6 text-xs text-neutral-500 sm:text-sm">You haven't placed any orders yet.</p>
        )}

        {user && !isLoading && orders.length > 0 && (
          <div className="mt-8 divide-y divide-neutral-200/80 rounded-xl border border-neutral-200/80 bg-white shadow-sm">
            {orders.map((order) => (
              <div key={order.id} className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2.5">
                    <p className="text-xs font-semibold text-neutral-900">#{order.id.slice(0, 8).toUpperCase()}</p>
                    <Tag color={orderStatusColors[order.status]} className="!text-[10px] !font-semibold">
                      {order.status}
                    </Tag>
                  </div>
                  <p className="mt-1 text-[11px] text-neutral-400">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''}
                  </p>
                  <p className="mt-1.5 text-xs text-neutral-600">
                    {order.OrderItems.map((item) => item.ProductVariant?.Product?.name ?? 'Item').join(', ')}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                  <p className="text-sm font-bold text-neutral-900">GHS {order.totalAmount.toFixed(2)}</p>
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