// "27 Oct 2026, 1:58 PM" in the viewer's own time zone and locale.
export function formatDateTime(value?: string | null) {
  if (!value) return ''
  return new Date(value).toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
