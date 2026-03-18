import {
	createTransaction,
	deleteTransaction,
	getCategoryStats,
	getMonthlyChartData,
	getMonthTotals,
	getRecentTransactions,
	getTransactionsByMonth
} from '@/db/transactions'
import { create } from 'zustand'
import {
	CategoryStat,
	Currency,
	Transaction,
	TransactionType
} from '../types/index.type'

// ── Типы стора ────────────────────────────────────────────────────────────────
interface MonthTotals {
	totalIncome: number
	totalExpense: number
	balance: number
}

interface TransactionState {
	// Данные
	transactions: Transaction[]
	recentTransactions: Transaction[]
	monthTotals: MonthTotals
	categoryStats: CategoryStat[]
	monthlyChartData: Array<{
		year: number
		month: number
		income: number
		expense: number
	}>

	// Текущий выбранный месяц
	selectedYear: number
	selectedMonth: number

	// Загрузка
	isLoading: boolean

	// Действия
	loadTransactions: () => void
	loadRecentTransactions: () => void
	loadMonthTotals: () => void
	loadCategoryStats: (type: TransactionType) => void
	loadMonthlyChartData: () => void
	addTransaction: (params: {
		type: TransactionType
		amount: number
		currency: Currency
		categoryId: number
		note?: string
		date: string
	}) => void
	removeTransaction: (id: number) => void
	setSelectedMonth: (year: number, month: number) => void
	goToPrevMonth: () => void
	goToNextMonth: () => void
}

// ── Вычисляем текущий месяц и год для начального состояния ────────────────────

const now = new Date()

export const useTransactionStore = create<TransactionState>((set, get) => ({
	// ── Начальное состояние ───────────────────────────────────────────────────
	transactions: [],
	recentTransactions: [],
	monthTotals: {
		totalIncome: 0,
		totalExpense: 0,
		balance: 0
	},
	categoryStats: [],
	monthlyChartData: [],
	selectedYear: now.getFullYear(),
	selectedMonth: now.getMonth() + 1,
	isLoading: false,

	// ── Загрузка транзакций за выбранный месяц ────────────────────────────────
	loadTransactions: () => {
		const { selectedYear, selectedMonth } = get()
		set({ isLoading: true })
		const transactions = getTransactionsByMonth(selectedYear, selectedMonth)
		set({ transactions, isLoading: false })
	},
	// ── Загрузка последних транзакций (дашборд) ───────────────────────────────
	loadRecentTransactions: () => {
		const recentTransactions = getRecentTransactions(5)
		set({ recentTransactions })
	},

	// ── Загрузка итогов за месяц ──────────────────────────────────────────────
	loadMonthTotals: () => {
		const { selectedYear, selectedMonth } = get()
		const { totalIncome, totalExpense } = getMonthTotals(
			selectedYear,
			selectedMonth
		)
		set({
			monthTotals: {
				totalIncome,
				totalExpense,
				balance: totalIncome - totalExpense
			}
		})
	},

	// ── Загрузка статистики по категориям ─────────────────────────────────────
	loadCategoryStats: (type: TransactionType) => {
		const { selectedYear, selectedMonth } = get()
		const categoryStats = getCategoryStats(selectedYear, selectedMonth, type)
		set({ categoryStats })
	},

	// ── Загрузка данных для бар-чарта ─────────────────────────────────────────
	loadMonthlyChartData: () => {
		const monthlyChartData = getMonthlyChartData(6)
		set({ monthlyChartData })
	},

	// ── Добавить транзакцию ───────────────────────────────────────────────────
	addTransaction: params => {
		createTransaction(params)
		// Обновляем все зависимые данные
		get().loadTransactions()
		get().loadRecentTransactions()
		get().loadMonthTotals()
	},

	// ── Удалить транзакцию ────────────────────────────────────────────────────
	removeTransaction: (id: number) => {
		deleteTransaction(id)
		get().loadTransactions()
		get().loadRecentTransactions()
		get().loadMonthTotals()
	},

	// ── Установить месяц напрямую ─────────────────────────────────────────────
	setSelectedMonth: (year: number, month: number) => {
		set({ selectedYear: year, selectedMonth: month })
		get().loadTransactions()
		get().loadMonthTotals()
	},

	// ── Перейти к предыдущему месяцу ──────────────────────────────────────────
	goToPrevMonth: () => {
		const { selectedYear, selectedMonth } = get()
		const newMonth = selectedMonth === 1 ? 12 : selectedMonth - 1
		const newYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear
		set({ selectedYear: newYear, selectedMonth: newMonth })
		get().loadTransactions()
		get().loadMonthTotals()
	},

	// ── Перейти к следующему месяцу ───────────────────────────────────────────
	goToNextMonth: () => {
		const { selectedYear, selectedMonth } = get()
		const newMonth = selectedMonth === 12 ? 1 : selectedMonth + 1
		const newYear = selectedMonth === 12 ? selectedYear + 1 : selectedYear
		set({ selectedYear: newYear, selectedMonth: newMonth })
		get().loadTransactions()
		get().loadMonthTotals()
	}
}))
