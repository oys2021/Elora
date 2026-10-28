import { MinusOutlined, PlusOutlined } from '@ant-design/icons'
import type { ProductVariant } from '../../schemas/productVariant'
import type { VariantDimension, VariantDimensionKey } from '../../hooks/useVariantSelection'
import { colorHex } from '../../utils/hairColors'

const chipClass = (selected: boolean) =>
  `rounded-xl border px-3.5 py-1.5 text-[11px] font-semibold shadow-sm transition ${
    selected ? 'border-neutral-500 bg-neutral-500 text-white' : 'border-neutral-200 bg-white text-neutral-900 hover:border-neutral-400'
  }`

// Length / density / colour choices. `compact` is the smaller version used in
// the quick-add popup.
export default function VariantPicker({
  dimensions,
  selected,
  onSelect,
  compact = false,
}: {
  dimensions: VariantDimension[]
  selected: ProductVariant | undefined
  onSelect: (key: VariantDimensionKey, option: string) => void
  compact?: boolean
}) {
  return (
    <>
      {dimensions.map((dim) => (
        <div key={dim.key} className={compact ? 'mt-4' : 'mt-6'}>
          <p className={`${compact ? 'mb-2 text-xs' : 'mb-2.5 text-sm'} font-semibold text-neutral-900`}>
            {dim.label}
            {dim.key === 'colorOption' && selected?.colorOption && <span className="font-normal"> : {selected.colorOption}</span>}
          </p>

          <div className={`flex flex-wrap ${dim.key === 'colorOption' && !compact ? 'gap-3' : 'gap-2'}`}>
            {dim.options.map((opt) => {
              const isSelected = selected?.[dim.key] === opt
              const hex = dim.key === 'colorOption' ? colorHex(opt) : undefined
              // A colour we have no swatch for shows its name, so options
              // never end up as identical grey boxes.
              if (!hex) {
                return (
                  <button key={opt} type="button" aria-pressed={isSelected} onClick={() => onSelect(dim.key, opt)} className={chipClass(isSelected)}>
                    {opt}
                  </button>
                )
              }
              return (
                <button
                  key={opt}
                  type="button"
                  title={opt}
                  aria-label={opt}
                  aria-pressed={isSelected}
                  onClick={() => onSelect(dim.key, opt)}
                  className={`${compact ? 'h-9 w-9 rounded-md' : 'h-16 w-16 rounded'} transition ${
                    isSelected ? 'ring-2 ring-neutral-900 ring-offset-2' : 'ring-1 ring-black/10 hover:ring-neutral-400'
                  }`}
                  style={{ backgroundColor: hex }}
                />
              )
            })}
          </div>
        </div>
      ))}
    </>
  )
}

export function QuantityStepper({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <div className="inline-flex items-center rounded-xl border border-neutral-300">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => onChange(Math.max(1, value - 1))}
        className="flex h-9 w-9 items-center justify-center text-neutral-600 hover:text-black"
      >
        <MinusOutlined className="text-xs" />
      </button>
      <span className="w-10 text-center text-sm">{value}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => onChange(value + 1)}
        className="flex h-9 w-9 items-center justify-center text-neutral-600 hover:text-black"
      >
        <PlusOutlined className="text-xs" />
      </button>
    </div>
  )
}
