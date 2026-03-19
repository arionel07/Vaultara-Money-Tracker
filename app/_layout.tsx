import { initDatabase } from '@/db/schema'
import { seedDefaultCategories } from '@/db/seeds'
import {
	Geist_400Regular,
	Geist_500Medium,
	Geist_600SemiBold,
	Geist_700Bold,
	useFonts
} from '@expo-google-fonts/geist'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useCallback, useEffect, useState } from 'react'
import { View } from 'react-native'

import { SplashAnimation } from '@/components/SplashAnimation'
import { useTheme } from '@/hooks/useTheme.hook'
import { useCategoryStore } from '@/stores/categoryStore.store'
import { useSettingsStore } from '@/stores/settingsStore.store'
import '../src/styles/global.css'

// Держим нативный сплэш пока грузятся шрифты
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
	const loadSettings = useSettingsStore(s => s.loadSettings)
	const isLoaded = useSettingsStore(s => s.isLoaded)
	const loadCategories = useCategoryStore(s => s.loadCategories)
	const { colors, isDark } = useTheme()

	// Показываем наш анимированный сплэш поверх приложения
	const [showSplash, setShowSplash] = useState(true)

	const [fontsLoaded] = useFonts({
		Geist_400Regular,
		Geist_500Medium,
		Geist_600SemiBold,
		Geist_700Bold
	})

	// ── Инициализация БД ──────────────────────────────────────────────────────
	useEffect(() => {
		initDatabase()
		seedDefaultCategories()
		loadSettings()
		loadCategories()
	}, [])

	// ── Скрываем нативный сплэш как только шрифты и настройки готовы ─────────
	const onLayoutRootView = useCallback(async () => {
		if (fontsLoaded && isLoaded) {
			await SplashScreen.hideAsync()
		}
	}, [fontsLoaded, isLoaded])

	// Пока шрифты / настройки не загружены — ничего не рендерим
	if (!fontsLoaded || !isLoaded) return null

	return (
		<View
			style={{ flex: 1, backgroundColor: colors.bgPrimary }}
			onLayout={onLayoutRootView}
		>
			<StatusBar style={isDark ? 'light' : 'dark'} />

			{/* ── Основная навигация ─────────────────────────────────────────────── */}
			<Stack screenOptions={{ headerShown: false }}>
				<Stack.Screen name="(tabs)" />
				<Stack.Screen
					name="modals/add-transaction"
					options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
				/>
				<Stack.Screen
					name="modals/add-category"
					options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
				/>
				<Stack.Screen
					name="modals/add-budget"
					options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
				/>
			</Stack>

			{/* ── Анимированный сплэш поверх всего ──────────────────────────────── */}
			{showSplash && <SplashAnimation onFinish={() => setShowSplash(false)} />}
		</View>
	)
}
