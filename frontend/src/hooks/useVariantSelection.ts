import { useMemo, useState } from 'react'
import type { Product } from '../schemas/product'
import type { ProductVariant } from '../schemas/productVariant'

export type VariantDimensionKey = 'lengthOption' | 'densityOption' | 'colorOption'

const dimensionLabels: Record<VariantDimensionKey, string> = {
  lengthOption: 'Length',
  densityOption: 'Density',
  colorOption: 'Colour',
}

export interface VariantDimension {
  key: VariantDimensionKey
  label: string
  options: string[]
}

// Picking length / density / colour for a product. Shared by the product page
// and the quick-add popup on product cards, so both behave the same.
export function useVariantSelection(product: Product, variants: ProductVariant[]) {
  const dimensions = useMemo<VariantDimension[]>(() => {
    const keys: VariantDimensionKey[] = ['lengthOption', 'densityOption', 'colorOption']
    return keys
      .map((key) => ({
        key,
        label: dimensionLabels[key],
        options: Array.from(new Set(variants.map((v) => v[key]).filter((v): v is string => !!v))),
      }))
      .filter((dim) => dim.options.length > 0)
  }, [variants])

  // The selection is always a real variant, so the price and stock shown are
  // always those of something the customer can actually buy. Until they pick,
  // it's the first variant in stock (worked out on every render, so it also
  // works when the variants arrive after the component mounts).
  const [chosenId, setChosenId] = useState<string | undefined>()
  const matchedVariant: ProductVariant | undefined =
    variants.find((v) => v.id === chosenId) ?? variants.find((v) => v.stockQuantity > 0) ?? variants[0]

  // Picking an option moves to the closest variant that has it: keep the other
  // current choices if that combination exists, otherwise prefer one in stock.
  const selectOption = (key: VariantDimensionKey, option: string) => {
    const withOption = variants.filter((v) => v[key] === option)
    const best =
      withOption.find((v) => dimensions.every((d) => d.key === key || v[d.key] === matchedVariant?.[d.key])) ??
      withOption.find((v) => v.stockQuantity > 0) ??
      withOption[0]
    if (best) setChosenId(best.id)
  }

  const price = matchedVariant ? matchedVariant.price : product.basePrice
  // Out if there's no variant, its stock is 0, or an admin manually flagged
  // the product out of stock (which overrides actual variant stock).
  const inStock = !product.isOutOfStock && (matchedVariant ? matchedVariant.stockQuantity > 0 : false)
  const lowStock = !!matchedVariant && inStock && matchedVariant.stockQuantity <= 10
  const variantLabel = matchedVariant
    ? [matchedVariant.lengthOption, matchedVariant.densityOption, matchedVariant.colorOption].filter(Boolean).join(' / ')
    : ''

  return { dimensions, matchedVariant, selectOption, price, inStock, lowStock, variantLabel }
}
