import { Modal, Descriptions, Table, Tag, Select, Button, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useOrder, useUpdateOrderStatus, useRetryOrderSync } from '../../queries/orders'
import {
  orderStatusValues,
  orderStatusColors,
  zohoSyncStatusColors,
  type OrderItem,
  type OrderStatus,
} from '../../schemas/order'

interface OrderDetailModalProps {
  orderId: string | null
  onClose: () => void
}

export default function OrderDetailModal({ orderId, onClose }: OrderDetailModalProps) {
  const { data: order, isLoading } = useOrder(orderId ?? undefined)
  const updateStatus = useUpdateOrderStatus()
  const retrySync = useRetryOrderSync()

  const columns: ColumnsType<OrderItem> = [
    {
      title: 'Item',
      render: (_, item) => item.ProductVariant?.Product?.name ?? item.ProductVariant?.sku ?? item.variantId,
    },
    {
      title: 'Options',
      render: (_, item) => {
        const variant = item.ProductVariant
        const parts = [variant?.lengthOption, variant?.densityOption, variant?.colorOption].filter(Boolean)
        return parts.length ? parts.join(' / ') : '—'
      },
    },
    { title: 'Qty', dataIndex: 'quantity' },
    { title: 'Unit Price (GHS)', dataIndex: 'unitPrice', render: (price: number) => price.toFixed(2) },
    {
      title: 'Subtotal (GHS)',
      render: (_, item) => (item.quantity * item.unitPrice).toFixed(2),
    },
  ]

  return (
    <Modal
      title={order ? `Order ${order.id.slice(0, 8).toUpperCase()}` : 'Order'}
      open={!!orderId}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      {order && (
        <>
          <Descriptions column={2} size="small" bordered>
            <Descriptions.Item label="Customer">{order.customerName}</Descriptions.Item>
            <Descriptions.Item label="Email">{order.customerEmail}</Descriptions.Item>
            <Descriptions.Item label="Phone">{order.customerPhone}</Descriptions.Item>
            <Descriptions.Item label="Placed">
              {order.createdAt ? new Date(order.createdAt).toLocaleString() : '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <div className="flex items-center gap-2">
                <Tag color={orderStatusColors[order.status]}>{order.status}</Tag>
                <Select<OrderStatus>
                  size="small"
                  placeholder="Change status"
                  className="!w-36"
                  value={undefined}
                  loading={updateStatus.isPending}
                  options={orderStatusValues
                    .filter((status) => status !== order.status)
                    .map((status) => ({ value: status, label: status }))}
                  onChange={(status) =>
                    updateStatus.mutate(
                      { id: order.id, values: { status } },
                      {
                        onSuccess: () => message.success('Status updated'),
                        onError: (err) => message.error(err instanceof Error ? err.message : 'Update failed'),
                      }
                    )
                  }
                />
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Total">GHS {order.totalAmount.toFixed(2)}</Descriptions.Item>
            <Descriptions.Item label="Fulfillment">
              {order.fulfillmentMethod === 'DELIVERY' ? 'Delivery' : 'Pickup'}
            </Descriptions.Item>
            <Descriptions.Item label="Payment method">{order.paymentMethod}</Descriptions.Item>
            {order.fulfillmentMethod === 'DELIVERY' && (
              <Descriptions.Item label="Delivery address" span={2}>
                {[order.deliveryAddress, order.deliveryCity].filter(Boolean).join(', ') || '—'}
              </Descriptions.Item>
            )}
            {order.paymentReference && (
              <Descriptions.Item label="Payment reference" span={2}>
                {order.paymentReference}
              </Descriptions.Item>
            )}
          </Descriptions>

          <div className="mt-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-900">Zoho Sync</h3>
            <Button
              size="small"
              loading={retrySync.isPending}
              disabled={order.zohoSyncStatus === 'SYNCED'}
              onClick={() =>
                retrySync.mutate(order.id, {
                  onSuccess: () => message.success('Sync retry queued'),
                  onError: (err) => message.error(err instanceof Error ? err.message : 'Retry failed'),
                })
              }
            >
              Retry Sync
            </Button>
          </div>
          <Descriptions column={2} size="small" bordered className="mt-2">
            <Descriptions.Item label="Sync Status">
              <Tag color={zohoSyncStatusColors[order.zohoSyncStatus]}>{order.zohoSyncStatus}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Attempts">{order.syncAttempts ?? 0}</Descriptions.Item>
            <Descriptions.Item label="Zoho Sales Order ID">{order.zohoSalesOrderId ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="Last Synced">
              {order.lastSyncedAt ? new Date(order.lastSyncedAt).toLocaleString() : '—'}
            </Descriptions.Item>
            {order.syncErrorMessage && (
              <Descriptions.Item label="Last Error" span={2}>
                {order.syncErrorMessage}
              </Descriptions.Item>
            )}
          </Descriptions>

          <h3 className="mt-4 text-sm font-semibold text-neutral-900">Items</h3>
          <Table
            className="mt-2"
            rowKey="id"
            columns={columns}
            dataSource={order.OrderItems}
            loading={isLoading}
            pagination={false}
            scroll={{ x: true }}
          />
        </>
      )}
    </Modal>
  )
}
