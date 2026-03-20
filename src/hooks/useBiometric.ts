import { useSettingsStore } from '@/stores/settingsStore.store'
import * as LocalAuthentication from 'expo-local-authentication'
import { useCallback, useEffect, useState } from 'react'

// ── Возвращаемый тип хука ─────────────────────────────────────────────────────

interface UseBiometricResult {
	isSupported: boolean
	isAuthenticated: boolean
	isLoading: boolean
	authenticate: () => Promise<boolean>
	biometricType: 'face' | 'fingerprint' | 'none'
}

export const useBiometric = (): UseBiometricResult => {
	const biometricEnabled = useSettingsStore(s => s.biometricEnabled)

	const [isSupported, setIsSupported] = useState(false)
	const [isAuthenticated, setIsAuthenticated] = useState(false)
	const [isLoading, setIsLoading] = useState(true)
	const [biometricType, setBiometricType] = useState<
		'face' | 'fingerprint' | 'none'
	>('none')

	// ── Проверяем поддержку биометрии на устройстве ───────────────────────────
	useEffect(() => {
		const checkSupport = async () => {
			try {
				const compatible = await LocalAuthentication.hasHardwareAsync()
				const enrolled = await LocalAuthentication.isEnrolledAsync()
				const supported = compatible && enrolled

				setIsSupported(supported)

				if (supported) {
					const types =
						await LocalAuthentication.supportedAuthenticationTypesAsync()
					if (
						types.includes(
							LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
						)
					) {
						setBiometricType('face')
					} else if (
						types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)
					) {
						setBiometricType('fingerprint')
					}
				}

				// Если биометрия выключена в настройках — сразу пропускаем
				if (!biometricEnabled || !supported) {
					setIsAuthenticated(true)
				}
			} catch {
				setIsAuthenticated(true)
			} finally {
				setIsLoading(false)
			}
		}

		checkSupport()
	}, [biometricEnabled])

	// ── Запрос биометрической аутентификации ──────────────────────────────────
	const authenticate = useCallback(async (): Promise<boolean> => {
		try {
			setIsLoading(true)

			const result = await LocalAuthentication.authenticateAsync({
				promptMessage: 'Войдите в Vaultara',
				cancelLabel: 'Отмена',
				fallbackLabel: 'Использовать пароль',
				disableDeviceFallback: false
			})

			if (result.success) {
				setIsAuthenticated(true)
				return true
			}

			return false
		} catch {
			return false
		} finally {
			setIsLoading(false)
		}
	}, [])

	return {
		isSupported,
		isAuthenticated,
		isLoading,
		authenticate,
		biometricType
	}
}
