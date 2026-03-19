import { useTheme } from '@/hooks/useTheme.hook'
import { CURRENCY_SYMBOLS, type Transaction } from '@/types/index.type'
import { Ionicons } from '@expo/vector-icons'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { memo, useCallback } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { Text } from './Text'

interface TransactionItemProps {
	transaction: Transaction
	onPress?: (transaction: Transaction) => void
	onDelete?: (id: number) => void
}

export const TransactionItem = memo<TransactionItemProps>(
	({ transaction, onPress, onDelete }) => {
		const { colors } = useTheme()
		const isIncome = transaction.type === 'income'

		const handlePress = useCallback(
			() => onPress?.(transaction),
			[transaction, onPress]
		)
		const handleDelete = useCallback(
			() => onDelete?.(transaction.id),
			[transaction.id, onDelete]
		)

		// Форматируем дату на русском
		const dataLabel = format(parseISO(transaction.date), 'd MMM', {
			locale: ru
		})

		const amountColor = isIncome ? colors.success : colors.danger
		const amountPrefix = isIncome ? '+' : '−'
		const symbol = CURRENCY_SYMBOLS[transaction.currency]

		return (
			<TouchableOpacity
				onPress={handlePress}
				activeOpacity={0.75}
				style={{
					flexDirection: 'row',
					alignItems: 'center',
					paddingVertical: 12,
					paddingHorizontal: 16,
					backgroundColor: colors.bgSecondary,
					borderRadius: 10,
					borderWidth: 1,
					borderColor: colors.border,
					marginBottom: 8
				}}
			>
				{/* Иконка категории */}
				<View
					style={{
						width: 40,
						height: 40,
						borderRadius: 10,
						backgroundColor: transaction.categoryColor + '22', // 13% opacity
						alignItems: 'center',
						justifyContent: 'center',
						marginRight: 12
					}}
				>
					<Ionicons
						name={transaction.categoryIcon as keyof typeof Ionicons.glyphMap}
						size={20}
						color={transaction.categoryColor}
					/>
				</View>

				{/* Категория и заметка */}
				<View style={{ flex: 1 }}>
					<Text
						size="sm"
						weight="medium"
						numberOfLines={1}
					>
						{transaction.categoryName}
					</Text>
					{transaction.note ? (
						<Text
							size="xs"
							variant="secondary"
							numberOfLines={1}
						>
							{transaction.note}
						</Text>
					) : (
						<Text
							size="xs"
							variant="secondary"
						>
							{dataLabel}
						</Text>
					)}
				</View>

				{/* Сумма */}
				<View style={{ alignItems: 'flex-end', marginLeft: 8 }}>
					<Text
						size="sm"
						weight="semibold"
						style={{ color: amountColor }}
					>
						{amountPrefix}
						{symbol}
						{transaction.amount.toLocaleString('ru-RU')}
					</Text>
					{transaction.note && (
						<Text
							size="xs"
							variant="secondary"
						>
							{dataLabel}
						</Text>
					)}
				</View>

				{/* Кнопка удаления */}
				{onDelete && (
					<TouchableOpacity
						onPress={handleDelete}
						activeOpacity={0.7}
						style={{ marginLeft: 10, padding: 4 }}
					>
						<Ionicons
							name="trash-outline"
							size={16}
							color={colors.textSecondary}
						/>
					</TouchableOpacity>
				)}
			</TouchableOpacity>
		)
	}
)
