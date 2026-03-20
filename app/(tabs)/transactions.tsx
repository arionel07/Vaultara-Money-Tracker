import { Card } from '@/components/Card'
import { MonthNavigator } from '@/components/MonthNavigator'
import { Text } from '@/components/Text'
import { TransactionItem } from '@/components/TransactionItem'
import { useTheme } from '@/hooks/useTheme.hook'
import { useSettingsStore } from '@/stores/settingsStore.store'
import { useTransactionStore } from '@/stores/transactionStore.store'
import { CURRENCY_SYMBOLS, TransactionType } from '@/types/index.type'
import { Ionicons } from '@expo/vector-icons'
import { router, useFocusEffect } from 'expo-router'
import React, { useCallback, useMemo, useState } from 'react'
import {
	Alert,
	RefreshControl,
	ScrollView,
	StyleSheet,
	TouchableOpacity,
	View
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

// ── Фильтр по типу ────────────────────────────────────────────────────────────
type FilterType = 'all' | TransactionType

const FILTERS: { key: FilterType; label: string }[] = [
	{ key: 'all', label: 'Все' },
	{ key: 'expense', label: 'Расходы' },
	{ key: 'income', label: 'Доходы' }
]

export default function TransactionsScreen() {
	const { colors } = useTheme()
	const insets = useSafeAreaInsets()
	// ── Сторы ─────────────────────────────────────────────────────────────────

	const {
		transactions,
		selectedYear,
		selectedMonth,
		monthTotals,
		isLoading,
		goToPrevMonth,
		goToNextMonth,
		loadTransactions,
		loadMonthTotals,
		removeTransaction
	} = useTransactionStore()

	const defaultCurrency = useSettingsStore(s => s.defaultCurrency)
	const symbol = CURRENCY_SYMBOLS[defaultCurrency]

	// ── Локальный фильтр ──────────────────────────────────────────────────────
	const [filter, setFilter] = useState<FilterType>('all')

	// ── Загрузка данных ───────────────────────────────────────────────────────

	useFocusEffect(
		useCallback(() => {
			loadTransactions()
			loadMonthTotals()
		}, [selectedYear, selectedMonth, filter])
	)

	const onRefresh = useCallback(() => {
		loadTransactions()
		loadMonthTotals()
	}, [])

	// ── Фильтрованные транзакции ──────────────────────────────────────────────
	const filtered = useMemo(() => {
		if (filter === 'all') return transactions
		return transactions.filter(t => t.type === filter)
	}, [transactions, filter])

	// ── Группировка по дате ───────────────────────────────────────────────────
	const grouped = useMemo(() => {
		const map = new Map<string, typeof transactions>()
		for (const t of filtered) {
			const existing = map.get(t.date) ?? []
			map.set(t.date, [...existing, t])
		}
		return Array.from(map.entries()).sort(([a], [b]) => b.localeCompare(a))
	}, [filtered])

	// ── Удаление с подтверждением ─────────────────────────────────────────────
	const handleDelete = useCallback(
		(id: number) => {
			Alert.alert(
				'Удалить транзакцию',
				'Вы уверены? Это действие нельзя отменить.',
				[
					{ text: 'Отмена', style: 'cancel' },
					{
						text: 'Удалить',
						style: 'destructive',
						onPress: () => removeTransaction(id)
					}
				]
			)
		},
		[removeTransaction]
	)

	// ── Форматирование даты группы ────────────────────────────────────────────
	const formatGroupDate = useCallback((dateStr: string): string => {
		const today = new Date()
		const yesterday = new Date(Date.now() - 86400000)
		const d = new Date(dateStr)

		const isSameDay = (a: Date, b: Date) => {
			a.getFullYear() === b.getFullYear() &&
				a.getMonth() === b.getMonth() &&
				a.getDate() === b.getDate()

			if (isSameDay(d, today)) return 'Сегодня'
			if (isSameDay(d, yesterday)) return 'Вчера'
		}

		return d.toLocaleDateString('ru-RU', {
			day: 'numeric',
			month: 'long'
		})
	}, [])

	return (
		<View style={[styles.root, { backgroundColor: colors.bgPrimary }]}>
			<ScrollView
				contentContainerStyle={[
					styles.scroll,
					{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 }
				]}
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl
						refreshing={isLoading}
						onRefresh={onRefresh}
						tintColor={colors.accent}
					/>
				}
			>
				{/* ── Заголовок ──────────────────────────────────────────────────── */}
				<View style={styles.header}>
					<View>
						{/* Назад — как iOS навигация */}
						<TouchableOpacity
							onPress={() => router.push('/(tabs)')}
							activeOpacity={0.6}
							style={styles.backBtn}
						>
							<Ionicons
								name="chevron-back"
								size={16}
								color={colors.accent}
							/>
							<Text
								size="sm"
								style={{ color: colors.accent }}
								weight="medium"
							>
								Главная
							</Text>
						</TouchableOpacity>

						<Text
							size="2xl"
							weight="bold"
						>
							Транзакции
						</Text>
					</View>

					<TouchableOpacity
						onPress={() => router.push('/modals/add-transaction')}
						activeOpacity={0.8}
						style={[styles.addButton, { backgroundColor: colors.accent }]}
					>
						<Ionicons
							name="add"
							size={22}
							color="#ffffff"
						/>
					</TouchableOpacity>
				</View>

				{/* ── Навигация по месяцам ───────────────────────────────────────── */}
				<MonthNavigator
					year={selectedYear}
					month={selectedMonth}
					onPrev={goToPrevMonth}
					onNext={goToNextMonth}
				/>

				{/* ── Сводка месяца ─────────────────────────────────────────────── */}
				<View style={styles.summaryRow}>
					<Card style={styles.summaryCard}>
						<Text
							size="xs"
							variant="secondary"
							weight="medium"
						>
							Доходы
						</Text>
						<Text
							size="lg"
							weight="bold"
							style={{ color: colors.success, marginTop: 2 }}
						>
							+{monthTotals.totalIncome.toLocaleString('ru-RU')} {symbol}
						</Text>
					</Card>

					<Card style={styles.summaryCard}>
						<Text
							size="xs"
							variant="secondary"
							weight="medium"
						>
							Расходы
						</Text>
						<Text
							size="lg"
							weight="bold"
							style={{ color: colors.danger, marginTop: 2 }}
						>
							-{monthTotals.totalExpense.toLocaleString('ru-RU')} {symbol}
						</Text>
					</Card>

					<Card style={styles.summaryCard}>
						<Text
							size="xs"
							variant="secondary"
							weight="medium"
						>
							Баланс
						</Text>
						<Text
							size="lg"
							weight="bold"
							style={{
								color:
									monthTotals.balance >= 0 ? colors.success : colors.danger,
								marginTop: 2
							}}
						>
							{monthTotals.balance >= 0 ? '+' : '−'}
							{symbol}
							{Math.abs(monthTotals.balance).toLocaleString('ru-RU')}
						</Text>
					</Card>
				</View>

				{/* ── Фильтры ───────────────────────────────────────────────────── */}
				<View
					style={[
						styles.filterRow,
						{ backgroundColor: colors.bgSecondary, borderColor: colors.border }
					]}
				>
					{FILTERS.map(f => (
						<TouchableOpacity
							key={f.key}
							onPress={() => setFilter(f.key)}
							activeOpacity={0.7}
							style={[
								styles.filterBtn,
								{
									backgroundColor:
										filter === f.key ? colors.bgElevated : 'transparent',
									borderColor: filter === f.key ? colors.border : 'transparent'
								}
							]}
						>
							<Text
								size="sm"
								weight={filter === f.key ? 'semibold' : 'regular'}
								style={{
									color:
										filter === f.key ? colors.textPrimary : colors.textSecondary
								}}
							>
								{f.label}
							</Text>
						</TouchableOpacity>
					))}
				</View>

				{/* ── Список транзакций ─────────────────────────────────────────── */}
				{grouped.length === 0 ? (
					<Card style={styles.emptyCard}>
						<Ionicons
							name="receipt-outline"
							size={36}
							color={colors.textSecondary}
						/>
						<Text
							size="sm"
							variant="secondary"
							style={{ marginTop: 10, textAlign: 'center' }}
						>
							{filter === 'all'
								? 'Транзакций за этот месяц нет.'
								: filter === 'expense'
									? 'Расходов за этот месяц нет.'
									: 'Доходов за этот месяц нет.'}
						</Text>
						<TouchableOpacity
							onPress={() => router.push('/modals/add-transaction')}
							activeOpacity={0.7}
							style={{ marginTop: 12 }}
						>
							<Text
								size="sm"
								variant="accent"
								weight="medium"
							>
								+ Добавить транзакцию
							</Text>
						</TouchableOpacity>
					</Card>
				) : (
					grouped.map(([date, items]) => (
						<View key={date}>
							{/* Заголовок группы (дата) */}
							<View style={styles.groupHeader}>
								<Text
									size="sm"
									weight="semibold"
									variant="secondary"
								>
									{formatGroupDate(date)}
								</Text>
								<View
									style={[styles.groupLine, { backgroundColor: colors.border }]}
								/>
								<Text
									size="xs"
									variant="secondary"
								>
									{items.length}{' '}
									{items.length === 1
										? 'запись'
										: items.length < 5
											? 'записи'
											: 'записей'}
								</Text>
							</View>

							{/* Транзакции группы */}
							{items.map(t => (
								<TransactionItem
									key={t.id}
									transaction={t}
									onDelete={handleDelete}
								/>
							))}
						</View>
					))
				)}
			</ScrollView>
		</View>
	)
}

const styles = StyleSheet.create({
	root: {
		flex: 1
	},
	scroll: {
		paddingHorizontal: 16,
		gap: 12
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 4
	},
	addButton: {
		width: 44,
		height: 44,
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center'
	},
	summaryRow: {
		flexDirection: 'row',
		gap: 8
	},
	summaryCard: {
		flex: 1,
		padding: 12,
		gap: 2
	},
	filterRow: {
		flexDirection: 'row',
		borderRadius: 10,
		borderWidth: 1,
		padding: 4,
		gap: 4
	},
	filterBtn: {
		flex: 1,
		alignItems: 'center',
		paddingVertical: 8,
		borderRadius: 7,
		borderWidth: 1
	},
	emptyCard: {
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 40
	},
	groupHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
		marginBottom: 8,
		marginTop: 4
	},
	groupLine: {
		flex: 1,
		height: 1
	},
	backBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 2,
		marginBottom: 4,
		// Увеличиваем зону касания для удобства
		paddingVertical: 4,
		paddingHorizontal: 0
	}
})
