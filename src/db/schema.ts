import * as SQLite from 'expo-sqlite'

// Открываем / создаём базу данных
export const db = SQLite.openDatabaseSync('money_tracker.db')

// Инициализация схемы — вызывается один раз при старте приложения
export const initDatabase = (): void => {
	db.execSync(`
		-- ── Категории ────────────────────────────────────────────────────────────
		CREATE TABLE IF NOT EXISTS categories (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL,
      type        TEXT    NOT NULL CHECK (type IN ('income', 'expense')),
      icon        TEXT    NOT NULL DEFAULT 'ellipse-outline',
      color       TEXT    NOT NULL DEFAULT '#a1a1a1',
      is_default  INTEGER NOT NULL DEFAULT 0,
      created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    -- ── Транзакции ───────────────────────────────────────────────────────────
		CREATE TABLE IF NOT EXISTS transactions (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      type            TEXT    NOT NULL CHECK (type IN ('income', 'expense')),
      amount          REAL    NOT NULL CHECK (amount > 0),
      currency        TEXT    NOT NULL DEFAULT 'MDL',
      category_id     INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
      note            TEXT,
      date            TEXT    NOT NULL,
      created_at      TEXT    NOT NULL DEFAULT (datetime('now'))
    );

		-- ── Бюджеты ──────────────────────────────────────────────────────────────
		CREATE TABLE IF NOT EXISTS budgets (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
      limit_amount REAL   NOT NULL CHECK (limit_amount > 0),
      currency    TEXT    NOT NULL DEFAULT 'MDL',
      month       INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
      year        INTEGER NOT NULL,
      created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      UNIQUE (category_id, month, year)
    );

		-- ── Индексы для быстрых выборок ──────────────────────────────────────────
		CREATE INDEX IF NOT EXISTS idx_transactions_date
      ON transactions(date);

    CREATE INDEX IF NOT EXISTS idx_transactions_category
      ON transactions(category_id);

    CREATE INDEX IF NOT EXISTS idx_transactions_type
      ON transactions(type);

    CREATE INDEX IF NOT EXISTS idx_budgets_month_year
      ON budgets(month, year);

	`)
}
