import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, Popover, Spin } from 'antd'
import { BellOutlined } from '@ant-design/icons'
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadCount,
  type NotificationAudience,
} from '../../queries/notifications'
import { formatDateTime } from '../../utils/formatDateTime'

// Bell with an unread badge. 'customer' shows the signed-in shopper's own
// notifications; 'admin' shows the store's shared feed (new orders, payments,
// contact messages).
export default function NotificationBell({ audience, className = '' }: { audience: NotificationAudience; className?: string }) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const { data: unread = 0 } = useUnreadCount(audience, true)
  const { data: items = [], isLoading } = useNotifications(audience, open)
  const markRead = useMarkNotificationRead(audience)
  const markAllRead = useMarkAllNotificationsRead(audience)

  const content = (
    <div className="w-80 max-w-[calc(100vw-2rem)]">
      <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
        <p className="text-sm font-semibold text-neutral-900">Notifications</p>
        {unread > 0 && (
          <button
            type="button"
            onClick={() => markAllRead.mutate()}
            className="text-xs text-neutral-500 underline hover:text-neutral-900"
          >
            Mark all as read
          </button>
        )}
      </div>
      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Spin size="small" />
          </div>
        ) : items.length === 0 ? (
          <p className="py-6 text-center text-xs text-neutral-400">No notifications yet.</p>
        ) : (
          items.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => {
                if (!n.readAt) markRead.mutate(n.id)
                setOpen(false)
                if (n.link) navigate(n.link)
              }}
              className={`flex w-full gap-2.5 border-b border-neutral-100 px-1 py-2.5 text-left last:border-0 hover:bg-neutral-50 ${
                n.readAt ? '' : 'bg-rose-50/60'
              }`}
            >
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.readAt ? 'bg-transparent' : 'bg-rose-500'}`} />
              <span className="min-w-0">
                <span className="block text-xs font-semibold text-neutral-900">{n.title}</span>
                {n.body && <span className="mt-0.5 block text-xs text-neutral-500">{n.body}</span>}
                <span className="mt-1 block text-[10px] text-neutral-400">{formatDateTime(n.createdAt)}</span>
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  )

  return (
    <Popover content={content} trigger="click" placement="bottomRight" open={open} onOpenChange={setOpen} arrow={false}>
      <button
        type="button"
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
        className={`flex items-center hover:text-black transition ${className}`}
      >
        <Badge count={unread} size="small" offset={[2, -2]}>
          <BellOutlined className="text-base" />
        </Badge>
      </button>
    </Popover>
  )
}
