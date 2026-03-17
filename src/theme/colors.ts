// Цветовая палитра приложения (Vercel / Next.js стиль)

export const darkColors = {
	bgPrimary: '#000000',
	bgSecondary: '#0a0a0a',
	bgElevated: '#111111',
	border: '#1f1f1f',
	textPrimary: '#ededed',
	textSecondary: '#a1a1a1',
	accent: '#0070f3',
	accentHover: '#0060df',
	success: '#22c55e',
	danger: '#ef4444'
} as const

export const lightColors = {
	bgPrimary: '#faf9f7',
	bgSecondary: '#f2f0ed',
	bgElevated: '#ffffff',
	border: '#e2dfda',
	textPrimary: '#1a1a18',
	textSecondary: '#6b6862',
	accent: '#0070f3',
	accentHover: '#0060df',
	success: '#16a34a',
	danger: '#dc2626'
} as const

export type ThemeColors = typeof darkColors

// Токены типографики
export const typography = {
	xs: 12,
	sm: 14,
	base: 16,
	lg: 18,
	xl: 20,
	'2xl': 24,
	'3xl': 30
} as const
