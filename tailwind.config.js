/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
	presets: [require('nativewind/preset')],
	theme: {
		extend: {
			colors: {
				'dark-bg': '#000000',
				'dark-card': '#0a0a0a',
				'dark-elevated': '#111111',
				'dark-border': '#1f1f1f',
				'dark-text': '#ededed',
				'dark-muted': '#a1a1a1',
				'light-bg': '#faf9f7',
				'light-card': '#f2f0ed',
				'light-elevated': '#ffffff',
				'light-border': '#e2dfda',
				'light-text': '#1a1a18',
				'light-muted': '#6b6862',
				accent: '#0070f3',
				'accent-hover': '#0060df',
				success: '#22c55e',
				'success-light': '#16a34a',
				danger: '#ef4444',
				'danger-light': '#dc2626'
			},
			fontFamily: {
				sans: ['Geist_400Regular'],
				medium: ['Geist_500Medium'],
				semibold: ['Geist_600SemiBold'],
				bold: ['Geist_700Bold']
			}
		}
	},
	plugins: []
}
