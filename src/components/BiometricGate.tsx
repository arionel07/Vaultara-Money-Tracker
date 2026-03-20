import { useBiometric } from '@/hooks/useBiometric'
import React, { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'

export const BiometricGate: React.FC<{ children: React.ReactNode }> = ({
	children
}) => {
	const { isAuthenticated, isLoading, authenticate } = useBiometric()

	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			// Небольшая задержка чтобы приложение успело запуститься
			setTimeout(() => authenticate(), 300)
		}
	}, [isLoading])

	// Пока не аутентифицирован — чёрный экран
	if (!isAuthenticated) {
		return <View style={styles.lock} />
	}

	return <>{children}</>
}

const styles = StyleSheet.create({
	lock: {
		flex: 1,
		backgroundColor: '#000000'
	}
})
