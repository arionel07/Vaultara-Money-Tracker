import { Card } from '@/components/Card'
import { MonthNavigator } from '@/components/MonthNavigator'
import { Text } from '@/components/Text'
import { useTheme } from '@/hooks/useTheme.hook'
import { useSettingsStore } from '@/stores/settingsStore.store'
import { useTransactionStore } from '@/stores/transactionStore.store'
import { CategoryStat, CURRENCY_SYMBOLS } from '@/types/index.type'
import { Ionicons } from '@expo/vector-icons'
import { router, useFocusEffect } from 'expo-router'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
	Dimensions,
	ScrollView,
	StyleSheet,
	TouchableOpacity,
	View
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Svg, { G, Path, Rect, Text as SvgText } from 'react-native-svg'

const SCREEN_WIDTH = Dimensions.get('window').width
const CHART_WIDTH = SCREEN_WIDTH - 64

// ── Вспомогательная функция: дуга SVG для pie ────────────────────────────────
const polarToCartesian = (
	cx: number,
	cy: number,
	r: number,
	angleDeg: number
) => {
	const rad = ((angleDeg - 90) * Math.PI) / 180
	return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

const describeArc = (
	cx: number,
	cy: number,
	outerR: number,
	innerR: number,
	startAngle: number,
	endAngle: number
): string => {
	const s1 = polarToCartesian(cx, cy, outerR, startAngle)
	const e1 = polarToCartesian(cx, cy, outerR, endAngle)
	const s2 = polarToCartesian(cx, cy, innerR, endAngle)
	const e2 = polarToCartesian(cx, cy, innerR, startAngle)
	const large = endAngle - startAngle > 180 ? 1 : 0
	return [
		`M ${s1.x} ${s1.y}`,
		`A ${outerR} ${outerR} 0 ${large} 1 ${e1.x} ${e1.y}`,
		`L ${s2.x} ${s2.y}`,
		`A ${innerR} ${innerR} 0 ${large} 0 ${e2.x} ${e2.y}`,
		'Z'
	].join(' ')
}

// ── Компонент круговой диаграммы ──────────────────────────────────────────────
interface DonutChartProps {
	data: CategoryStat[]
	symbol: string
	total: number
}

const DonutChart: React.FC<DonutChartProps> = ({ data, symbol, total }) => {
	const { colors } = useTheme()
	const size = CHART_WIDTH
	const cx = size / 2
	const cy = 110
	const outerR = 90
	const innerR = 58

	const slices = useMemo(() => {
		let start = 0
		return data.map(d => {
			const angle = (d.total / total) * 360
			const slice = {
				path: describeArc(cx, cy, outerR, innerR, start, start + angle - 1),
				color: d.categoryColor,
				name: d.categoryName,
				pct: d.percentage
			}
			start += angle
			return slice
		})
	}, [data, total, cx, cy])

	return (
		<Svg
			width={size}
			height={220}
		>
			<G>
				{slices.map((s, i) => (
					<Path
						key={i}
						d={s.path}
						fill={s.color}
					/>
				))}
			</G>
			{/* Центральный текст */}
			<SvgText
				x={cx}
				y={cy - 8}
				textAnchor="middle"
				fill={colors.textSecondary}
				fontSize={11}
				fontFamily="Geist_400Regular"
			>
				ИТОГО
			</SvgText>
			<SvgText
				x={cx}
				y={cy + 14}
				textAnchor="middle"
				fill={colors.textPrimary}
				fontSize={18}
				fontFamily="Geist_700Bold"
			>
				{total.toLocaleString('ru-RU')}
				{symbol}
			</SvgText>
		</Svg>
	)
}

// ── Компонент бар-чарта ───────────────────────────────────────────────────────
interface BarChartProps {
	data: Array<{
		label: string
		income: number
		expense: number
	}>
	successColor: string
	dangerColor: string
	borderColor: string
	textColor: string
}

const BarChart: React.FC<BarChartProps> = ({
	data,
	successColor,
	dangerColor,
	borderColor,
	textColor
}) => {
	const height = 180
	const padLeft = 40
	const padBottom = 24
	const padTop = 10
	const chartH = height - padBottom - padTop
	const chartW = CHART_WIDTH - padLeft - 10
	const barW = 8
	const gap = 4

	const maxVal = useMemo(
		() => Math.max(...data.flatMap(d => [d.income, d.expense]), 1),
		[data]
	)

	const stepW = data.length > 0 ? chartW / data.length : 0

	// Линии сетки
	const gridLines = [0, 0.25, 0.5, 0.75, 1].map(frac => ({
		y: padTop + chartH * (1 - frac),
		label: Math.round(maxVal * frac).toLocaleString('ru-RU')
	}))

	return (
		<Svg
			width={CHART_WIDTH}
			height={height}
		>
			{/* Сетка */}
			{gridLines.map((g, i) => (
				<G key={i}>
					<Rect
						x={padLeft}
						y={g.y}
						width={chartW}
						height={0.5}
						fill={borderColor}
					/>
					<SvgText
						x={padLeft - 4}
						y={g.y + 4}
						textAnchor="end"
						fill={textColor}
						fontSize={8}
						fontFamily="Geist_400Regular"
					>
						{i === 0 ? '' : g.label}
					</SvgText>
				</G>
			))}

			{/* Бары */}
			{data.map((d, i) => {
				const centerX = padLeft + stepW * i + stepW / 2
				const incomeH = (d.income / maxVal) * chartH
				const expenseH = (d.expense / maxVal) * chartH

				return (
					<G key={i}>
						{/* Доход */}
						<Rect
							x={centerX - barW - gap / 2}
							y={padTop + chartH - incomeH}
							width={barW}
							height={incomeH}
							fill={successColor}
							rx={2}
						/>
						{/* Расход */}
						<Rect
							x={centerX + gap / 2}
							y={padTop + chartH - expenseH}
							width={barW}
							height={expenseH}
							fill={dangerColor}
							rx={2}
						/>
						{/* Подпись */}
						<SvgText
							x={centerX}
							y={height - 6}
							textAnchor="middle"
							fill={textColor}
							fontSize={9}
							fontFamily="Geist_400Regular"
						>
							{d.label}
						</SvgText>
					</G>
				)
			})}
		</Svg>
	)
}

// ── Тип вкладки ───────────────────────────────────────────────────────────────
type StatTab = 'expense' | 'income'

const TABS: { key: StatTab; label: string }[] = [
	{ key: 'expense', label: 'Расходы' },
	{ key: 'income', label: 'Доходы' }
]

// ── Основной экран ────────────────────────────────────────────────────────────
export default function StatsScreen() {
	const { colors } = useTheme()
	const insets = useSafeAreaInsets()

	const {
		selectedYear,
		selectedMonth,
		categoryStats,
		monthlyChartData,
		monthTotals,
		goToPrevMonth,
		goToNextMonth,
		loadCategoryStats,
		loadMonthlyChartData,
		loadMonthTotals
	} = useTransactionStore()

	const defaultCurrency = useSettingsStore(s => s.defaultCurrency)
	const symbol = CURRENCY_SYMBOLS[defaultCurrency]

	const [activeTab, setActiveTab] = useState<StatTab>('expense')

	// ── Загрузка при фокусе ───────────────────────────────────────────────────
	useFocusEffect(
		useCallback(() => {
			loadCategoryStats(activeTab)
			loadMonthlyChartData()
			loadMonthTotals()
		}, [selectedYear, selectedMonth, activeTab])
	)

	useEffect(() => {
		loadCategoryStats(activeTab)
	}, [activeTab, selectedYear, selectedMonth])

	// ── Данные для бар-чарта ──────────────────────────────────────────────────
	const barData = useMemo(
		() =>
			monthlyChartData.map(d => ({
				label: new Date(d.year, d.month - 1).toLocaleDateString('ru-RU', {
					month: 'short'
				}),
				income: d.income,
				expense: d.expense
			})),
		[monthlyChartData]
	)

	const total =
		activeTab === 'expense' ? monthTotals.totalExpense : monthTotals.totalIncome

	const topCategory = categoryStats[0] ?? null

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
							Статистика
						</Text>
					</View>
				</View>

				{/* ── Навигация по месяцам ───────────────────────────────────────── */}
				<MonthNavigator
					year={selectedYear}
					month={selectedMonth}
					onPrev={goToPrevMonth}
					onNext={goToNextMonth}
				/>

				{/* ── Вкладки ───────────────────────────────────────────────────── */}
				<View
					style={[
						styles.tabRow,
						{ backgroundColor: colors.bgSecondary, borderColor: colors.border }
					]}
				>
					{TABS.map(tab => (
						<TouchableOpacity
							key={tab.key}
							onPress={() => setActiveTab(tab.key)}
							activeOpacity={0.7}
							style={[
								styles.tabBtn,
								{
									backgroundColor:
										activeTab === tab.key ? colors.bgElevated : 'transparent',
									borderColor:
										activeTab === tab.key ? colors.border : 'transparent'
								}
							]}
						>
							<Text
								size="sm"
								weight={activeTab === tab.key ? 'semibold' : 'regular'}
								style={{
									color:
										activeTab === tab.key
											? colors.textPrimary
											: colors.textSecondary
								}}
							>
								{tab.label}
							</Text>
						</TouchableOpacity>
					))}
				</View>

				{/* ── Сводка ────────────────────────────────────────────────────── */}
				<View style={styles.summaryRow}>
					<Card style={styles.summaryCard}>
						<Text
							size="xs"
							variant="secondary"
							weight="medium"
						>
							{activeTab === 'expense' ? 'Всего расходов' : 'Всего доходов'}
						</Text>
						<Text
							size="xl"
							weight="bold"
							style={{
								color: activeTab === 'expense' ? colors.danger : colors.success,
								marginTop: 4
							}}
						>
							{total.toLocaleString('ru-RU')} {symbol}
						</Text>
					</Card>

					{topCategory && (
						<Card style={styles.summaryCard}>
							<Text
								size="xs"
								variant="secondary"
								weight="medium"
							>
								Топ категория
							</Text>
							<View style={styles.topCatRow}>
								<View
									style={[
										styles.topCatIcon,
										{ backgroundColor: topCategory.categoryColor + '22' }
									]}
								>
									<Ionicons
										name={
											topCategory.categoryIcon as keyof typeof Ionicons.glyphMap
										}
										size={14}
										color={topCategory.categoryColor}
									/>
								</View>
								<Text
									size="sm"
									weight="semibold"
									numberOfLines={1}
									style={{ flex: 1 }}
								>
									{topCategory.categoryName}
								</Text>
							</View>
							<Text
								size="base"
								weight="bold"
								style={{ color: topCategory.categoryColor, marginTop: 2 }}
							>
								{topCategory.percentage}%
							</Text>
						</Card>
					)}
				</View>

				{/* ── Круговая диаграмма ─────────────────────────────────────────── */}
				<Card elevated>
					<Text
						size="sm"
						weight="semibold"
						style={{ marginBottom: 4 }}
					>
						{activeTab === 'expense'
							? 'Расходы по категориям'
							: 'Доходы по категориям'}
					</Text>

					{categoryStats.length === 0 ? (
						<View style={styles.emptyChart}>
							<Ionicons
								name="pie-chart-outline"
								size={40}
								color={colors.textSecondary}
							/>
							<Text
								size="sm"
								variant="secondary"
								style={{ marginTop: 8, textAlign: 'center' }}
							>
								Нет данных за этот месяц
							</Text>
						</View>
					) : (
						<>
							<DonutChart
								data={categoryStats}
								symbol={symbol}
								total={total}
							/>

							{/* Легенда */}
							<View style={styles.legend}>
								{categoryStats.map(s => (
									<View
										key={s.categoryId}
										style={styles.legendItem}
									>
										<View
											style={[
												styles.legendDot,
												{ backgroundColor: s.categoryColor }
											]}
										/>
										<Text
											size="xs"
											style={{ flex: 1 }}
											numberOfLines={1}
										>
											{s.categoryName}
										</Text>
										<Text
											size="xs"
											variant="secondary"
											weight="medium"
										>
											{s.percentage}%
										</Text>
										<Text
											size="xs"
											variant="secondary"
										>
											{s.total.toLocaleString('ru-RU')} {symbol}
										</Text>
									</View>
								))}
							</View>
						</>
					)}
				</Card>

				{/* ── Бар-чарт доходы vs расходы ────────────────────────────────── */}
				<Card elevated>
					<Text
						size="sm"
						weight="semibold"
						style={{ marginBottom: 8 }}
					>
						Доходы vs Расходы (6 месяцев)
					</Text>

					{barData.length === 0 ? (
						<View style={styles.emptyChart}>
							<Ionicons
								name="bar-chart-outline"
								size={40}
								color={colors.textSecondary}
							/>
							<Text
								size="sm"
								variant="secondary"
								style={{ marginTop: 8, textAlign: 'center' }}
							>
								Недостаточно данных
							</Text>
						</View>
					) : (
						<BarChart
							data={barData}
							successColor={colors.success}
							dangerColor={colors.danger}
							borderColor={colors.border}
							textColor={colors.textSecondary}
						/>
					)}

					{/* Легенда */}
					<View style={styles.barLegend}>
						<View style={styles.legendItem}>
							<View
								style={[styles.legendDot, { backgroundColor: colors.success }]}
							/>
							<Text
								size="xs"
								variant="secondary"
							>
								Доходы
							</Text>
						</View>
						<View style={styles.legendItem}>
							<View
								style={[styles.legendDot, { backgroundColor: colors.danger }]}
							/>
							<Text
								size="xs"
								variant="secondary"
							>
								Расходы
							</Text>
						</View>
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
	tabRow: {
		flexDirection: 'row',
		borderRadius: 10,
		borderWidth: 1,
		padding: 4,
		gap: 4
	},
	tabBtn: {
		flex: 1,
		alignItems: 'center',
		paddingVertical: 8,
		borderRadius: 7,
		borderWidth: 1
	},
	summaryRow: {
		flexDirection: 'row',
		gap: 12
	},
	summaryCard: {
		flex: 1,
		gap: 4
	},
	topCatRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		marginTop: 4
	},
	topCatIcon: {
		width: 22,
		height: 22,
		borderRadius: 6,
		alignItems: 'center',
		justifyContent: 'center'
	},
	emptyChart: {
		height: 160,
		alignItems: 'center',
		justifyContent: 'center'
	},
	legend: {
		marginTop: 8,
		gap: 8
	},
	legendItem: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8
	},
	legendDot: {
		width: 8,
		height: 8,
		borderRadius: 4
	},
	barLegend: {
		flexDirection: 'row',
		gap: 16,
		marginTop: 8,
		justifyContent: 'center'
	}
})
