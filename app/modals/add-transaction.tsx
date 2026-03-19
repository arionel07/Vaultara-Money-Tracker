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
import { ru } from 'date-fns/locale'
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

	// ── Локальный стейт формы ─────────────────────────────────────────────────
	const [type, setType] = useState<TransactionType>('expense')
	const [amount, setAmount] = useState('')
	const [currency, setCurrency] = useState<Currency>(defaultCurrency)
	const [categoryId, setCategoryId] = useState<number | null>(null)
	const [note, setNote] = useState('')
	const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))

	// ── Панели выбора ─────────────────────────────────────────────────────────
	const [showCurrencies, setShowCurrencies] = useState(false)

	// ── Категории по типу ─────────────────────────────────────────────────────
	const categories = useMemo(
		() => (type === 'expense' ? expenseCategories : incomeCategories),
		[type, expenseCategories, incomeCategories]
	)

	// Сбрасываем категорию при смене типа

	useEffect(() => setCategoryId(categories[0].id ?? null), [type, categories])
	useEffect(() => {
		loadCategories()
	}, [])

	// ── Валидация ─────────────────────────────────────────────────────────────
	const isValid = useMemo(() => {
		const num = parseFloat(amount)
		return !isNaN(num) && num > 0 && categoryId !== null
	}, [amount, categoryId])

	// ── Сохранение транзакции ─────────────────────────────────────────────────
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
			currency,
			categoryId,
			note: note.trim() || undefined,
			date
		})

		router.dismiss()
	}, [amount, type, currency, categoryId, note, date, addTransaction])

	// ── Форматирование суммы при вводе ────────────────────────────────────────
	const handleAmountChange = useCallback((text: string) => {
		// Заменяем запятую на точку сразу при вводе
		const cleaned = text.replace(',', '.').replace(/[^0-9.]/g, '')
		setAmount(cleaned)
	}, [])

	return (
		<KeyboardAvoidingView
			style={[styles.root, { backgroundColor: colors.bgPrimary }]}
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
		>
			{/* ── Шапка модала ─────────────────────────────────────────────────── */}

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
				{/* ── Тип транзакции ────────────────────────────────────────────── */}
				<View style={styles.typeRow}>
					{/* Кнопка выбора валюты */}
					<TouchableOpacity
						onPress={() => setType('expense')}
						activeOpacity={0.8}
						style={[
							styles.typeBtn,
							{
								backgroundColor:
									type === 'expense' ? colors.danger + '22' : colors.bgElevated,
								borderColor: type === 'expense' ? colors.danger : colors.border
							}
						]}
					>
						<Ionicons
							name="arrow-up-circle-outline"
							size={18}
							color={type === 'expense' ? colors.danger : colors.textSecondary}
						/>
						<Text
							size="sm"
							weight="semibold"
							style={{
								color:
									type === 'expense' ? colors.danger : colors.textSecondary,
								marginLeft: 6
							}}
						>
							Расход
						</Text>
					</TouchableOpacity>

					<TouchableOpacity
						onPress={() => setType('income')}
						activeOpacity={0.8}
						style={[
							styles.typeBtn,
							{
								backgroundColor:
									type === 'income' ? colors.success + '22' : colors.bgElevated,
								borderColor: type === 'income' ? colors.success : colors.border
							}
						]}
					>
						<Ionicons
							name="arrow-down-circle-outline"
							size={18}
							color={type === 'income' ? colors.success : colors.textSecondary}
						/>
						<Text
							size="sm"
							weight="semibold"
							style={{
								color:
									type === 'income' ? colors.success : colors.textSecondary,
								marginLeft: 6
							}}
						>
							Доход
						</Text>
					</TouchableOpacity>
				</View>

				{/* ── Сумма + валюта ────────────────────────────────────────────── */}
				<Card
					elevated
					style={styles.amountCard}
				>
					<Text
						size="xs"
						variant="secondary"
						weight="medium"
					>
						СУММА
					</Text>
					<View style={styles.amountRow}>
						<TouchableOpacity
							onPress={() => setShowCurrencies(v => !v)}
							activeOpacity={0.7}
							style={[
								styles.currencyBtn,
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
								{CURRENCY_SYMBOLS[currency]}
							</Text>
							<Ionicons
								name={showCurrencies ? 'chevron-up' : 'chevron-down'}
								size={14}
								color={colors.textSecondary}
								style={{ marginLeft: 4 }}
							/>
						</TouchableOpacity>

						{/* Поле суммы */}
						<Input
							value={amount}
							onChangeText={handleAmountChange}
							placeholder="0.00"
							keyboardType="decimal-pad"
							style={{ flex: 1, marginLeft: 10 }}
						/>
					</View>

					{/* Список валют */}
					{showCurrencies && (
						<View
							style={[
								styles.currencyList,
								{
									backgroundColor: colors.bgSecondary,
									borderColor: colors.border
								}
							]}
						>
							{CURRENCIES.map(c => (
								<TouchableOpacity
									key={c}
									onPress={() => {
										setCurrency(c)
										setShowCurrencies(false)
									}}
									activeOpacity={0.7}
									style={[
										styles.currencyItem,
										{
											backgroundColor:
												c === currency ? colors.accent + '22' : 'transparent',
											borderBottomColor: colors.border
										}
									]}
								>
									<Text
										size="lg"
										weight="bold"
										style={{
											width: 28,
											color: c === currency ? colors.accent : colors.textPrimary
										}}
									>
										{CURRENCY_SYMBOLS[c]}
									</Text>
									<Text
										size="sm"
										style={{
											color:
												c === currency ? colors.accent : colors.textSecondary
										}}
									>
										{CURRENCY_LABELS[c]}
									</Text>
									{c === currency && (
										<Ionicons
											name="checkmark"
											size={16}
											color={colors.accent}
											style={{ marginLeft: 'auto' }}
										/>
									)}
								</TouchableOpacity>
							))}
						</View>
					)}
				</Card>

				{/* ── Категории ────────────────────────────────────────────────── */}
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
							activeOpacity={0.7}
							onPress={() => router.push('/modals/add-category')}
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

				{/* ── Дата ─────────────────────────────────────────────────────── */}
				<Card elevated>
					<Text
						size="xs"
						variant="secondary"
						weight="medium"
					>
						ДАТА
					</Text>
					<View style={styles.dateRow}>
						{/* Кнопка вчера */}
						{['yesterday', 'today', 'custom'].map(d => {
							const today = format(new Date(), 'yyyy-MM-dd')
							const yesterday = format(
								new Date(Date.now() - 86400000),
								'yyyy-MM-dd'
							)
							const isToday = date === today
							const isYesterday = date === yesterday
							const isActive =
								d === 'today'
									? isToday
									: d === 'yesterday'
										? isYesterday
										: !isToday && !isYesterday
							return (
								<TouchableOpacity
									key={d}
									onPress={() => {
										if (d === 'today') setDate(today)
										if (d === 'yesterday') setDate(yesterday)
									}}
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
										{d === 'today'
											? 'Сегодня'
											: d === 'yesterday'
												? 'Вчера'
												: format(new Date(date), 'd MMM', { locale: ru })}
									</Text>
								</TouchableOpacity>
							)
						})}
					</View>
				</Card>

				{/* ── Заметка ──────────────────────────────────────────────────── */}
				<Input
					label="Заметка (необязательно)"
					value={note}
					onChangeText={setNote}
					placeholder="Например: обед с коллегами"
					leftIcon="create-outline"
					maxLength={120}
				/>

				{/* ── Кнопка сохранить (внизу) ─────────────────────────────────── */}
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
	root: {
		flex: 1
	},
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
	scroll: {
		padding: 16,
		gap: 16
	},
	typeRow: {
		flexDirection: 'row',
		gap: 10
	},
	typeBtn: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		height: 44,
		borderRadius: 10,
		borderWidth: 1
	},
	amountCard: {
		gap: 10
	},
	amountRow: {
		flexDirection: 'row',
		alignItems: 'center'
	},
	currencyBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 12,
		height: 44,
		borderRadius: 8,
		borderWidth: 1
	},
	currencyList: {
		borderRadius: 8,
		borderWidth: 1,
		overflow: 'hidden',
		marginTop: 4
	},
	currencyItem: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 12,
		paddingHorizontal: 14,
		borderBottomWidth: 1,
		gap: 10
	},
	sectionHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 10
	},
	categoriesScroll: {
		gap: 8,
		paddingBottom: 4
	},
	categoryChip: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 14,
		paddingVertical: 9,
		borderRadius: 20,
		borderWidth: 1
	},
	dateRow: {
		flexDirection: 'row',
		gap: 8,
		marginTop: 8
	},
	dateBtn: {
		flex: 1,
		alignItems: 'center',
		paddingVertical: 9,
		borderRadius: 8,
		borderWidth: 1
	}
})
