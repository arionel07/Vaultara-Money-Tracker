import { useTheme } from '@/hooks/useTheme.hook'
import { Ionicons } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import { useMemo } from 'react'
import { Platform } from 'react-native'

const TAB_CONFIG = [
	{ name: 'index', title: 'Главная', icon: 'home' },
	{ name: 'transactions', title: 'Транзакции', icon: 'list' },
	{ name: 'budget', title: 'Бюджет', icon: 'pie-chart' },
	{ name: 'stats', title: 'Статистика', icon: 'bar-chart' }
] as const

type TabIconName = (typeof TAB_CONFIG)[number]['icon']

export default function TabsLayout() {
	const { colors } = useTheme()

	const tabBarStyle = useMemo(
		() => ({
			backgroundColor: colors.bgSecondary,
			borderTopColor: colors.border,
			borderTopWidth: 1,
			height: Platform.OS === 'ios' ? 85 : 65,
			paddingBottom: Platform.OS === 'ios' ? 28 : 10,
			paddingTop: 10
		}),
		[colors]
	)

	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarStyle,
				tabBarActiveTintColor: colors.accent,
				tabBarInactiveTintColor: colors.textSecondary,
				tabBarLabelStyle: {
					fontFamily: 'Geist_500Medium',
					fontSize: 11,
					marginTop: 2
				}
			}}
		>
			{TAB_CONFIG.map(tab => (
				<Tabs.Screen
					key={tab.name}
					name={tab.name}
					options={{
						title: tab.title,
						tabBarIcon: ({ color, size }) => (
							<Ionicons
								name={`${tab.icon}-outline` as `${TabIconName}-outline`}
								size={size}
								color={color}
							/>
						)
					}}
				/>
			))}
		</Tabs>
	)
}
