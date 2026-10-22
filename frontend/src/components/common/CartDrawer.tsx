import { Link } from 'react-router-dom'
import { CloseOutlined, HeartOutlined, DeleteOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons'
import { useCart } from '../../context/CartContext'

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal, totalItems } = useCart()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={closeCart} />

      <div className="relative flex h-full w-full max-w-md flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-neutral-900">Your Bag ({totalItems})</h2>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            className="text-neutral-500 hover:text-black"
          >
            <CloseOutlined />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <p className="mt-10 text-center text-sm text-neutral-500">Your bag is empty.</p>
          ) : (
            <div className="space-y-5">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-16 w-16 shrink-0 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    {item.variant && (
                      <p className="text-[10px] uppercase tracking-wide text-neutral-400">{item.variant}</p>
                    )}
                    <p className="text-sm font-medium text-neutral-900">{item.name}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="flex h-6 w-6 items-center justify-center rounded-full border border-neutral-300 text-neutral-600 hover:text-black"
                      >
                        <MinusOutlined className="text-[10px]" />
                      </button>
                      <span className="w-4 text-center text-xs">{item.quantity}</span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="flex h-6 w-6 items-center justify-center rounded-full border border-neutral-300 text-neutral-600 hover:text-black"
                      >
                        <PlusOutlined className="text-[10px]" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <p className="text-sm font-semibold text-neutral-900">
                      GHS {(item.price * item.quantity).toFixed(2)}
                    </p>
                    <div className="flex items-center gap-2 text-neutral-400">
                      <button type="button" aria-label="Save for later" className="hover:text-red-500">
                        <HeartOutlined />
                      </button>
                      <button
                        type="button"
                        aria-label="Remove item"
                        onClick={() => removeItem(item.id)}
                        className="hover:text-red-500"
                      >
                        <DeleteOutlined />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-neutral-100 px-5 py-4">
            <div className="space-y-1 text-sm text-neutral-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>GHS {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-neutral-900">
                <span>Total</span>
                <span>GHS {subtotal.toFixed(2)}</span>
              </div>
            </div>

            <Link
              to="/checkout"
              onClick={closeCart}
              className="mt-4 block rounded-full bg-rose-300 py-3 text-center text-sm font-medium text-white hover:bg-rose-400"
            >
              Checkout
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
