import { db } from './schema'

// Дефолтные категории — вставляются только если таблица пустая
export const seedDefaultCategories = (): void => {
	const existing = db.getFirstSync<{ count: number }>(
		'SELECT COUNT(*) as count FROM categories WHERE is_default = 1'
	)

	// Если дефолтные категории уже есть — пропускаем
	if (existing && existing.count > 0) return

	const defaults = [
		// ── Расходы ────────────────────────────────────────────────
		{
			name: 'Транспорт',
			type: 'expense',
			icon: 'car-outline',
			color: '#f59e0b'
		},
		{
			name: 'Продукты',
			type: 'expense',
			icon: 'basket-outline',
			color: '#10b981'
		},
		{
			name: 'Коммунальные',
			type: 'expense',
			icon: 'flash-outline',
			color: '#3b82f6'
		},
		{
			name: 'Квартира',
			type: 'expense',
			icon: 'home-outline',
			color: '#8b5cf6'
		},
		// ── Доходы ─────────────────────────────────────────────────
		{
			name: 'Зарплата',
			type: 'income',
			icon: 'briefcase-outline',
			color: '#22c55e'
		},
		{
			name: 'Другое',
			type: 'income',
			icon: 'add-circle-outline',
			color: '#a1a1a1'
		}
	] as const

	// Вставляем все дефолтные категории в одной транзакции
	db.withTransactionSync(() => {
		for (const cat of defaults) {
			db.runSync(
				`INSERT INTO categories (name, type, icon, color, is_default)
         VALUES (?, ?, ?, ?, 1)`,
				[cat.name, cat.type, cat.icon, cat.color]
			)
		}
	})
}
