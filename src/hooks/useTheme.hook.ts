import { useSettingsStore } from '@/stores/settingsStore.store'
import { darkColors, lightColors, ThemeColors } from '@/theme/colors'
import { useMemo } from 'react'
import { useColorScheme } from 'react-native'

// ── Возвращаемый тип хука ─────────────────────────────────────────────────────
interface UseThemeResult {
	colors: ThemeColors
	isDark: boolean
}

export const useTheme = (): UseThemeResult => {
	const systemScheme = useColorScheme()
	const theme = useSettingsStore(s => s.theme)

	const isDark = useMemo(() => {
		if (theme === 'dark') return true
		if (theme === 'light') return false
		return systemScheme === 'dark'
	}, [theme, systemScheme])

	const colors = useMemo(() => (isDark ? darkColors : lightColors), [isDark])

	return { colors, isDark }
}
