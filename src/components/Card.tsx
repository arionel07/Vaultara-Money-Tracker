import { useTheme } from '@/hooks/useTheme.hook'
import React, { memo } from 'react'
import { View, ViewStyle } from 'react-native'

interface CardProps {
	children: React.ReactNode
	style?: ViewStyle
	elevated?: boolean // true = bgElevated, false = bgSecondary
	padding?: number
}

export const Card = memo<CardProps>(
	({ children, style, elevated = false, padding = 16 }) => {
		const { colors } = useTheme()

		return (
			<View
				style={[
					{
						backgroundColor: elevated ? colors.bgElevated : colors.bgSecondary,
						borderRadius: 12,
						borderWidth: 1,
						borderColor: colors.border,
						padding
					},
					style
				]}
			>
				{children}
			</View>
		)
	}
)
