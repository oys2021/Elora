import { LoadingOutlined } from '@ant-design/icons'

// "Showing 5 of 23 reviews" + a button to load the next batch. Hidden once
// everything is shown.
export default function ShowMore({
  shown,
  total,
  noun,
  hasMore,
  loading,
  onClick,
}: {
  shown: number
  total: number
  noun: string
  hasMore: boolean
  loading: boolean
  onClick: () => void
}) {
  return (
    <div className="mt-4 flex flex-col items-center gap-2">
      {hasMore && (
        <button
          type="button"
          onClick={onClick}
          disabled={loading}
          className="flex items-center gap-2 rounded-full border border-neutral-300 px-6 py-2 text-xs font-semibold text-neutral-800 transition hover:border-neutral-900 disabled:opacity-60"
        >
          {loading && <LoadingOutlined />}
          {loading ? 'Loading…' : `Show more ${noun}`}
        </button>
      )}
      {total > 0 && (
        <p className="text-[11px] text-neutral-400">
          Showing {Math.min(shown, total)} of {total} {noun}
        </p>
      )}
    </div>
  )
}
