import {
	createCategory,
	deleteCategory,
	getAllCategories,
	getCategoriesByType
} from '@/db/categories'
import { Category, TransactionType } from '@/types/index.type'
import { create } from 'zustand'

// ── Типы стора ────────────────────────────────────────────────────────────────
interface CategoryState {
	categories: Category[]
	expenseCategories: Category[]
	incomeCategories: Category[]

	// Действия
	loadCategories: () => void
	addCategory: (params: {
		name: string
		type: TransactionType
		icon: string
		color: string
	}) => void
	removeCategory: (id: number) => void
}

export const useCategoryStore = create<CategoryState>(set => ({
	// ── Начальное состояние ───────────────────────────────────────────────────
	categories: [],
	expenseCategories: [],
	incomeCategories: [],

	// ── Загрузить все категории ───────────────────────────────────────────────
	loadCategories: () => {
		const categories = getAllCategories()
		const expenseCategories = getCategoriesByType('expense')
		const incomeCategories = getCategoriesByType('income')
		set({ categories, expenseCategories, incomeCategories })
	},

	// ── Добавить категорию ────────────────────────────────────────────────────
	addCategory: params => {
		createCategory(params)
		// Перезагружаем все списки
		const categories = getAllCategories()
		const expenseCategories = getCategoriesByType('expense')
		const incomeCategories = getCategoriesByType('income')
		set({ categories, expenseCategories, incomeCategories })
	},
	// ── Удалить категорию ─────────────────────────────────────────────────────
	removeCategory: (id: number) => {
		deleteCategory(id)
		const categories = getAllCategories()
		const expenseCategories = getCategoriesByType('expense')
		const incomeCategories = getCategoriesByType('income')
		set({ categories, expenseCategories, incomeCategories })
	}
}))
