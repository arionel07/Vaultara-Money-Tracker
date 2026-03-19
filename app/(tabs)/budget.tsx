import { Card } from '@/components/Card'
import { MonthNavigator } from '@/components/MonthNavigator'
import { Text } from '@/components/Text'
import { useTheme } from '@/hooks/useTheme.hook'
import { useBudgetStore } from '@/stores/budgetStore.store'
import { useSettingsStore } from '@/stores/settingsStore.store'
import { useTransactionStore } from '@/stores/transactionStore.store'
import { Budget, CURRENCY_SYMBOLS } from '@/types/index.type'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useCallback, useEffect, useMemo } from 'react'
import {
	Alert,
	RefreshControl,
	ScrollView,
	StyleSheet,
	TouchableOpacity,
	View
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function BudgetScreen() {
	const { colors } = useTheme()
	const insets = useSafeAreaInsets()

	// ── Сторы ─────────────────────────────────────────────────────────────────
	const { budgets, isLoading, loadBudgets, removeBudget } = useBudgetStore()

	const { selectedYear, selectedMonth, goToPrevMonth, goToNextMonth } =
		useTransactionStore()

	const defaultCurrency = useSettingsStore(s => s.defaultCurrency)
	const symbol = CURRENCY_SYMBOLS[defaultCurrency]

	// ── Загрузка бюджетов ─────────────────────────────────────────────────────
	useEffect(() => {
		loadBudgets(selectedYear, selectedMonth)
	}, [selectedYear, selectedMonth])

	const onRefresh = useCallback(() => {
		loadBudgets(selectedYear, selectedMonth)
	}, [selectedYear, selectedMonth])

	// ── Общая сводка бюджетов ─────────────────────────────────────────────────
	const summary = useMemo(() => {
		const totalLimit = budgets.reduce((s, b) => s + b.limitAmount, 0)
		const totalSpent = budgets.reduce((s, b) => s + b.spentAmount, 0)
		const remaining = totalLimit - totalSpent
		const percent =
			totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0

		return { totalLimit, totalSpent, remaining, percent }
	}, [budgets])

	// ── Цвет прогресс-бара ────────────────────────────────────────────────────
	const progressColor = useCallback(
		(percent: number): string => {
			if (percent >= 90) return colors.danger
			if (percent >= 70) return '#f59e0b'
			return colors.success
		},
		[colors]
	)

	// ── Удаление бюджета ──────────────────────────────────────────────────────
	const handleDelete = useCallback(
		(budget: Budget) => {
			Alert.alert(
				'Удалить бюджет',
				`Удалить лимит для категории «${budget.categoryName}»?`,
				[
					{ text: 'Отмена', style: 'cancel' },
					{
						text: 'Удалить',
						style: 'destructive',
						onPress: () => removeBudget(budget.id, selectedYear, selectedMonth)
					}
				]
			)
		},
		[removeBudget, selectedYear, selectedMonth]
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
							Бюджет
						</Text>
					</View>

					<TouchableOpacity
						onPress={() => router.push('/modals/add-budget')}
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

				{/* ── Общая сводка ──────────────────────────────────────────────── */}
				{budgets.length > 0 && (
					<Card elevated>
						<Text
							size="xs"
							variant="secondary"
							weight="medium"
						>
							ОБЩИЙ БЮДЖЕТ
						</Text>

						<View style={styles.summaryRow}>
							<View style={{ flex: 1 }}>
								<Text
									size="2xl"
									weight="bold"
								>
									{summary.totalSpent.toLocaleString('ru-RU')} {symbol}
								</Text>
								<Text
									size="xs"
									variant="secondary"
								>
									из {summary.totalLimit.toLocaleString('ru-RU')} {symbol}
								</Text>
							</View>

							{/* Круговой процент */}
							<View
								style={[
									styles.percentCircle,
									{
										borderColor: progressColor(summary.percent),
										backgroundColor: progressColor(summary.percent) + '22'
									}
								]}
							>
								<Text
									size="lg"
									weight="bold"
									style={{ color: progressColor(summary.percent) }}
								>
									{summary.percent}%
								</Text>
							</View>
						</View>

						{/* Общий прогресс-бар */}
						<View style={[styles.track, { backgroundColor: colors.border }]}>
							<View
								style={[
									styles.fill,
									{
										width: `${Math.min(summary.percent, 100)}%`,
										backgroundColor: progressColor(summary.percent)
									}
								]}
							/>
						</View>

						<Text
							size="xs"
							variant="secondary"
							style={{ marginTop: 6 }}
						>
							Осталось:{' '}
							<Text
								size="xs"
								weight="semibold"
								style={{
									color: summary.remaining >= 0 ? colors.success : colors.danger
								}}
							>
								{Math.abs(summary.remaining).toLocaleString('ru-RU')} {symbol}{' '}
								{summary.remaining < 0 ? ' перерасход' : ''}
							</Text>
						</Text>
					</Card>
				)}

				{/* ── Список бюджетов по категориям ─────────────────────────────── */}
				<Text
					size="sm"
					variant="secondary"
					weight="medium"
				>
					ПО КАТЕГОРИЯМ
				</Text>

				{budgets.length === 0 ? (
					<Card style={styles.emptyCard}>
						<Ionicons
							name="pie-chart-outline"
							size={36}
							color={colors.textSecondary}
						/>
						<Text
							size="sm"
							variant="secondary"
							style={{ marginTop: 10, textAlign: 'center' }}
						>
							Бюджеты не установлены.{'\n'}
							Нажмите + чтобы добавить лимит.
						</Text>
						<TouchableOpacity
							onPress={() => router.push('/modals/add-budget')}
							activeOpacity={0.7}
							style={{ marginTop: 12 }}
						>
							<Text
								size="sm"
								variant="accent"
								weight="medium"
							>
								+ Установить бюджет
							</Text>
						</TouchableOpacity>
					</Card>
				) : (
					budgets.map(budget => {
						const pct =
							budget.limitAmount > 0
								? Math.round((budget.spentAmount / budget.limitAmount) * 100)
								: 0
						const color = progressColor(pct)
						const left = budget.limitAmount - budget.spentAmount

						return (
							<Card
								key={budget.id}
								style={{ gap: 10 }}
							>
								{/* Строка: иконка + название + удалить */}
								<View style={styles.budgetHeader}>
									<View
										style={[
											styles.categoryIcon,
											{ backgroundColor: budget.categoryColor + '22' }
										]}
									>
										<Ionicons
											name={
												budget.categoryIcon as keyof typeof Ionicons.glyphMap
											}
											size={18}
											color={budget.categoryColor}
										/>
									</View>

									<View style={{ flex: 1 }}>
										<Text
											size="sm"
											weight="semibold"
										>
											{budget.categoryName}
										</Text>
										<Text
											size="xs"
											variant="secondary"
										>
											{CURRENCY_SYMBOLS[budget.currency]}
											{budget.spentAmount.toLocaleString('ru-RU')} из{' '}
											{CURRENCY_SYMBOLS[budget.currency]}
											{budget.limitAmount.toLocaleString('ru-RU')}
										</Text>
									</View>

									{/* Процент */}
									<View
										style={[
											styles.pctBadge,
											{
												backgroundColor: color + '22',
												borderColor: color + '55'
											}
										]}
									>
										<Text
											size="xs"
											weight="semibold"
											style={{ color }}
										>
											{pct}%
										</Text>
									</View>

									{/* Удалить */}
									<TouchableOpacity
										onPress={() => handleDelete(budget)}
										activeOpacity={0.7}
										style={{ marginLeft: 8, padding: 4 }}
									>
										<Ionicons
											name="trash-outline"
											size={16}
											color={colors.textSecondary}
										/>
									</TouchableOpacity>
								</View>

								{/* Прогресс-бар */}
								<View
									style={[styles.track, { backgroundColor: colors.border }]}
								>
									<View
										style={[
											styles.fill,
											{
												width: `${Math.min(pct, 100)}%`,
												backgroundColor: color
											}
										]}
									/>
								</View>

								{/* Остаток */}
								<Text
									size="xs"
									variant="secondary"
								>
									{left >= 0
										? `Осталось: ${CURRENCY_SYMBOLS[budget.currency]}${left.toLocaleString('ru-RU')}`
										: `Перерасход: ${CURRENCY_SYMBOLS[budget.currency]}${Math.abs(left).toLocaleString('ru-RU')}`}
								</Text>
							</Card>
						)
					})
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
	backBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 2,
		marginBottom: 4,
		paddingVertical: 4
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
		alignItems: 'center',
		justifyContent: 'space-between',
		marginVertical: 10
	},
	percentCircle: {
		width: 64,
		height: 64,
		borderRadius: 32,
		borderWidth: 2,
		alignItems: 'center',
		justifyContent: 'center'
	},
	track: {
		height: 6,
		borderRadius: 3,
		overflow: 'hidden'
	},
	fill: {
		height: 6,
		borderRadius: 3
	},
	emptyCard: {
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 40
	},
	budgetHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10
	},
	categoryIcon: {
		width: 40,
		height: 40,
		borderRadius: 10,
		alignItems: 'center',
		justifyContent: 'center'
	},
	pctBadge: {
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 6,
		borderWidth: 1
	}
})
