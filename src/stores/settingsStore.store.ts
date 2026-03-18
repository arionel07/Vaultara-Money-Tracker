import { AppSettings, Currency } from '@/types/index.type'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'

// ── Ключ для AsyncStorage ─────────────────────────────────────────────────────
const SETTINGS_KEY = 'app_settings'

// ── Значения по умолчанию ─────────────────────────────────────────────────────
const DEFAULT_SETTINGS: AppSettings = {
	theme: 'dark',
	defaultCurrency: 'MDL',
	biometricEnabled: false
}

// ── Типы стора ────────────────────────────────────────────────────────────────
interface SettingsState extends AppSettings {
	isLoaded: boolean

	// Действия
	loadSettings: () => Promise<void>
	setTheme: (theme: AppSettings['theme']) => Promise<void>
	setDefaultCurrency: (currency: Currency) => Promise<void>
	setBiometricEnabled: (enabled: boolean) => Promise<void>
}

// ── Хелпер — сохранение в AsyncStorage ───────────────────────────────────────
const persistSettings = async (settings: AppSettings): Promise<void> => {
	await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
	// ── Начальное состояние ───────────────────────────────────────────────────
	...DEFAULT_SETTINGS,
	isLoaded: false,

	// ── Загрузить настройки из AsyncStorage ──────────────────────────────────
	loadSettings: async () => {
		try {
			const raw = await AsyncStorage.getItem(SETTINGS_KEY)
			if (raw) {
				const saved = JSON.parse(raw) as Partial<AppSettings>
				set({ ...DEFAULT_SETTINGS, ...saved, isLoaded: true })
			} else {
				set({ ...DEFAULT_SETTINGS, isLoaded: true })
			}
		} catch {
			// При ошибке используем дефолтные настройки
			set({ ...DEFAULT_SETTINGS, isLoaded: true })
		}
	},

	// ── Изменить тему ─────────────────────────────────────────────────────────
	setTheme: async theme => {
		set({ theme })
		const { defaultCurrency, biometricEnabled } = get()
		await persistSettings({ theme, defaultCurrency, biometricEnabled })
	},

	// ── Изменить валюту по умолчанию ──────────────────────────────────────────
	setDefaultCurrency: async defaultCurrency => {
		set({ defaultCurrency })
		const { theme, biometricEnabled } = get()
		await persistSettings({ theme, defaultCurrency, biometricEnabled })
	},

	// ── Включить / выключить биометрию ────────────────────────────────────────
	setBiometricEnabled: async biometricEnabled => {
		set({ biometricEnabled })
		const { theme, defaultCurrency } = get()
		await persistSettings({ theme, defaultCurrency, biometricEnabled })
	}
}))
