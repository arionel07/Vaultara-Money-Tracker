import { useTheme } from '@/hooks/useTheme.hook'
import { Ionicons } from '@expo/vector-icons'
import { memo } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { Text } from './Text'

// Названия месяцев на русском
const MONTHS = [
	'Январь',
	'Февраль',
	'Март',
	'Апрель',
	'Май',
	'Июнь',
	'Июль',
	'Август',
	'Сентябрь',
	'Октябрь',
	'Ноябрь',
	'Декабрь'
] as const

interface MonthNavigatorProps {
	year: number
	month: number // 1–12
	onPrev: () => void
	onNext: () => void
}

export const MonthNavigator = memo<MonthNavigatorProps>(
	({ year, month, onPrev, onNext }) => {
		const { colors } = useTheme()

		const isCurrentMonth =
			new Date().getFullYear() === year && new Date().getMonth() + 1 === month

		return (
			<View
				style={{
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'space-between',
					paddingVertical: 4
				}}
			>
				{/* Стрелка влево */}
				<TouchableOpacity
					onPress={onPrev}
					activeOpacity={0.7}
					style={{
						width: 36,
						height: 36,
						borderRadius: 8,
						backgroundColor: colors.bgElevated,
						borderWidth: 1,
						borderColor: colors.border,
						alignItems: 'center',
						justifyContent: 'center'
					}}
				>
					<Ionicons
						name="chevron-back"
						size={18}
						color={colors.textPrimary}
					/>
				</TouchableOpacity>

				{/* Название месяца и год */}
				<View style={{ alignItems: 'center' }}>
					<Text
						size="lg"
						weight="semibold"
					>
						{MONTHS[month - 1]}
					</Text>
					<Text
						size="xs"
						variant="secondary"
					>
						{year}
						{isCurrentMonth ? ' · сейчас' : ''}
					</Text>
				</View>

				{/* Стрелка вправо */}
				<TouchableOpacity
					onPress={onNext}
					activeOpacity={0.7}
					style={{
						width: 36,
						height: 36,
						borderRadius: 8,
						backgroundColor: colors.bgElevated,
						borderWidth: 1,
						borderColor: colors.border,
						alignItems: 'center',
						justifyContent: 'center'
					}}
				>
					<Ionicons
						name="chevron-forward"
						size={18}
						color={colors.textPrimary}
					/>
				</TouchableOpacity>
			</View>
		)
	}
)
