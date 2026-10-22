export interface HairColor {
  name: string
  hex: string
}

// Colours admins can pick for a variant. The variant stores the colour *name*,
// and the storefront/admin look the swatch up here.
export const HAIR_COLORS: HairColor[] = [
  { name: 'Jet Black', hex: '#0a0a0a' },
  { name: 'Natural Black', hex: '#1c1917' },
  { name: 'Dark Brown', hex: '#3b2417' },
  { name: 'Chestnut Brown', hex: '#6b3f26' },
  { name: 'Light Brown', hex: '#8b5e3c' },
  { name: 'Auburn', hex: '#7b2d1e' },
  { name: 'Burgundy', hex: '#6d1230' },
  { name: 'Copper', hex: '#b5651d' },
  { name: 'Ginger', hex: '#c8551b' },
  { name: 'Honey Blonde', hex: '#c9a253' },
  { name: 'Blonde 613', hex: '#f1dfa7' },
  { name: 'Platinum', hex: '#e8e4dc' },
  { name: 'Grey', hex: '#9ca3af' },
  { name: 'Red', hex: '#c81e1e' },
  { name: 'Pink', hex: '#ec6fa1' },
  { name: 'Purple', hex: '#7e3fbf' },
  { name: 'Blue', hex: '#2563eb' },
  { name: 'Teal', hex: '#0f9e9a' },
  { name: 'Green', hex: '#2f9e44' },
  { name: 'Yellow', hex: '#facc15' },
  { name: 'Orange', hex: '#f97316' },
]

export function colorHex(name?: string | null): string | undefined {
  if (!name) return undefined
  return HAIR_COLORS.find((c) => c.name.toLowerCase() === name.trim().toLowerCase())?.hex
}
