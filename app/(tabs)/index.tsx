import { Card } from '@/components/Card'
import { MonthNavigator } from '@/components/MonthNavigator'
import { Text } from '@/components/Text'
import { TransactionItem } from '@/components/TransactionItem'
import { useTheme } from '@/hooks/useTheme.hook'
import { useSettingsStore } from '@/stores/settingsStore.store'
import { useTransactionStore } from '@/stores/transactionStore.store'
import { CURRENCY_SYMBOLS } from '@/types/index.type'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useCallback, useEffect, useMemo } from 'react'
import {
	RefreshControl,
	ScrollView,
	StyleSheet,
	TouchableOpacity,
	View
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function DashboardScreen() {
	const { colors } = useTheme()
	const insets = useSafeAreaInsets()

	// ── Стор ─────────────────────────────────────────────────────────────────
	const {
		selectedYear,
		selectedMonth,
		monthTotals,
		recentTransactions,
		isLoading,
		goToPrevMonth,
		goToNextMonth,
		loadMonthTotals,
		loadRecentTransactions,
		removeTransaction
	} = useTransactionStore()

	const defaultCurrency = useSettingsStore(s => s.defaultCurrency)
	const symbol = CURRENCY_SYMBOLS[defaultCurrency]

	// ── Загрузка данных ───────────────────────────────────────────────────────
	useEffect(() => {
		loadMonthTotals()
		loadRecentTransactions()
	}, [selectedYear, selectedMonth])

	const onRefresh = useCallback(() => {
		loadMonthTotals()
		loadRecentTransactions()
	}, [])

	// ── Цвет баланса ──────────────────────────────────────────────────────────
	const balanceColor = useMemo(
		() => (monthTotals.balance >= 0 ? colors.success : colors.danger),
		[monthTotals.balance, colors]
	)

	// ── Процент расходов от доходов ───────────────────────────────────────────
	const expensePercent = useMemo(() => {
		if (monthTotals.totalIncome === 0) return 0
		return Math.round(
			(monthTotals.totalExpense / monthTotals.totalIncome) * 100
		)
	}, [monthTotals])

	// ── Открыть модал добавления транзакции ───────────────────────────────────
	const openAddTransaction = useCallback(() => {
		router.push('/modals/add-transaction')
	}, [])

	// ── Удаление транзакции ───────────────────────────────────────────────────
	const handleDelete = useCallback(
		(id: number) => {
			removeTransaction(id)
		},
		[removeTransaction]
	)

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
						<Text
							size="xs"
							variant="secondary"
							weight="medium"
						>
							VAULTARA
						</Text>
						<Text
							size="2xl"
							weight="bold"
						>
							Дашборд
						</Text>
					</View>

					{/* Кнопка добавить */}
					<TouchableOpacity
						onPress={openAddTransaction}
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

				{/* ── Карточки сводки ────────────────────────────────────────────── */}
				<View style={styles.summaryGrid}>
					{/* Доходы */}
					<Card style={styles.summaryCard}>
						<View style={styles.summaryIcon}>
							<Ionicons
								name="arrow-down-circle-outline"
								size={18}
								color={colors.success}
							/>
						</View>

						<Text
							size="xs"
							variant="secondary"
							weight="medium"
						>
							Доходы
						</Text>
						<Text
							size="xl"
							weight="bold"
							style={{ color: colors.success, marginTop: 4 }}
						>
							{monthTotals.totalIncome.toLocaleString('ru-RU')} {symbol}
						</Text>
					</Card>

					{/* Расходы */}
					<Card style={styles.summaryCard}>
						<View style={styles.summaryIcon}>
							<Ionicons
								name="arrow-up-circle-outline"
								size={18}
								color={colors.danger}
							/>
						</View>

						<Text
							size="xs"
							variant="secondary"
							weight="medium"
						>
							Расходы
						</Text>
						<Text
							size="xl"
							weight="bold"
							style={{ color: colors.danger, marginTop: 4 }}
						>
							{monthTotals.totalExpense.toLocaleString('ru-RU')} {symbol}
						</Text>
					</Card>
				</View>
				{/* ── Баланс ─────────────────────────────────────────────────────── */}
				<Card style={{ marginTop: 12 }}>
					<View style={styles.balanceRow}>
						<View>
							<Text
								size="xs"
								variant="secondary"
								weight="medium"
							>
								Баланс за месяц
							</Text>
							<Text
								size="3xl"
								weight="bold"
								style={{ marginTop: 4 }}
							>
								{monthTotals.balance >= 0 ? '+' : '-'}
								{Math.abs(monthTotals.balance).toLocaleString('ru-RU')} {symbol}
							</Text>
						</View>

						{/* Процент */}
						<View
							style={[
								styles.percentBadge,
								{
									backgroundColor: balanceColor + '22',
									borderColor: balanceColor + '44'
								}
							]}
						>
							<Text
								size="sm"
								weight="semibold"
								style={{ color: balanceColor }}
							>
								{expensePercent}%
							</Text>
							<Text
								size="xs"
								style={{ color: balanceColor }}
							>
								расходов
							</Text>
						</View>
					</View>

					{/* Прогресс-бар баланса */}
					<View
						style={[styles.progressTrack, { backgroundColor: colors.border }]}
					>
						<View
							style={[
								styles.progressFill,
								{
									width: `${Math.min(expensePercent, 100)}%`,
									backgroundColor:
										expensePercent > 90
											? colors.danger
											: expensePercent > 70
												? '#f59e0b'
												: colors.success
								}
							]}
						/>
					</View>
				</Card>

				{/* ── Последние транзакции ───────────────────────────────────────── */}
				<View style={styles.sectionHeader}>
					<Text
						size="lg"
						weight="semibold"
					>
						Последние транзакции
					</Text>
					<TouchableOpacity
						onPress={() => router.push('/(tabs)/transactions')}
						activeOpacity={0.7}
					>
						<Text
							size="sm"
							variant="accent"
							weight="medium"
						>
							Все →
						</Text>
					</TouchableOpacity>
				</View>

				{recentTransactions.length === 0 ? (
					<Card style={styles.emptyCard}>
						<Ionicons
							name="wallet-outline"
							size={36}
							color={colors.textSecondary}
						/>
						<Text
							size="sm"
							variant="secondary"
							style={{ marginTop: 10, textAlign: 'center' }}
						>
							{' '}
							Транзакций пока нет.{'\n'}Нажмите + чтобы добавить первую.
						</Text>
					</Card>
				) : (
					recentTransactions.map(t => (
						<TransactionItem
							key={t.id}
							transaction={t}
							onDelete={handleDelete}
						/>
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
	summaryGrid: {
		flexDirection: 'row',
		gap: 12
	},
	summaryCard: {
		flex: 1,
		gap: 4
	},
	summaryIcon: {
		marginBottom: 4
	},
	balanceRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 14
	},
	percentBadge: {
		borderRadius: 10,
		borderWidth: 1,
		paddingVertical: 8,
		paddingHorizontal: 12,
		alignItems: 'center'
	},
	progressTrack: {
		height: 4,
		borderRadius: 2,
		overflow: 'hidden'
	},
	progressFill: {
		height: 4,
		borderRadius: 2
	},
	sectionHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginTop: 8
	},
	emptyCard: {
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 36
	}
})
