import { deleteBudget, getBudgetsByMonth, upsertBudget } from '@/db/budgets'
import { Budget, Currency } from '@/types/index.type'
import { create } from 'zustand'

// ── Типы стора ────────────────────────────────────────────────────────────────
interface BudgetState {
	budgets: Budget[]
	isLoading: boolean

	// Действия
	loadBudgets: (year: number, month: number) => void
	saveBudget: (params: {
		categoryId: number
		limitAmount: number
		currency: Currency
		month: number
		year: number
	}) => void
	removeBudget: (id: number, year: number, month: number) => void
}

export const useBudgetStore = create<BudgetState>(set => ({
	// ── Начальное состояние ───────────────────────────────────────────────────
	budgets: [],
	isLoading: false,

	// ── Загрузить бюджеты за месяц ────────────────────────────────────────────
	loadBudgets: (year: number, month: number) => {
		set({ isLoading: true })
		const budgets = getBudgetsByMonth(year, month)
		set({ budgets, isLoading: false })
	},

	// ── Сохранить / обновить бюджет ───────────────────────────────────────────
	saveBudget: params => {
		upsertBudget(params)
		const budgets = getBudgetsByMonth(params.year, params.month)
		set({ budgets })
	},

	// ── Удалить бюджет ────────────────────────────────────────────────────────
	removeBudget: (id: number, year: number, month: number) => {
		deleteBudget(id)
		const budgets = getBudgetsByMonth(year, month)
		set({ budgets })
	}
}))
