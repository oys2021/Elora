import { useState } from 'react'
import { Table, Tag, Input, Drawer, Avatar, Descriptions, Empty } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { UserOutlined } from '@ant-design/icons'
import { useUsers } from '../../queries/users'
import { useOrders } from '../../queries/orders'
import type { AdminUser } from '../../schemas/user'
import { orderStatusColors } from '../../schemas/order'

const PAGE_SIZE = 10

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

const formatDateTime = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Not since tracking began'

const money = (amount: number) => `GHS ${amount.toFixed(2)}`

function SignInTags({ user }: { user: AdminUser }) {
  return (
    <div className="flex flex-wrap gap-1">
      {user.hasPassword ? (
        <Tag color="blue">Password</Tag>
      ) : (
        // e.g. old Google-only accounts: they sign in again via "Forgot password".
        <Tag color="gold">No password set</Tag>
      )}
    </div>
  )
}

function UserOrders({ userId }: { userId: string }) {
  const { data, isLoading } = useOrders({ userId, limit: 20 })
  const orders = data?.orders ?? []

  return (
    <Table
      size="small"
      rowKey="id"
      loading={isLoading}
      pagination={false}
      dataSource={orders}
      locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No orders yet" /> }}
      columns={[
        { title: 'Order', render: (_, o) => o.id.slice(0, 8).toUpperCase() },
        { title: 'Date', render: (_, o) => formatDate(o.createdAt) },
        { title: 'Status', render: (_, o) => <Tag color={orderStatusColors[o.status]}>{o.status}</Tag> },
        { title: 'Total', align: 'right', render: (_, o) => money(o.totalAmount) },
      ]}
    />
  )
}

export default function AdminUsers() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<AdminUser | null>(null)

  const { data, isLoading } = useUsers({ search: search || undefined, page, limit: PAGE_SIZE })
  const users = data?.users ?? []
  const total = data?.meta?.total ?? 0

  const columns: ColumnsType<AdminUser> = [
    {
      title: 'Customer',
      render: (_, user) => (
        <div className="flex items-center gap-3">
          <Avatar src={user.avatar ?? undefined} icon={<UserOutlined />} />
          <div className="min-w-0">
            <p className="truncate font-medium text-neutral-900">{user.name}</p>
            {user.username && <p className="truncate text-xs text-neutral-500">@{user.username}</p>}
          </div>
        </div>
      ),
    },
    { title: 'Email', dataIndex: 'email' },
    { title: 'Signs in with', render: (_, user) => <SignInTags user={user} /> },
    { title: 'Joined', render: (_, user) => formatDate(user.createdAt) },
    { title: 'Last login', render: (_, user) => (user.lastLoginAt ? formatDateTime(user.lastLoginAt) : '—') },
    { title: 'Orders', dataIndex: 'orderCount', align: 'right' },
    { title: 'Total spent', align: 'right', render: (_, user) => money(user.totalSpent) },
  ]

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-xl font-semibold text-neutral-900">Users</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {total} registered customer{total === 1 ? '' : 's'}. Click a row to see their orders.
          </p>
        </div>
        <Input.Search
          allowClear
          placeholder="Search by name, username or email"
          className="sm:max-w-xs"
          onSearch={(value) => {
            setSearch(value.trim())
            setPage(1)
          }}
        />
      </div>

      <Table
        className="mt-6"
        rowKey="id"
        columns={columns}
        dataSource={users}
        loading={isLoading}
        scroll={{ x: true }}
        onRow={(user) => ({ onClick: () => setSelected(user), className: 'cursor-pointer' })}
        pagination={{
          current: page,
          pageSize: PAGE_SIZE,
          total,
          showSizeChanger: false,
          onChange: setPage,
        }}
      />

      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name}
        size={480}
        destroyOnHidden
      >
        {selected && (
          <div>
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="Email">{selected.email}</Descriptions.Item>
              <Descriptions.Item label="Username">{selected.username ? `@${selected.username}` : '—'}</Descriptions.Item>
              <Descriptions.Item label="Signs in with">
                <SignInTags user={selected} />
              </Descriptions.Item>
              <Descriptions.Item label="Joined">{formatDate(selected.createdAt)}</Descriptions.Item>
              <Descriptions.Item label="Last login">{formatDateTime(selected.lastLoginAt)}</Descriptions.Item>
              <Descriptions.Item label="Orders">{selected.orderCount}</Descriptions.Item>
              <Descriptions.Item label="Total spent (paid orders)">{money(selected.totalSpent)}</Descriptions.Item>
              <Descriptions.Item label="Last order">{formatDate(selected.lastOrderAt)}</Descriptions.Item>
            </Descriptions>

            <h3 className="mb-3 mt-6 text-sm font-semibold text-neutral-900">Orders</h3>
            <UserOrders userId={selected.id} />
          </div>
        )}
      </Drawer>
    </div>
  )
}
