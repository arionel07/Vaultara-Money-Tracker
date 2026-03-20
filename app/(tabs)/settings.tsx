import { Card } from '@/components/Card'
import { Text } from '@/components/Text'
import { useTheme } from '@/hooks/useTheme.hook'
import { useCategoryStore } from '@/stores/categoryStore.store'
import { useSettingsStore } from '@/stores/settingsStore.store'
import {
	AppSettings,
	Currency,
	CURRENCY_LABELS,
	CURRENCY_SYMBOLS
} from '@/types/index.type'
import { Ionicons } from '@expo/vector-icons'
import React, { useCallback } from 'react'
import {
	Alert,
	ScrollView,
	StyleSheet,
	Switch,
	TouchableOpacity,
	View
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const CURRENCIES: Currency[] = ['MDL', 'RUB', 'USD', 'EUR', 'TRY']

const THEMES: {
	key: AppSettings['theme']
	label: string
	icon: keyof typeof Ionicons.glyphMap
}[] = [
	{ key: 'dark', label: 'Тёмная', icon: 'moon-outline' },
	{ key: 'light', label: 'Светлая', icon: 'sunny-outline' },
	{ key: 'system', label: 'Системная', icon: 'phone-portrait-outline' }
]

export default function SettingsScreen() {
	const { colors, isDark } = useTheme()
	const insets = useSafeAreaInsets()

	// ── Сторы ─────────────────────────────────────────────────────────────────
	const {
		theme,
		defaultCurrency,
		biometricEnabled,
		setTheme,
		setDefaultCurrency,
		setBiometricEnabled
	} = useSettingsStore()

	const { categories, removeCategory } = useCategoryStore()

	// ── Пользовательские категории (не дефолтные) ─────────────────────────────
	const customCategories = categories.filter(c => !c.isDefault)

	// ── Пользовательские категории (не дефолтные) ─────────────────────────────
	const handleDeleteCategory = useCallback(
		(id: number, name: string) => {
			Alert.alert(
				'Удалить категорию',
				`Удалить категорию «${name}»? Транзакции с этой категорией останутся.`,
				[
					{ text: 'Отмена', style: 'cancel' },
					{
						text: 'Удалить',
						style: 'destructive',
						onPress: () => removeCategory(id)
					}
				]
			)
		},
		[removeCategory]
	)

	// ── Переключатель биометрии ───────────────────────────────────────────────
	const handleBiometricToggle = useCallback(
		(value: boolean) => {
			setBiometricEnabled(value)
		},
		[setBiometricEnabled]
	)

	return (
		<View style={[styles.root, { backgroundColor: colors.bgPrimary }]}>
			<ScrollView
				contentContainerStyle={[
					styles.scroll,
					{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 }
				]}
				showsVerticalScrollIndicator={false}
			>
				{/* ── Заголовок ──────────────────────────────────────────────────── */}
				<View style={styles.header}>
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
						Настройки
					</Text>
				</View>

				{/* ── Внешний вид ───────────────────────────────────────────────── */}
				<Card>
					{THEMES.map((t, i) => (
						<TouchableOpacity
							key={t.key}
							onPress={() => setTheme(t.key)}
							activeOpacity={0.7}
							style={[
								styles.row,
								{
									borderBottomWidth: i < THEMES.length - 1 ? 1 : 0,
									borderBottomColor: colors.border
								}
							]}
						>
							<View style={styles.rowLeft}>
								<View
									style={[
										styles.rowIcon,
										{ backgroundColor: colors.bgSecondary }
									]}
								>
									<Ionicons
										name={t.icon}
										size={16}
										color={colors.textSecondary}
									/>
								</View>
								<Text
									size="sm"
									weight="medium"
								>
									{t.label}
								</Text>
							</View>

							{theme === t.key && (
								<Ionicons
									name="checkmark"
									size={18}
									color={colors.accent}
								/>
							)}
						</TouchableOpacity>
					))}
				</Card>

				{/* ── Валюта ────────────────────────────────────────────────────── */}
				<Text
					size="xs"
					variant="secondary"
					weight="medium"
					style={styles.sectionTitle}
				>
					ОСНОВНАЯ ВАЛЮТА
				</Text>

				<Card>
					{CURRENCIES.map((c, i) => (
						<TouchableOpacity
							key={c}
							onPress={() => setDefaultCurrency(c)}
							activeOpacity={0.7}
							style={[
								styles.row,
								{
									borderBottomWidth: i < CURRENCIES.length - 1 ? 1 : 0,
									borderBottomColor: colors.border
								}
							]}
						>
							<View style={styles.rowLeft}>
								<View
									style={[
										styles.currencySymbol,
										{
											backgroundColor:
												defaultCurrency === c
													? colors.accent
													: colors.bgSecondary
										}
									]}
								>
									<Text
										size="sm"
										weight="bold"
										style={{
											color:
												defaultCurrency === c ? '#ffffff' : colors.textSecondary
										}}
									>
										{CURRENCY_SYMBOLS[c]}
									</Text>
								</View>
								<View>
									<Text
										size="sm"
										weight="medium"
									>
										{CURRENCY_LABELS[c]}
									</Text>
									<Text
										size="xs"
										variant="secondary"
									>
										{c}
									</Text>
								</View>
							</View>

							{defaultCurrency === c && (
								<Ionicons
									name="checkmark"
									size={18}
									color={colors.accent}
								/>
							)}
						</TouchableOpacity>
					))}
				</Card>

				{/* ── Безопасность ──────────────────────────────────────────────── */}
				<Text
					size="xs"
					variant="secondary"
					weight="medium"
					style={styles.sectionTitle}
				>
					БЕЗОПАСНОСТЬ
				</Text>

				<Card elevated>
					<View style={styles.row}>
						<View style={styles.rowLeft}>
							<View
								style={[
									styles.rowIcon,
									{ backgroundColor: colors.bgSecondary }
								]}
							>
								<Ionicons
									name="scan-outline"
									size={16}
									color={colors.textSecondary}
								/>
							</View>
							<View>
								<Text
									size="sm"
									weight="medium"
								>
									Face ID / Touch ID
								</Text>
								<Text
									size="xs"
									variant="secondary"
								>
									Защита при открытии
								</Text>
							</View>
						</View>

						<Switch
							value={biometricEnabled}
							onValueChange={handleBiometricToggle}
							trackColor={{
								false: colors.border,
								true: colors.accent
							}}
							thumbColor="#ffffff"
						/>
					</View>
				</Card>

				{/* ── Мои категории ─────────────────────────────────────────────── */}
				<Text
					size="xs"
					variant="secondary"
					weight="medium"
					style={styles.sectionTitle}
				>
					МОИ КАТЕГОРИИ
				</Text>

				{customCategories.length === 0 ? (
					<Card>
						<Text
							size="sm"
							variant="secondary"
							style={{ textAlign: 'center' }}
						>
							Нет пользовательских категорий
						</Text>
					</Card>
				) : (
					<Card
						elevated
						style={{ gap: 4 }}
					>
						{customCategories.map((cat, i) => (
							<View
								key={cat.id}
								style={[
									styles.row,
									{
										borderBottomWidth: i < customCategories.length - 1 ? 1 : 0,
										borderBottomColor: colors.border
									}
								]}
							>
								<View style={styles.rowLeft}>
									<View
										style={[
											styles.rowIcon,
											{ backgroundColor: cat.color + '22' }
										]}
									>
										<Ionicons
											name={cat.icon as keyof typeof Ionicons.glyphMap}
											size={16}
											color={cat.color}
										/>
									</View>
									<View>
										<Text
											size="sm"
											weight="medium"
										>
											{cat.name}
										</Text>
										<Text
											size="xs"
											variant="secondary"
										>
											{cat.type === 'expense' ? 'Расход' : 'Доход'}
										</Text>
									</View>
								</View>

								<TouchableOpacity
									onPress={() => handleDeleteCategory(cat.id, cat.name)}
									activeOpacity={0.7}
									style={{ padding: 4 }}
								>
									<Ionicons
										name="trash-outline"
										size={16}
										color={colors.danger}
									/>
								</TouchableOpacity>
							</View>
						))}
					</Card>
				)}

				{/* ── О приложении ──────────────────────────────────────────────── */}
				<Text
					size="xs"
					variant="secondary"
					weight="medium"
					style={styles.sectionTitle}
				>
					О ПРИЛОЖЕНИИ
				</Text>

				<Card
					elevated
					style={{ gap: 4 }}
				>
					<View
						style={[
							styles.row,
							{ borderBottomWidth: 1, borderBottomColor: colors.border }
						]}
					>
						<View style={styles.rowLeft}>
							<View
								style={[
									styles.rowIcon,
									{ backgroundColor: colors.bgSecondary }
								]}
							>
								<Ionicons
									name="apps-outline"
									size={16}
									color={colors.textSecondary}
								/>
							</View>
							<Text
								size="sm"
								weight="medium"
							>
								Версия
							</Text>
						</View>
						<Text
							size="sm"
							variant="secondary"
						>
							1.0.0
						</Text>
					</View>

					<View style={styles.row}>
						<View style={styles.rowLeft}>
							<View
								style={[
									styles.rowIcon,
									{ backgroundColor: colors.bgSecondary }
								]}
							>
								<Ionicons
									name="person-outline"
									size={16}
									color={colors.textSecondary}
								/>
							</View>
							<Text
								size="sm"
								weight="medium"
							>
								Разработчик
							</Text>
						</View>
						<Text
							size="sm"
							variant="secondary"
						>
							Arionel
						</Text>
					</View>
				</Card>
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
		marginBottom: 4,
		gap: 2
	},
	sectionTitle: {
		marginTop: 4,
		marginBottom: 2
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingVertical: 12,
		paddingHorizontal: 4
	},
	rowLeft: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
		flex: 1
	},
	rowIcon: {
		width: 32,
		height: 32,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center'
	},
	currencySymbol: {
		width: 32,
		height: 32,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center'
	}
})
