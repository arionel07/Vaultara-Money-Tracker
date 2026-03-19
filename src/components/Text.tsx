import { useTheme } from '@/hooks/useTheme.hook'
import React, { memo } from 'react'
import { Text as RNText, TextStyle } from 'react-native'

interface TextProps {
	children: React.ReactNode
	variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'danger'
	size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl'
	weight?: 'regular' | 'medium' | 'semibold' | 'bold'
	style?: TextStyle
	numberOfLines?: number
}

const SIZES = {
	xs: 12,
	sm: 14,
	base: 16,
	lg: 18,
	xl: 20,
	'2xl': 24,
	'3xl': 30
} as const

const FONTS = {
	regular: 'Geist_400Regular',
	medium: 'Geist_500Medium',
	semibold: 'Geist_600SemiBold',
	bold: 'Geist_700Bold'
} as const

export const Text = memo<TextProps>(
	({
		children,
		variant = 'primary',
		size = 'base',
		weight = 'regular',
		style,
		numberOfLines
	}) => {
		const { colors } = useTheme()

		const colorMap = {
			primary: colors.textPrimary,
			secondary: colors.textSecondary,
			accent: colors.accent,
			success: colors.success,
			danger: colors.danger
		}
		return (
			<RNText
				numberOfLines={numberOfLines}
				style={[
					{
						color: colorMap[variant],
						fontSize: SIZES[size],
						fontFamily: FONTS[weight]
					},
					style
				]}
			>
				{children}
			</RNText>
		)
	}
)
