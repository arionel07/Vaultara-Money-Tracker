import {
	CategoryStat,
	Currency,
	Transaction,
	TransactionType
} from '@/types/index.type'
import { db } from './schema'

// ── Маппинг строки из БД в тип Transaction ────────────────────────────────────
const mapTransaction = (row: {
	id: number
	type: string
	amount: number
	currency: string
	category_id: number
	category_name: string
	category_icon: string
	category_color: string
	note: string | null
	date: string
	created_at: string
}): Transaction => ({
	id: row.id,
	type: row.type as TransactionType,
	amount: row.amount,
	currency: row.currency as Currency,
	categoryId: row.category_id,
	categoryName: row.category_name,
	categoryIcon: row.category_icon,
	categoryColor: row.category_color,
	note: row.note,
	date: row.date,
	createdAt: row.created_at
})

// ── SQL с JOIN для получения данных категории ─────────────────────────────────
const SELECT_TRANSACTIONS = `
  SELECT
    t.id, t.type, t.amount, t.currency,
    t.category_id, t.note, t.date, t.created_at,
    c.name  AS category_name,
    c.icon  AS category_icon,
    c.color AS category_color
  FROM transactions t
  JOIN categories c ON c.id = t.category_id
`

// ── Транзакции за месяц ───────────────────────────────────────────────────────
export const getTransactionsByMonth = (
	year: number,
	month: number
): Transaction[] => {
	// Формируем строки вида "2025-01" для сравнения по DATE
	const prefix = `${year}-${String(month).padStart(2, '0')}`

	const rows = db.getAllSync<Parameters<typeof mapTransaction>[0]>(
		`${SELECT_TRANSACTIONS}
     WHERE t.date LIKE ?
     ORDER BY t.date DESC, t.created_at DESC`,
		[`${prefix}%`]
	)

	return rows.map(mapTransaction)
}

// ── Последние N транзакций (для дашборда) ─────────────────────────────────────
export const getRecentTransactions = (limit: number = 5): Transaction[] => {
	const rows = db.getAllSync<Parameters<typeof mapTransaction>[0]>(
		`${SELECT_TRANSACTIONS}
     ORDER BY t.date DESC, t.created_at DESC
     LIMIT ?`,
		[limit]
	)
	return rows.map(mapTransaction)
}

// ── Создать транзакцию ────────────────────────────────────────────────────────
export const createTransaction = (params: {
	type: TransactionType
	amount: number
	currency: Currency
	categoryId: number
	note?: string
	date: string
}): Transaction => {
	const result = db.runSync(
		`INSERT INTO transactions (type, amount, currency, category_id, note, date)
     VALUES (?, ?, ?, ?, ?, ?)`,
		[
			params.type,
			params.amount,
			params.currency,
			params.categoryId,
			params.note ?? null,
			params.date
		]
	)
	const created = db.getFirstSync<Parameters<typeof mapTransaction>[0]>(
		`${SELECT_TRANSACTIONS} WHERE t.id = ?`,
		[result.lastInsertRowId]
	)

	if (!created) throw new Error('Ошибка создания транзакции')
	return mapTransaction(created)
}

// ── Удалить транзакцию ────────────────────────────────────────────────────────
export const deleteTransaction = (id: number): void => {
	db.runSync(`DELETE FROM transactions WHERE id = ?`, [id])
}

// ── Сумма доходов и расходов за месяц ────────────────────────────────────────
export const getMonthTotals = (
	year: number,
	month: number
): { totalIncome: number; totalExpense: number } => {
	const prefix = `${year}-${String(month).padStart(2, '0')}`

	const row = db.getFirstSync<{
		total_income: number
		total_expense: number
	}>(
		`SELECT
       COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0) AS total_income,
       COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expense
     FROM transactions
     WHERE date LIKE ?`,
		[`${prefix}%`]
	)

	return {
		totalIncome: row?.total_income ?? 0,
		totalExpense: row?.total_expense ?? 0
	}
}

// ── Статистика по категориям за месяц (для круговой диаграммы) ────────────────
export const getCategoryStats = (
	year: number,
	month: number,
	type: TransactionType
): CategoryStat[] => {
	const prefix = `${year}-${String(month).padStart(2, '0')}`

	const rows = db.getAllSync<{
		category_id: number
		category_name: string
		category_color: string
		category_icon: string
		total: number
	}>(
		`SELECT
       c.id    AS category_id,
       c.name  AS category_name,
       c.color AS category_color,
       c.icon  AS category_icon,
       SUM(t.amount) AS total
     FROM transactions t
     JOIN categories c ON c.id = t.category_id
     WHERE t.type = ? AND t.date LIKE ?
     GROUP BY c.id
     ORDER BY total DESC`,
		[type, `${prefix}%`]
	)

	const grandTotal = rows.reduce((sum, r) => sum + r.total, 0)

	return rows.map(r => ({
		categoryId: r.category_id,
		categoryName: r.category_name,
		categoryColor: r.category_color,
		categoryIcon: r.category_icon,
		total: r.total,
		percentage: grandTotal > 0 ? Math.round((r.total / grandTotal) * 100) : 0
	}))
}

// ── Данные по месяцам для бар-чарта (последние N месяцев) ────────────────────
export const getMonthlyChartData = (
	monthsCount: number = 6
): Array<{ year: number; month: number; income: number; expense: number }> => {
	const rows = db.getAllSync<{
		year: number
		month: number
		income: number
		expense: number
	}>(
		`SELECT
       CAST(strftime('%Y', date) AS INTEGER) AS year,
       CAST(strftime('%m', date) AS INTEGER) AS month,
       COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0) AS income,
       COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expense
     FROM transactions
     GROUP BY year, month
     ORDER BY year DESC, month DESC
     LIMIT ?`,
		[monthsCount]
	)

	// Возвращаем в хронологическом порядке (от старых к новым)
	return rows.reverse()
}
