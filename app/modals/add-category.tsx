import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { Input } from '@/components/Input'
import { Text } from '@/components/Text'
import { COLORS, ICONS } from '@/configs/category.config'
import { useTheme } from '@/hooks/useTheme.hook'
import { useCategoryStore } from '@/stores/categoryStore.store'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import React, { useCallback, useMemo, useState } from 'react'
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
import { TransactionType } from '../../src/types/index.type'

export default function AddCategoryModal() {
	const { colors } = useTheme()
	const insets = useSafeAreaInsets()

	const addCategory = useCategoryStore(s => s.addCategory)

	// ── Локальный стейт ───────────────────────────────────────────────────────
	const [type, setType] = useState<TransactionType>('expense')
	const [name, setName] = useState('')
	const [icon, setIcon] =
		useState<keyof typeof Ionicons.glyphMap>('cart-outline')
	const [color, setColor] = useState(COLORS[0])

	// ── Валидация ─────────────────────────────────────────────────────────────
	const isValid = useMemo(() => name.trim().length >= 2, [name])

	// ── Сохранение ────────────────────────────────────────────────────────────
	const handleSave = useCallback(() => {
		if (name.trim().length < 2) {
			Alert.alert('Ошибка', 'Название должно быть не менее 2 символов')
			return
		}

		addCategory({
			name: name.trim(),
			type,
			icon: icon as string,
			color
		})

		router.dismiss()
	}, [name, type, icon, color, addCategory])

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
					Новая категория
				</Text>

				<Button
					label="Создать"
					onPress={handleSave}
					disabled={!isValid}
					size="sm"
					style={{ minWidth: 80 }}
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
				{/* ── Тип категории ─────────────────────────────────────────────── */}
				<View style={styles.typeRow}>
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

				{/* ── Превью категории ──────────────────────────────────────────── */}
				<Card
					elevated
					style={styles.preview}
				>
					<View style={[styles.previewIcon, { backgroundColor: color + '22' }]}>
						<Ionicons
							name={icon}
							size={28}
							color={color}
						/>
					</View>
					<View style={{ flex: 1 }}>
						<Text
							size="xs"
							variant="secondary"
							weight="medium"
						>
							ПРЕДПРОСМОТР
						</Text>
						<Text
							size="base"
							weight="semibold"
							style={{ marginTop: 2 }}
							numberOfLines={1}
						>
							{name.trim() || 'Название категории'}
						</Text>
						<Text
							size="xs"
							variant="secondary"
						>
							{type === 'expense' ? 'Расход' : 'Доход'}
						</Text>
					</View>
				</Card>

				{/* ── Название ──────────────────────────────────────────────────── */}
				<Input
					label="Название категории"
					value={name}
					onChangeText={setName}
					placeholder="Например: Рестораны"
					leftIcon="text-outline"
					maxLength={30}
				/>

				{/* ── Выбор цвета ───────────────────────────────────────────────── */}
				<View>
					<Text
						size="xs"
						variant="secondary"
						weight="medium"
						style={{ marginBottom: 10 }}
					>
						ЦВЕТ
					</Text>
					<View style={styles.colorsGrid}>
						{COLORS.map(c => (
							<TouchableOpacity
								key={c}
								onPress={() => setColor(c)}
								activeOpacity={0.8}
								style={[
									styles.colorCircle,
									{
										backgroundColor: c,
										borderWidth: color === c ? 3 : 0,
										borderColor: colors.accent
									}
								]}
							>
								{color === c && (
									<Ionicons
										name="checkmark"
										size={14}
										color={c === '#ffffff' ? '#000000' : '#ffffff'}
									/>
								)}
							</TouchableOpacity>
						))}
					</View>
				</View>

				{/* ── Выбор иконки ──────────────────────────────────────────────── */}
				<View>
					<Text
						size="xs"
						variant="secondary"
						weight="medium"
						style={{ marginBottom: 10 }}
					>
						ИКОНКА
					</Text>
					<View style={styles.iconsGrid}>
						{ICONS.map(ic => (
							<TouchableOpacity
								key={ic}
								onPress={() => setIcon(ic)}
								activeOpacity={0.75}
								style={[
									styles.iconBtn,
									{
										backgroundColor:
											icon === ic ? color + '22' : colors.bgElevated,
										borderColor: icon === ic ? color : colors.border
									}
								]}
							>
								<Ionicons
									name={ic}
									size={22}
									color={icon === ic ? color : colors.textSecondary}
								/>
							</TouchableOpacity>
						))}
					</View>
				</View>

				{/* ── Кнопка создать ────────────────────────────────────────────── */}
				<Button
					label="Создать категорию"
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
	preview: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 14
	},
	previewIcon: {
		width: 56,
		height: 56,
		borderRadius: 14,
		alignItems: 'center',
		justifyContent: 'center'
	},
	colorsGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 10
	},
	colorCircle: {
		width: 36,
		height: 36,
		borderRadius: 18,
		alignItems: 'center',
		justifyContent: 'center'
	},
	iconsGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 10
	},
	iconBtn: {
		width: 48,
		height: 48,
		borderRadius: 10,
		borderWidth: 1,
		alignItems: 'center',
		justifyContent: 'center'
	}
})
