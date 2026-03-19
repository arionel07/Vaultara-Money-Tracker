import { useTheme } from '@/hooks/useTheme.hook'
import { Ionicons } from '@expo/vector-icons'
import { memo, useCallback, useState } from 'react'
import {
	TextInput,
	TextInputProps,
	TouchableOpacity,
	View,
	ViewStyle
} from 'react-native'
import { Text } from './Text'

interface InputProps extends Omit<TextInputProps, 'style'> {
	label?: string
	error?: string
	leftIcon?: keyof typeof Ionicons.glyphMap
	rightIcon?: keyof typeof Ionicons.glyphMap
	onRightPress?: () => void
	style?: ViewStyle
}

export const Input = memo<InputProps>(
	({ label, error, leftIcon, rightIcon, onRightPress, style, ...props }) => {
		const { colors } = useTheme()
		const [focused, setFocused] = useState(false)

		const handleFocus = useCallback(() => setFocused(true), [])
		const handleBlur = useCallback(() => setFocused(false), [])

		return (
			<View style={[{ gap: 6 }, style]}>
				{label && (
					<Text
						size="sm"
						weight="medium"
						variant="secondary"
					>
						{label}
					</Text>
				)}

				<View
					style={{
						flexDirection: 'row',
						alignItems: 'center',
						backgroundColor: colors.bgElevated,
						borderRadius: 8,
						borderWidth: 1,
						borderColor: error
							? colors.danger
							: focused
								? colors.accent
								: colors.border,
						paddingHorizontal: 12,
						height: 44
					}}
				>
					{leftIcon && (
						<Ionicons
							name={leftIcon}
							size={18}
							color={colors.textSecondary}
							style={{ marginRight: 8 }}
						/>
					)}

					<TextInput
						{...props}
						onFocus={handleFocus}
						onBlur={handleBlur}
						placeholderTextColor={colors.textSecondary}
						style={{
							flex: 1,
							color: colors.textPrimary,
							fontFamily: 'Geist_400Regular',
							fontSize: 16
						}}
					/>

					{rightIcon && (
						<TouchableOpacity
							onPress={onRightPress}
							activeOpacity={0.7}
						>
							<Ionicons
								name={rightIcon}
								size={18}
								color={colors.textSecondary}
							/>
						</TouchableOpacity>
					)}
				</View>

				{error && (
					<Text
						size="xs"
						variant="danger"
					>
						{error}
					</Text>
				)}
			</View>
		)
	}
)
