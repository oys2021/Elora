import { Link } from 'react-router-dom'

// Catches any /admin/* sub-path that doesn't match a route (see App.tsx's
// nested `path="*"`). Renders inside AdminLayout's <Outlet />, so the sidebar
// and header stay visible.
export default function AdminNotFound() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-white px-6 py-20 text-center">
      <p className="font-serif text-5xl font-semibold text-neutral-200">404</p>
      <h1 className="mt-3 text-lg font-semibold text-neutral-900">Page not found</h1>
      <p className="mt-1 max-w-sm text-sm text-neutral-500">
        There's no admin page at this address.
      </p>
      <Link
        to="/admin"
        className="mt-6 inline-flex items-center rounded-full bg-[#b97a8c] px-5 py-2 text-sm font-medium text-white hover:bg-[#a56b7d]"
      >
        Back to Dashboard
      </Link>
    </div>
  )
}
