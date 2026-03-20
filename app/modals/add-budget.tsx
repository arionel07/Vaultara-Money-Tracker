import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { Input } from '@/components/Input'
import { Text } from '@/components/Text'
import { useTheme } from '@/hooks/useTheme.hook'
import { useBudgetStore } from '@/stores/budgetStore.store'
import { useCategoryStore } from '@/stores/categoryStore.store'
import { useSettingsStore } from '@/stores/settingsStore.store'
import { useTransactionStore } from '@/stores/transactionStore.store'
import { Currency, CURRENCY_LABELS, CURRENCY_SYMBOLS } from '@/types/index.type'
import { Ionicons } from '@expo/vector-icons'
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

const CURRENCIES: Currency[] = ['MDL', 'RUB', 'USD', 'EUR', 'TRY']

export default function AddBudgetModal() {
	const { colors } = useTheme()
	const insets = useSafeAreaInsets()

	// ── Сторы ─────────────────────────────────────────────────────────────────

	const saveBudget = useBudgetStore(s => s.saveBudget)
	const loadCategories = useCategoryStore(s => s.loadCategories)
	const expenseCategories = useCategoryStore(s => s.expenseCategories)
	const defaultCurrency = useSettingsStore(s => s.defaultCurrency)
	const { selectedYear, selectedMonth } = useTransactionStore()

	// ── Локальный стейт ───────────────────────────────────────────────────────

	const [categoryId, setCategoryId] = useState<number | null>(null)
	const [amount, setAmount] = useState('')
	const [currency, setCurrency] = useState<Currency>(defaultCurrency)
	const [showCurrencies, setShowCurrencies] = useState(false)

	// ── Загрузка категорий ────────────────────────────────────────────────────
	useEffect(() => {
		loadCategories()
	}, [])

	// Дефолтная категория
	useEffect(() => {
		if (expenseCategories.length > 0 && categoryId === null) {
			setCategoryId(expenseCategories[0].id)
		}
	}, [expenseCategories])

	// ── Валидация ─────────────────────────────────────────────────────────────
	const isValid = useMemo(() => {
		const num = parseFloat(amount)
		return !isNaN(num) && num > 0 && categoryId !== null
	}, [amount, categoryId])

	// ── Сохранение ────────────────────────────────────────────────────────────
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

		saveBudget({
			categoryId,
			limitAmount: num,
			currency,
			month: selectedMonth,
			year: selectedYear
		})

		router.dismiss()
	}, [amount, categoryId, currency, selectedMonth, selectedYear, saveBudget])

	const handleAmountChange = useCallback((text: string) => {
		const cleaned = text.replace(',', '.').replace(/[^0-9.]/g, '')
		setAmount(cleaned)
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
					Новый бюджет
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
				{/* ── Лимит + валюта ────────────────────────────────────────────── */}

				<Card
					elevated
					style={{ gap: 10 }}
				>
					<Text
						size="xs"
						variant="secondary"
						weight="medium"
					>
						ЛИМИТ НА МЕСЯЦ
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

				{/* ── Категории расходов ────────────────────────────────────────── */}
				<View>
					<Text
						size="xs"
						variant="secondary"
						weight="medium"
						style={{ marginBottom: 10 }}
					>
						КАТЕГОРИЯ РАСХОДОВ
					</Text>

					<View style={styles.categoriesGrid}>
						{expenseCategories.map(cat => {
							const selected = cat.id === categoryId
							return (
								<TouchableOpacity
									key={cat.id}
									onPress={() => setCategoryId(cat.id)}
									activeOpacity={0.75}
									style={[
										styles.categoryCard,
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
										size={22}
										color={selected ? cat.color : colors.textSecondary}
									/>
									<Text
										size="xs"
										weight={selected ? 'semibold' : 'regular'}
										style={{
											color: selected ? cat.color : colors.textSecondary,
											marginTop: 6,
											textAlign: 'center'
										}}
										numberOfLines={1}
									>
										{cat.name}
									</Text>
									{selected && (
										<View
											style={[styles.checkmark, { backgroundColor: cat.color }]}
										>
											<Ionicons
												name="checkmark"
												size={10}
												color="#ffffff"
											/>
										</View>
									)}
								</TouchableOpacity>
							)
						})}
					</View>
				</View>

				{/* Период */}
				<Card>
					<Text
						size="xs"
						variant="secondary"
						weight="medium"
					>
						ПЕРИОД
					</Text>
					<Text
						size="base"
						weight="semibold"
						style={{ marginTop: 6 }}
					>
						{new Date(selectedYear, selectedMonth - 1).toLocaleDateString(
							'ru-RU',
							{
								month: 'long',
								year: 'numeric'
							}
						)}
					</Text>
					<Text
						size="xs"
						variant="secondary"
						style={{ marginTop: 2 }}
					>
						{' '}
						Лимит будет действовать только этот месяц
					</Text>
				</Card>

				<Button
					label="Установить лимит"
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
	categoriesGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 10
	},
	categoryCard: {
		width: '30%',
		alignItems: 'center',
		paddingVertical: 14,
		borderRadius: 10,
		borderWidth: 1
	},
	checkmark: {
		position: 'absolute',
		top: 6,
		right: 6,
		width: 16,
		height: 16,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center'
	}
})
