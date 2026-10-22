import { colorHex } from '../../utils/hairColors'

interface ColorSwatchProps {
  name: string
  hex?: string
  className?: string
}

// A colour dot followed by its name. Unknown names (e.g. old free-text values)
// fall back to a neutral dot so the name is still shown.
export default function ColorSwatch({ name, hex, className = '' }: ColorSwatchProps) {
  const color = hex ?? colorHex(name)
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span
        aria-hidden
        className="inline-block h-3.5 w-3.5 shrink-0 rounded-full border border-black/15"
        style={{ backgroundColor: color ?? '#e5e5e5' }}
      />
      <span>{name}</span>
    </span>
  )
}
