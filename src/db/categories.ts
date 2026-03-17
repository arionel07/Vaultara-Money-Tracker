import { Category, TransactionType } from '@/types/index.type'
import { db } from './schema'

// ── Маппинг строки из БД в тип Category ──────────────────────────────────────
const mapCategory = (row: {
	id: number
	name: string
	type: string
	icon: string
	color: string
	is_default: number
	created_at: string
}): Category => ({
	id: row.id,
	name: row.name,
	type: row.type as TransactionType,
	icon: row.icon,
	color: row.color,
	isDefault: row.is_default === 1,
	createdAt: row.created_at
})

// ── Получить все категории ────────────────────────────────────────────────────
export const getAllCategories = (): Category[] => {
	const rows = db.getAllSync<
		ReturnType<typeof mapCategory> & {
			is_default: number
		}
	>(`SELECT * FROM categories ORDER BY is_default DESC, name ASC`)
	return rows.map(mapCategory)
}

// ── Получить категории по типу ────────────────────────────────────────────────
export const getCategoriesByType = (type: TransactionType): Category[] => {
	const rows = db.getAllSync<Parameters<typeof mapCategory>[0]>(
		`SELECT * FROM categories
     WHERE type = ?
     ORDER BY is_default DESC, name ASC`,
		[type]
	)
	return rows.map(mapCategory)
}

// ── Создать новую категорию ───────────────────────────────────────────────────
export const createCategory = (params: {
	name: string
	type: TransactionType
	icon: string
	color: string
}): Category => {
	const result = db.runSync(
		`INSERT INTO categories (name, type, icon, color, is_default)
     VALUES (?, ?, ?, ?, 0)`,
		[params.name, params.type, params.icon, params.color]
	)
	const created = db.getFirstSync<Parameters<typeof mapCategory>[0]>(
		`SELECT * FROM categories WHERE id = ?`,
		[result.lastInsertRowId]
	)

	if (!created) throw new Error('Ошибка создания категории')

	return mapCategory(created)
}

// ── Удалить категорию (только не дефолтные) ───────────────────────────────────
export const deleteCategory = (id: number): void => {
	const cat = db.getFirstSync<{ is_default: number }>(
		`SELECT is_default FROM categories WHERE id = ?`,
		[id]
	)

	if (!cat) throw new Error('Категория не найдена')
	if (cat.is_default === 1)
		throw new Error('Нельзя удалить системную категорию')

	db.runSync(`DELETE FROM categories WHERE id = ?`, [id])
}
