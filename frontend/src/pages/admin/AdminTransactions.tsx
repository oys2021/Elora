import { Table, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useOrders } from '../../queries/orders'
import { orderStatusColors, zohoSyncStatusColors, type Order } from '../../schemas/order'

export default function AdminTransactions() {
  const { data, isLoading } = useOrders({ status: 'PAID' })
  const orders = data?.orders ?? []
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0)

  const columns: ColumnsType<Order> = [
    { title: 'Transaction Ref', dataIndex: 'id', render: (id: string) => `TXN-${id.slice(0, 8).toUpperCase()}` },
    { title: 'Customer', dataIndex: 'customerName' },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      render: (date?: string) => (date ? new Date(date).toLocaleDateString() : '—'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status: Order['status']) => <Tag color={orderStatusColors[status]}>{status}</Tag>,
    },
    {
      title: 'Zoho Sync',
      dataIndex: 'zohoSyncStatus',
      render: (status: Order['zohoSyncStatus']) => <Tag color={zohoSyncStatusColors[status]}>{status}</Tag>,
    },
    { title: 'Amount (GHS)', dataIndex: 'totalAmount', render: (total: number) => total.toFixed(2) },
  ]

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-neutral-900">Transactions</h1>
        <p className="text-sm text-neutral-500">
          Total: <span className="font-semibold text-neutral-900">GHS {totalRevenue.toFixed(2)}</span>
        </p>
      </div>

      <Table
        className="mt-6"
        rowKey="id"
        columns={columns}
        dataSource={orders}
        loading={isLoading}
        pagination={{ pageSize: 8 }}
        scroll={{ x: true }}
      />
    </div>
  )
}
