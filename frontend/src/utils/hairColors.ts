export interface HairColor {
  name: string
  hex: string
}

// Colours admins can pick for a variant. The variant stores the colour *name*,
// and the storefront/admin look the swatch up here.
export const HAIR_COLORS: HairColor[] = [
  // Natural blacks & off-blacks
  { name: 'Jet Black (#1)', hex: '#0a0a0a' },
  { name: 'Natural Black (#1B)', hex: '#1c1917' },
  { name: 'Off Black (#2)', hex: '#2b1d14' },

  // Browns
  { name: 'Darkest Brown (#3)', hex: '#362116' },
  { name: 'Dark Brown (#4)', hex: '#3b2417' },
  { name: 'Medium Brown (#5)', hex: '#523223' },
  { name: 'Chestnut Brown (#6)', hex: '#6b3f26' },
  { name: 'Hazel Brown (#8)', hex: '#7a5338' },
  { name: 'Light Brown (#10)', hex: '#8b5e3c' },
  { name: 'Ash Brown', hex: '#6e5c4f' },
  { name: 'Chocolate Brown', hex: '#4a2c1d' },
  { name: 'Mocha Brown', hex: '#5a3d2b' },
  { name: 'Coffee Brown', hex: '#4b3221' },

  // Reds, auburns & coppers
  { name: 'Auburn (#33)', hex: '#7b2d1e' },
  { name: 'Burgundy (#99J)', hex: '#6d1230' },
  { name: 'Wine Red', hex: '#5c1026' },
  { name: 'Mahogany', hex: '#5a2419' },
  { name: 'Copper', hex: '#b5651d' },
  { name: 'Ginger', hex: '#c8551b' },
  { name: 'Red (#130)', hex: '#c81e1e' },
  { name: 'Cherry Red', hex: '#9e1b23' },
  { name: 'Rose Gold', hex: '#c98a7d' },

  // Blondes
  { name: 'Dark Blonde (#14)', hex: '#a9823f' },
  { name: 'Golden Blonde (#16)', hex: '#c89a4d' },
  { name: 'Honey Blonde (#27)', hex: '#c9a253' },
  { name: 'Caramel Blonde (#30)', hex: '#b5762f' },
  { name: 'Strawberry Blonde', hex: '#c88a5a' },
  { name: 'Sandy Blonde (#24)', hex: '#d4b172' },
  { name: 'Ash Blonde (#18)', hex: '#bfae8e' },
  { name: 'Beige Blonde', hex: '#d8c6a3' },
  { name: 'Blonde 613', hex: '#f1dfa7' },
  { name: 'Platinum Blonde', hex: '#e8e4dc' },
  { name: 'Bleach Blonde', hex: '#f3e9c9' },

  // Ombre / dip-dye / highlight blends
  { name: 'Ombre 1B/27', hex: '#2b1d14' },
  { name: 'Ombre 1B/30', hex: '#3b2417' },
  { name: 'Ombre 1B/99J', hex: '#4a1420' },
  { name: 'Ombre 1B/613', hex: '#362116' },
  { name: 'Ombre 4/27', hex: '#5a3d2b' },
  { name: 'Ombre 2/30', hex: '#4a2c1d' },
  { name: 'Balayage Brown', hex: '#6b4a32' },
  { name: 'Highlighted Brown', hex: '#8a6540' },

  // Greys, whites & silvers
  { name: 'Silver Grey', hex: '#b8bcc2' },
  { name: 'Grey', hex: '#9ca3af' },
  { name: 'Salt & Pepper', hex: '#6b6b6b' },
  { name: 'Snow White', hex: '#f5f3ef' },
  { name: 'Ash Grey', hex: '#8a8d91' },

  // Fashion colours
  { name: 'Pink', hex: '#ec6fa1' },
  { name: 'Baby Pink', hex: '#f4b6cf' },
  { name: 'Hot Pink', hex: '#e0218a' },
  { name: 'Purple', hex: '#7e3fbf' },
  { name: 'Lavender', hex: '#b9a4e0' },
  { name: 'Blue', hex: '#2563eb' },
  { name: 'Navy Blue', hex: '#1e2a5e' },
  { name: 'Teal', hex: '#0f9e9a' },
  { name: 'Turquoise', hex: '#2dd4bf' },
  { name: 'Green', hex: '#2f9e44' },
  { name: 'Emerald Green', hex: '#0f6b40' },
  { name: 'Yellow', hex: '#facc15' },
  { name: 'Orange', hex: '#f97316' },
  { name: 'Grey-Blue', hex: '#64748b' },
  { name: 'Rainbow / Multicolour', hex: '#d946ef' },
]

// "Burgundy (#99J)" -> "burgundy"
const baseName = (s: string) => s.toLowerCase().replace(/\(.*?\)/g, '').trim()
// "Burgundy (#99J)" -> "99j"
const shadeCode = (s: string) => s.match(/\(#?([^)]+)\)/)?.[1]?.trim().toLowerCase()

// Variants can store the full picker name ("Burgundy (#99J)"), just the name
// ("Burgundy"), or just the industry code ("99J" / "#1B"), so accept all three.
export function colorHex(name?: string | null): string | undefined {
  if (!name) return undefined
  const wanted = name.trim().toLowerCase()
  const wantedBase = baseName(wanted)
  const wantedCode = wanted.replace(/^#/, '')
  return (
    HAIR_COLORS.find((c) => c.name.toLowerCase() === wanted) ??
    HAIR_COLORS.find((c) => baseName(c.name) === wantedBase) ??
    HAIR_COLORS.find((c) => shadeCode(c.name) === wantedCode)
  )?.hex
}
