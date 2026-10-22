import { Link } from 'react-router-dom'
import { Tag } from 'antd'
import { useProducts } from '../../queries/products'
import { useCategories } from '../../queries/categories'
import { useOrders } from '../../queries/orders'
import { useUsers } from '../../queries/users'
import { orderStatusColors } from '../../schemas/order'

export default function AdminDashboard() {
  const { data: products = [] } = useProducts()
  const { data: categories = [] } = useCategories()
  const { data } = useOrders()
  const { data: usersData } = useUsers({ limit: 1 })
  const orders = data?.orders ?? []
  const totalOrders = data?.meta?.total ?? orders.length
  const revenue = orders.reduce((sum, order) => sum + order.totalAmount, 0)
  const pending = orders.filter((order) => order.status === 'PENDING').length

  const stats = [
    { label: 'Total Products', value: products.length },
    { label: 'Total Categories', value: categories.length },
    { label: 'Registered Users', value: usersData?.meta?.total ?? 0 },
    { label: 'Total Orders', value: totalOrders },
    { label: 'Pending Orders', value: pending },
    { label: 'Total Revenue', value: `GHS ${revenue.toFixed(2)}` },
  ]

  return (
    <div>
      <h1 className="font-serif text-xl font-semibold text-neutral-900">Dashboard</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-neutral-200 bg-white p-5">
            <p className="text-xs text-neutral-500">{stat.label}</p>
            <p className="mt-2 text-2xl font-semibold text-neutral-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-neutral-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-900">Recent Orders</h2>
          <Link to="/admin/orders" className="text-xs text-neutral-500 underline hover:text-neutral-900">
            View all
          </Link>
        </div>

        {orders.length === 0 ? (
          <p className="mt-4 text-sm text-neutral-500">No orders yet.</p>
        ) : (
          <div className="mt-4">
            <div className="hidden gap-4 border-b border-neutral-100 pb-2 text-xs font-medium uppercase tracking-wide text-neutral-400 sm:flex sm:items-center sm:justify-between">
              <span className="w-24 shrink-0">Order</span>
              <span className="flex-1">Customer</span>
              <span className="w-24 shrink-0">Status</span>
              <span className="w-28 shrink-0 text-right">Amount</span>
            </div>
            <div className="divide-y divide-neutral-100">
              {orders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col gap-1 py-2 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                >
                  <span className="w-24 shrink-0 truncate text-neutral-700">{order.id.slice(0, 8).toUpperCase()}</span>
                  <span className="flex-1 truncate text-neutral-500">{order.customerName}</span>
                  <span className="w-24 shrink-0">
                    <Tag color={orderStatusColors[order.status]}>{order.status}</Tag>
                  </span>
                  <span className="w-28 shrink-0 text-right font-medium text-neutral-900">
                    GHS {order.totalAmount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
