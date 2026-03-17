import { Budget, Currency } from '@/types/index.type'
import { db } from './schema'

// ── Маппинг строки из БД в тип Budget ────────────────────────────────────────
const mapBudget = (row: {
	id: number
	category_id: number
	category_name: string
	category_icon: string
	category_color: string
	limit_amount: number
	currency: string
	month: number
	year: number
	spent_amount: number
}): Budget => ({
	id: row.id,
	categoryId: row.category_id,
	categoryName: row.category_name,
	categoryIcon: row.category_icon,
	categoryColor: row.category_color,
	limitAmount: row.limit_amount,
	currency: row.currency as Currency,
	month: row.month,
	year: row.year,
	spentAmount: row.spent_amount
})

// ── Бюджеты за месяц (с подсчётом потраченного) ───────────────────────────────
export const getBudgetsByMonth = (year: number, month: number): Budget[] => {
	const prefix = `${year}-${String(month).padStart(2, '0')}`

	const rows = db.getAllSync<Parameters<typeof mapBudget>[0]>(
		`SELECT
       b.id, b.category_id, b.limit_amount, b.currency, b.month, b.year,
       c.name  AS category_name,
       c.icon  AS category_icon,
       c.color AS category_color,
       COALESCE(
         (SELECT SUM(t.amount)
          FROM transactions t
          WHERE t.category_id = b.category_id
            AND t.type = 'expense'
            AND t.date LIKE ?),
         0
       ) AS spent_amount
     FROM budgets b
     JOIN categories c ON c.id = b.category_id
     WHERE b.year = ? AND b.month = ?
     ORDER BY c.name ASC`,
		[prefix + '%', year, month]
	)

	return rows.map(mapBudget)
}

// ── Создать или обновить бюджет (UPSERT) ──────────────────────────────────────
export const upsertBudget = (params: {
	categoryId: number
	limitAmount: number
	currency: Currency
	month: number
	year: number
}): void => {
	db.runSync(
		`INSERT INTO budgets (category_id, limit_amount, currency, month, year)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(category_id, month, year)
     DO UPDATE SET limit_amount = excluded.limit_amount,
                   currency     = excluded.currency`,
		[
			params.categoryId,
			params.limitAmount,
			params.currency,
			params.month,
			params.year
		]
	)
}

// ── Удалить бюджет ────────────────────────────────────────────────────────────
export const deleteBudget = (id: number): void => {
	db.runSync(`DELETE FROM budgets WHERE id = ?`, [id])
}
