import { useEffect, useState } from 'react'
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
  const { mutate: markAllRead } = useMarkAllNotificationsRead(audience)
  // Ids that were unread when the bell was opened: they keep their "new"
  // highlight until it closes, even though they're already marked read.
  const [freshIds, setFreshIds] = useState<Set<string>>(new Set())

  // Opening the bell counts as reading: clear the badge as soon as the list
  // has loaded, but remember which items were new so they still stand out.
  useEffect(() => {
    if (!open || isLoading) return
    const unreadNow = items.filter((n) => !n.readAt).map((n) => n.id)
    if (unreadNow.length === 0) return
    setFreshIds((prev) => new Set([...prev, ...unreadNow]))
    markAllRead()
  }, [open, isLoading, items, markAllRead])

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) setFreshIds(new Set())
  }

  const content = (
    <div className="w-80 max-w-[calc(100vw-2rem)]">
      <div className="border-b border-neutral-100 pb-2">
        <p className="text-sm font-semibold text-neutral-900">Notifications</p>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Spin size="small" />
          </div>
        ) : items.length === 0 ? (
          <p className="py-6 text-center text-xs text-neutral-400">No notifications yet.</p>
        ) : (
          items.map((n) => {
            const isNew = !n.readAt || freshIds.has(n.id)
            return (
            <button
              key={n.id}
              type="button"
              onClick={() => {
                if (!n.readAt) markRead.mutate(n.id)
                handleOpenChange(false)
                if (n.link) navigate(n.link)
              }}
              className={`flex w-full gap-2.5 border-b border-neutral-100 px-1 py-2.5 text-left last:border-0 hover:bg-neutral-50 ${
                isNew ? 'bg-rose-50/60' : ''
              }`}
            >
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${isNew ? 'bg-rose-500' : 'bg-transparent'}`} />
              <span className="min-w-0">
                <span className="block text-xs font-semibold text-neutral-900">{n.title}</span>
                {n.body && <span className="mt-0.5 block text-xs text-neutral-500">{n.body}</span>}
                <span className="mt-1 block text-[10px] text-neutral-400">{formatDateTime(n.createdAt)}</span>
              </span>
            </button>
            )
          })
        )}
      </div>
    </div>
  )

  return (
    <Popover content={content} trigger="click" placement="bottomRight" open={open} onOpenChange={handleOpenChange} arrow={false}>
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
