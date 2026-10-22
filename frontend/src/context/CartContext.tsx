import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { apiClient, ApiError } from '../api/client'
import { productVariantResponseSchema } from '../schemas/productVariant'

export interface CartItem {
  id: string
  name: string
  variant?: string
  price: number
  image: string
  quantity: number
}

interface CartContextValue {
  items: CartItem[]
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  subtotal: number
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

const STORAGE_KEY = 'elora-cart'

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.id === 'string' &&
    typeof v.name === 'string' &&
    typeof v.price === 'number' &&
    typeof v.image === 'string' &&
    typeof v.quantity === 'number' &&
    Number.isInteger(v.quantity) &&
    v.quantity > 0
  )
}

// Storage can be empty, blocked (private window) or hold junk, so never trust it.
function readStoredCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter(isCartItem) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(readStoredCart)
  const [isOpen, setIsOpen] = useState(false)

  // Save on every change.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Storage full or blocked: the cart still works, it just won't survive a reload.
    }
  }, [items])

  // Keep two open tabs in step with each other.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setItems(readStoredCart())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // A saved cart can go stale: the price may have changed or the variant been
  // deleted since. Re-check with the server once on load so the customer never
  // sees (or pays) an out-of-date price.
  useEffect(() => {
    let cancelled = false
    const saved = readStoredCart()
    saved.forEach(async (item) => {
      try {
        const json = await apiClient.get(`/product-variants/${item.id}`)
        const { price } = productVariantResponseSchema.parse(json).data
        if (cancelled || price === item.price) return
        setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, price } : i)))
      } catch (err) {
        if (!cancelled && err instanceof ApiError && err.status === 404) {
          setItems((prev) => prev.filter((i) => i.id !== item.id))
        }
        // Any other failure (e.g. server down): keep the saved item as it is.
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  const addItem: CartContextValue['addItem'] = (item, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i))
      }
      return [...prev, { ...item, quantity }]
    })
    setIsOpen(true)
  }

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(id)
      return
    }
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)))
  }

  const clearCart = () => setItems([])

  const totalItems = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items])
  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items])

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}
