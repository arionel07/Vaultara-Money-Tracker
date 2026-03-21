import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { Input } from '@/components/Input'
import { Text } from '@/components/Text'
import { useTheme } from '@/hooks/useTheme.hook'
import { useCategoryStore } from '@/stores/categoryStore.store'
import { useSettingsStore } from '@/stores/settingsStore.store'
import { useTransactionStore } from '@/stores/transactionStore.store'
import {
	Currency,
	CURRENCY_LABELS,
	CURRENCY_SYMBOLS,
	TransactionType
} from '@/types/index.type'
import { Ionicons } from '@expo/vector-icons'
import { format } from 'date-fns'
import { router } from 'expo-router'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
	Alert,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StyleSheet,
	TouchableOpacity,
	View
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

// ── Все доступные валюты ──────────────────────────────────────────────────────
const CURRENCIES: Currency[] = ['MDL', 'RUB', 'USD', 'EUR', 'TRY']

export default function AddTransactionModal() {
	const { colors } = useTheme()
	const insets = useSafeAreaInsets()

	// ── Сторы ─────────────────────────────────────────────────────────────────
	const addTransaction = useTransactionStore(s => s.addTransaction)
	const defaultCurrency = useSettingsStore(s => s.defaultCurrency)
	const expenseCategories = useCategoryStore(s => s.expenseCategories)
	const incomeCategories = useCategoryStore(s => s.incomeCategories)
	const loadCategories = useCategoryStore(s => s.loadCategories)

	// ── Форма ─────────────────────────────────────────────────────────────────
	const [type, setType] = useState<TransactionType>('expense')
	const [amount, setAmount] = useState('')
	const [categoryId, setCategoryId] = useState<number | null>(null)
	const [note, setNote] = useState('')
	const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))

	// ── Калькулятор курса ─────────────────────────────────────────────────────
	const [showCalc, setShowCalc] = useState(false)
	const [calcCurrency, setCalcCurrency] = useState<Currency>('RUB')
	const [calcAmount, setCalcAmount] = useState('')
	const [calcRate, setCalcRate] = useState('')
	const [calcOp, setCalcOp] = useState<'multiply' | 'divide'>('divide')
	const [showCalcCurrencies, setShowCalcCurrencies] = useState(false)

	// ── Результат калькулятора ────────────────────────────────────────────────
	const calcResult = useMemo(() => {
		const a = parseFloat(calcAmount.replace(',', '.'))
		const r = parseFloat(calcRate.replace(',', '.'))
		if (isNaN(a) || isNaN(r) || r === 0) return null
		const result = calcOp === 'multiply' ? a * r : a / r
		return Math.round(result * 100) / 100
	}, [calcAmount, calcRate, calcOp])

	// ── Применить результат калькулятора ──────────────────────────────────────
	const applyCalcResult = useCallback(() => {
		if (calcResult === null) return
		setAmount(String(calcResult))
		setShowCalc(false)
		setCalcAmount('')
		setCalcRate('')
	}, [calcResult])

	// ── Панели выбора ─────────────────────────────────────────────────────────
	const [showCurrencies, setShowCurrencies] = useState(false)

	// ── Категории по типу ────────────────────────────────────────────────────

	// Сбрасываем категорию при смене типа

	const categories = useMemo(
		() => (type === 'expense' ? expenseCategories : incomeCategories),
		[type, expenseCategories, incomeCategories]
	)

	useEffect(() => {
		loadCategories()
	}, [])
	useEffect(() => {
		setCategoryId(categories[0]?.id ?? null)
	}, [type, categories])

	const isValid = useMemo(() => {
		const num = parseFloat(amount)
		return !isNaN(num) && num > 0 && categoryId !== null
	}, [amount, categoryId])

	const handleSave = useCallback(() => {
		const num = parseFloat(amount)
		if (isNaN(num) || num <= 0) {
			Alert.alert('Ошибка', 'Введите корректную сумму')
			return
		}
		if (!categoryId) {
			Alert.alert('Ошибка', 'Выберите категорию')
			return
		}
		addTransaction({
			type,
			amount: num,
			currency: defaultCurrency,
			categoryId,
			note: note.trim() || undefined,
			date
		})
		router.dismiss()
	}, [amount, type, defaultCurrency, categoryId, note, date, addTransaction])

	const handleAmountChange = useCallback((text: string) => {
		setAmount(text.replace(',', '.').replace(/[^0-9.]/g, ''))
	}, [])

	const handleCalcAmountChange = useCallback((text: string) => {
		setCalcAmount(text.replace(',', '.').replace(/[^0-9.]/g, ''))
	}, [])

	const handleCalcRateChange = useCallback((text: string) => {
		setCalcRate(text.replace(',', '.').replace(/[^0-9.]/g, ''))
	}, [])

	return (
		<KeyboardAvoidingView
			style={[styles.root, { backgroundColor: colors.bgPrimary }]}
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
		>
			{/* ── Шапка ────────────────────────────────────────────────────────── */}
			<View
				style={[
					styles.header,
					{
						paddingTop: insets.top + 16,
						borderBottomColor: colors.border
					}
				]}
			>
				<TouchableOpacity
					onPress={() => router.dismiss()}
					activeOpacity={0.7}
					style={styles.closeBtn}
				>
					<Ionicons
						name="close"
						size={22}
						color={colors.textPrimary}
					/>
				</TouchableOpacity>

				<Text
					size="lg"
					weight="semibold"
				>
					Новая транзакция
				</Text>

				<Button
					label="Сохранить"
					onPress={handleSave}
					disabled={!isValid}
					size="sm"
					style={{ minWidth: 88 }}
				/>
			</View>

			<ScrollView
				contentContainerStyle={[
					styles.scroll,
					{ paddingBottom: insets.bottom + 32 }
				]}
				keyboardShouldPersistTaps="handled"
				showsVerticalScrollIndicator={false}
			>
				{/* ── Тип транзакции ─────────────────────────────────────────────── */}
				<View style={styles.typeRow}>
					{(['expense', 'income'] as TransactionType[]).map(t => (
						<TouchableOpacity
							key={t}
							onPress={() => setType(t)}
							activeOpacity={0.8}
							style={[
								styles.typeBtn,
								{
									backgroundColor:
										type === t
											? (t === 'expense' ? colors.danger : colors.success) +
												'22'
											: colors.bgElevated,
									borderColor:
										type === t
											? t === 'expense'
												? colors.danger
												: colors.success
											: colors.border
								}
							]}
						>
							<Ionicons
								name={
									t === 'expense'
										? 'arrow-up-circle-outline'
										: 'arrow-down-circle-outline'
								}
								size={18}
								color={
									type === t
										? t === 'expense'
											? colors.danger
											: colors.success
										: colors.textSecondary
								}
							/>
							<Text
								size="sm"
								weight="semibold"
								style={{
									marginLeft: 6,
									color:
										type === t
											? t === 'expense'
												? colors.danger
												: colors.success
											: colors.textSecondary
								}}
							>
								{t === 'expense' ? 'Расход' : 'Доход'}
							</Text>
						</TouchableOpacity>
					))}
				</View>

				{/* ── Сумма ──────────────────────────────────────────────────────── */}
				<Card
					elevated
					style={{ gap: 10 }}
				>
					<View style={styles.amountHeader}>
						<Text
							size="xs"
							variant="secondary"
							weight="medium"
						>
							СУММА
						</Text>
						{/* Кнопка калькулятора курса */}
						<TouchableOpacity
							onPress={() => setShowCalc(v => !v)}
							activeOpacity={0.7}
							style={[
								styles.calcToggle,
								{
									backgroundColor: showCalc
										? colors.accent + '22'
										: colors.bgSecondary,
									borderColor: showCalc ? colors.accent : colors.border
								}
							]}
						>
							<Ionicons
								name="calculator-outline"
								size={14}
								color={showCalc ? colors.accent : colors.textSecondary}
							/>
							<Text
								size="xs"
								weight="medium"
								style={{
									color: showCalc ? colors.accent : colors.textSecondary,
									marginLeft: 4
								}}
							>
								Курс
							</Text>
						</TouchableOpacity>
					</View>

					{/* Поле суммы в основной валюте */}
					<View style={styles.amountRow}>
						<View
							style={[
								styles.currencyBadge,
								{
									backgroundColor: colors.bgSecondary,
									borderColor: colors.border
								}
							]}
						>
							<Text
								size="lg"
								weight="bold"
							>
								{CURRENCY_SYMBOLS[defaultCurrency]}
							</Text>
						</View>
						<Input
							value={amount}
							onChangeText={handleAmountChange}
							placeholder="0.00"
							keyboardType="decimal-pad"
							style={{ flex: 1, marginLeft: 10 }}
						/>
					</View>

					{/* ── Мини-калькулятор курса ──────────────────────────────────── */}
					{showCalc && (
						<View
							style={[
								styles.calcBox,
								{
									backgroundColor: colors.bgSecondary,
									borderColor: colors.border
								}
							]}
						>
							<Text
								size="xs"
								variant="secondary"
								weight="medium"
								style={{ marginBottom: 10 }}
							>
								КОНВЕРТЕР КУРСА
							</Text>

							{/* Выбор валюты */}
							<TouchableOpacity
								onPress={() => setShowCalcCurrencies(v => !v)}
								activeOpacity={0.7}
								style={[
									styles.calcCurrencyBtn,
									{
										backgroundColor: colors.bgElevated,
										borderColor: colors.border
									}
								]}
							>
								<Text
									size="sm"
									weight="bold"
								>
									{CURRENCY_SYMBOLS[calcCurrency]} {calcCurrency}
								</Text>
								<Ionicons
									name={showCalcCurrencies ? 'chevron-up' : 'chevron-down'}
									size={14}
									color={colors.textSecondary}
								/>
							</TouchableOpacity>

							{/* Список валют калькулятора */}
							{showCalcCurrencies && (
								<View
									style={[
										styles.calcCurrencyList,
										{
											backgroundColor: colors.bgElevated,
											borderColor: colors.border
										}
									]}
								>
									{CURRENCIES.filter(c => c !== defaultCurrency).map(c => (
										<TouchableOpacity
											key={c}
											onPress={() => {
												setCalcCurrency(c)
												setShowCalcCurrencies(false)
											}}
											activeOpacity={0.7}
											style={[
												styles.calcCurrencyItem,
												{
													backgroundColor:
														c === calcCurrency
															? colors.accent + '22'
															: 'transparent',
													borderBottomColor: colors.border
												}
											]}
										>
											<Text
												size="sm"
												weight="bold"
												style={{
													width: 24,
													color:
														c === calcCurrency
															? colors.accent
															: colors.textPrimary
												}}
											>
												{CURRENCY_SYMBOLS[c]}
											</Text>
											<Text
												size="sm"
												style={{
													color:
														c === calcCurrency
															? colors.accent
															: colors.textSecondary
												}}
											>
												{CURRENCY_LABELS[c]}
											</Text>
										</TouchableOpacity>
									))}
								</View>
							)}

							{/* Сумма в исходной валюте */}
							<Input
								label={`Сумма в ${calcCurrency}`}
								value={calcAmount}
								onChangeText={handleCalcAmountChange}
								placeholder="0.00"
								keyboardType="decimal-pad"
								leftIcon="cash-outline"
								style={{ marginTop: 10 }}
							/>

							{/* Операция × или ÷ */}
							<View style={styles.calcOpRow}>
								{(['divide', 'multiply'] as const).map(op => (
									<TouchableOpacity
										key={op}
										onPress={() => setCalcOp(op)}
										activeOpacity={0.7}
										style={[
											styles.calcOpBtn,
											{
												backgroundColor:
													calcOp === op
														? colors.accent + '22'
														: colors.bgElevated,
												borderColor:
													calcOp === op ? colors.accent : colors.border
											}
										]}
									>
										<Text
											size="lg"
											weight="bold"
											style={{
												color:
													calcOp === op ? colors.accent : colors.textSecondary
											}}
										>
											{op === 'multiply' ? '×' : '÷'}
										</Text>
									</TouchableOpacity>
								))}
							</View>

							{/* Курс */}
							<Input
								label={`Курс (1 ${calcCurrency} = ? ${defaultCurrency})`}
								value={calcRate}
								onChangeText={handleCalcRateChange}
								placeholder="0.00"
								keyboardType="decimal-pad"
								leftIcon="trending-up-outline"
								style={{ marginTop: 10 }}
							/>

							{/* Результат */}
							{calcResult !== null && (
								<TouchableOpacity
									onPress={applyCalcResult}
									activeOpacity={0.8}
									style={[
										styles.calcResult,
										{
											backgroundColor: colors.accent + '22',
											borderColor: colors.accent
										}
									]}
								>
									<View>
										<Text
											size="xs"
											variant="secondary"
											weight="medium"
										>
											РЕЗУЛЬТАТ — нажмите чтобы применить
										</Text>
										<Text
											size="xl"
											weight="bold"
											style={{ color: colors.accent, marginTop: 2 }}
										>
											{CURRENCY_SYMBOLS[defaultCurrency]}
											{calcResult.toLocaleString('ru-RU')}
										</Text>
									</View>
									<Ionicons
										name="checkmark-circle"
										size={28}
										color={colors.accent}
									/>
								</TouchableOpacity>
							)}
						</View>
					)}
				</Card>

				{/* ── Категории ──────────────────────────────────────────────────── */}
				<View>
					<View style={styles.sectionHeader}>
						<Text
							size="sm"
							variant="secondary"
							weight="medium"
						>
							КАТЕГОРИЯ
						</Text>
						<TouchableOpacity
							onPress={() => router.push('/modals/add-category')}
							activeOpacity={0.7}
						>
							<Text
								size="sm"
								variant="accent"
								weight="medium"
							>
								+ Новая
							</Text>
						</TouchableOpacity>
					</View>

					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						contentContainerStyle={styles.categoriesScroll}
					>
						{categories.map(cat => {
							const selected = cat.id === categoryId
							return (
								<TouchableOpacity
									key={cat.id}
									onPress={() => setCategoryId(cat.id)}
									activeOpacity={0.75}
									style={[
										styles.categoryChip,
										{
											backgroundColor: selected
												? cat.color + '22'
												: colors.bgElevated,
											borderColor: selected ? cat.color : colors.border
										}
									]}
								>
									<Ionicons
										name={cat.icon as keyof typeof Ionicons.glyphMap}
										size={16}
										color={selected ? cat.color : colors.textSecondary}
									/>
									<Text
										size="sm"
										weight={selected ? 'semibold' : 'regular'}
										style={{
											color: selected ? cat.color : colors.textSecondary,
											marginLeft: 6
										}}
									>
										{cat.name}
									</Text>
								</TouchableOpacity>
							)
						})}
					</ScrollView>
				</View>

				{/* ── Дата ───────────────────────────────────────────────────────── */}
				<Card elevated>
					<Text
						size="xs"
						variant="secondary"
						weight="medium"
					>
						ДАТА
					</Text>
					<View style={styles.dateRow}>
						{(['today', 'yesterday'] as const).map(d => {
							const today = format(new Date(), 'yyyy-MM-dd')
							const yesterday = format(
								new Date(Date.now() - 86400000),
								'yyyy-MM-dd'
							)
							const isActive =
								d === 'today' ? date === today : date === yesterday
							return (
								<TouchableOpacity
									key={d}
									onPress={() => setDate(d === 'today' ? today : yesterday)}
									activeOpacity={0.7}
									style={[
										styles.dateBtn,
										{
											backgroundColor: isActive
												? colors.accent + '22'
												: colors.bgSecondary,
											borderColor: isActive ? colors.accent : colors.border
										}
									]}
								>
									<Text
										size="sm"
										style={{
											color: isActive ? colors.accent : colors.textSecondary
										}}
									>
										{d === 'today' ? 'Сегодня' : 'Вчера'}
									</Text>
								</TouchableOpacity>
							)
						})}
					</View>
				</Card>

				{/* ── Заметка ────────────────────────────────────────────────────── */}
				<Input
					label="Заметка (необязательно)"
					value={note}
					onChangeText={setNote}
					placeholder="Например: обед с коллегами"
					leftIcon="create-outline"
					maxLength={120}
				/>

				<Button
					label={type === 'expense' ? 'Добавить расход' : 'Добавить доход'}
					onPress={handleSave}
					disabled={!isValid}
					size="lg"
					style={{ marginTop: 8 }}
				/>
			</ScrollView>
		</KeyboardAvoidingView>
	)
}

const styles = StyleSheet.create({
	root: { flex: 1 },
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
		paddingBottom: 14,
		borderBottomWidth: 1
	},
	closeBtn: {
		width: 36,
		height: 36,
		alignItems: 'center',
		justifyContent: 'center'
	},
	scroll: { padding: 16, gap: 16 },
	typeRow: { flexDirection: 'row', gap: 10 },
	typeBtn: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		height: 44,
		borderRadius: 10,
		borderWidth: 1
	},
	amountHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between'
	},
	calcToggle: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 10,
		paddingVertical: 5,
		borderRadius: 6,
		borderWidth: 1
	},
	amountRow: { flexDirection: 'row', alignItems: 'center' },
	currencyBadge: {
		paddingHorizontal: 14,
		height: 44,
		borderRadius: 8,
		borderWidth: 1,
		alignItems: 'center',
		justifyContent: 'center'
	},
	calcBox: {
		borderRadius: 10,
		borderWidth: 1,
		padding: 14,
		marginTop: 4
	},
	calcCurrencyBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 12,
		paddingVertical: 10,
		borderRadius: 8,
		borderWidth: 1
	},
	calcCurrencyList: {
		borderRadius: 8,
		borderWidth: 1,
		overflow: 'hidden',
		marginTop: 6
	},
	calcCurrencyItem: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 10,
		paddingHorizontal: 12,
		borderBottomWidth: 1,
		gap: 10
	},
	calcOpRow: {
		flexDirection: 'row',
		gap: 10,
		marginTop: 10
	},
	calcOpBtn: {
		flex: 1,
		alignItems: 'center',
		paddingVertical: 10,
		borderRadius: 8,
		borderWidth: 1
	},
	calcResult: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		borderRadius: 10,
		borderWidth: 1,
		padding: 14,
		marginTop: 10
	},
	sectionHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 10
	},
	categoriesScroll: { gap: 8, paddingBottom: 4 },
	categoryChip: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 14,
		paddingVertical: 9,
		borderRadius: 20,
		borderWidth: 1
	},
	dateRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
	dateBtn: {
		flex: 1,
		alignItems: 'center',
		paddingVertical: 9,
		borderRadius: 8,
		borderWidth: 1
	}
})
