// ─── Валюты ──────────────────────────────────────────────────────────────────

export type Currency = 'RUB' | 'USD' | 'EUR' | 'TRY' | 'MDL'

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
	RUB: '₽',
	USD: '$',
	EUR: '€',
	TRY: '₺',
	MDL: 'L'
}

export const CURRENCY_LABELS: Record<Currency, string> = {
	RUB: 'Российский рубль',
	USD: 'Доллар США',
	EUR: 'Евро',
	TRY: 'Турецкая лира',
	MDL: 'Молдавская лейя'
}

// ─── Тип транзакции ───────────────────────────────────────────────────────────

export type TransactionType = 'income' | 'expense'

// ─── Категория ────────────────────────────────────────────────────────────────

export interface Category {
	id: number
	name: string
	type: TransactionType
	icon: string // Название иконки Ionicons
	color: string // HEX-цвет для иконки
	isDefault: boolean // Системная категория (нельзя удалить)
	createdAt: string // ISO строка
}

// ─── Транзакция ───────────────────────────────────────────────────────────────

export interface Transaction {
	id: number
	type: TransactionType
	amount: number
	currency: Currency
	categoryId: number
	categoryName: string // Денормализовано для быстрого отображения
	categoryIcon: string
	categoryColor: string
	note: string | null
	date: string // ISO строка "YYYY-MM-DD"
	createdAt: string
}

// ─── Бюджет ───────────────────────────────────────────────────────────────────

export interface Budget {
	id: number
	categoryId: number
	categoryName: string
	categoryIcon: string
	categoryColor: string
	limitAmount: number
	currency: Currency
	month: number // 1–12
	year: number
	spentAmount: number // Вычисляется динамически
}

// ─── Настройки приложения ─────────────────────────────────────────────────────

export interface AppSettings {
	theme: 'dark' | 'light' | 'system'
	defaultCurrency: Currency
	biometricEnabled: boolean
}

// ─── Агрегированная статистика за месяц ──────────────────────────────────────

export interface MonthSummary {
	year: number
	month: number
	totalIncome: number
	totalExpense: number
	balance: number
	currency: Currency
}

// ─── Статистика по категории ──────────────────────────────────────────────────

export interface CategoryStat {
	categoryId: number
	categoryName: string
	categoryColor: string
	categoryIcon: string
	total: number
	percentage: number // 0–100
}
