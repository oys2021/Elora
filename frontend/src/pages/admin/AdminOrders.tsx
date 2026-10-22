import { useState } from 'react'
import { Table, Tag, Select } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useOrders } from '../../queries/orders'
import { orderStatusColors, orderStatusValues, type Order, type OrderStatus } from '../../schemas/order'
import OrderDetailModal from '../../components/admin/OrderDetailModal'

const statusOptions: (OrderStatus | 'All')[] = ['All', ...orderStatusValues]

export default function AdminOrders() {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'All'>('All')
  const { data, isLoading } = useOrders({ status: statusFilter === 'All' ? undefined : statusFilter })
  const [viewingOrderId, setViewingOrderId] = useState<string | null>(null)

  const columns: ColumnsType<Order> = [
    { title: 'Order ID', dataIndex: 'id', render: (id: string) => id.slice(0, 8).toUpperCase() },
    { title: 'Customer', dataIndex: 'customerName' },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      render: (date?: string) => (date ? new Date(date).toLocaleDateString() : '—'),
    },
    { title: 'Items', render: (_, record) => record.OrderItems.length },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status: OrderStatus) => <Tag color={orderStatusColors[status]}>{status}</Tag>,
    },
    { title: 'Total (GHS)', dataIndex: 'totalAmount', render: (total: number) => total.toFixed(2) },
    {
      title: 'Actions',
      render: (_, record) => (
        <button
          type="button"
          className="text-xs text-neutral-500 underline hover:text-neutral-900"
          onClick={() => setViewingOrderId(record.id)}
        >
          View
        </button>
      ),
    },
  ]

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-xl font-semibold text-neutral-900">Orders</h1>
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          className="!w-40"
          options={statusOptions.map((status) => ({ value: status, label: status }))}
        />
      </div>

      <Table
        className="mt-6"
        rowKey="id"
        columns={columns}
        dataSource={data?.orders ?? []}
        loading={isLoading}
        pagination={{ pageSize: 8 }}
        scroll={{ x: true }}
      />

      <OrderDetailModal orderId={viewingOrderId} onClose={() => setViewingOrderId(null)} />
    </div>
  )
}
