import { useTheme } from '@/hooks/useTheme.hook'
import React, { memo, useCallback } from 'react'
import {
	ActivityIndicator,
	TouchableOpacity,
	View,
	ViewStyle
} from 'react-native'
import { Text } from './Text'

interface ButtonProps {
	label: string
	onPress: () => void
	variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
	size?: 'sm' | 'md' | 'lg'
	loading?: boolean
	disabled?: boolean
	leftIcon?: React.ReactNode
	style?: ViewStyle
}

const HEIGHT = { sm: 36, md: 44, lg: 52 } as const
const FONT_SZ = { sm: 'sm', md: 'base', lg: 'lg' } as const

export const Button = memo<ButtonProps>(
	({
		label,
		onPress,
		variant = 'primary',
		size = 'md',
		loading = false,
		disabled = false,
		leftIcon,
		style
	}) => {
		const { colors } = useTheme()

		// Цвета фона и текста по варианту
		const bgMap: Record<string, string> = {
			primary: colors.accent,
			secondary: colors.bgElevated,
			danger: colors.danger,
			ghost: 'transparent'
		}

		const textVariantMap: Record<
			string,
			'primary' | 'accent' | 'danger' | 'secondary'
		> = {
			primary: 'primary',
			secondary: 'primary',
			danger: 'primary',
			ghost: 'accent'
		}

		const borderMap: Record<string, string | undefined> = {
			primary: undefined,
			secondary: colors.border,
			danger: undefined,
			ghost: undefined
		}

		const handlePress = useCallback(() => {
			if (!loading && !disabled) onPress()
		}, [loading, disabled, onPress])

		return (
			<TouchableOpacity
				onPress={handlePress}
				activeOpacity={0.75}
				disabled={disabled || loading}
				style={[
					{
						height: HEIGHT[size],
						backgroundColor: bgMap[variant],
						borderRadius: 8,
						borderWidth: borderMap[variant] ? 1 : 0,
						borderColor: borderMap[variant],
						flexDirection: 'row',
						alignItems: 'center',
						justifyContent: 'center',
						paddingHorizontal: size === 'sm' ? 12 : 16,
						opacity: disabled ? 0.45 : 1
					},
					style
				]}
			>
				{loading ? (
					<ActivityIndicator
						size="small"
						color={variant === 'primary' ? '#ffffff' : colors.accent}
					/>
				) : (
					<>
						{leftIcon && <View style={{ marginRight: 8 }}>{leftIcon}</View>}
						<Text
							size={FONT_SZ[size] as 'sm' | 'base' | 'lg'}
							weight="semibold"
							style={{
								color:
									variant === 'primary' || variant === 'danger'
										? '#ffffff'
										: variant === 'ghost'
											? colors.accent
											: colors.textPrimary
							}}
						>
							{label}
						</Text>
					</>
				)}
			</TouchableOpacity>
		)
	}
)
