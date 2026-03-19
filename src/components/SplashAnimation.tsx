import React, { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import Animated, {
	Easing,
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withDelay,
	withSpring,
	withTiming
} from 'react-native-reanimated'
import Svg, { Line } from 'react-native-svg'

// ── Одна анимированная буква ───────────────────────────────────────────────────
interface LetterProps {
	char: string
	delay: number
}

const AnimatedLetter: React.FC<LetterProps> = ({ char, delay }) => {
	const opacity = useSharedValue(0)
	const translateY = useSharedValue(14)

	useEffect(() => {
		// eslint-disable-next-line react-hooks/exhaustive-deps
		opacity.value = withDelay(
			delay,
			withTiming(1, { duration: 220, easing: Easing.out(Easing.cubic) })
		)
		translateY.value = withDelay(
			delay,
			withTiming(0, { duration: 220, easing: Easing.out(Easing.cubic) })
		)
	}, [])

	const style = useAnimatedStyle(() => ({
		opacity: opacity.value,
		transform: [{ translateY: translateY.value }]
	}))

	return <Animated.Text style={[styles.letter, style]}>{char}</Animated.Text>
}

// ── Основной компонент ────────────────────────────────────────────────────────
interface SplashAnimationProps {
	onFinish: () => void
}

// Буквы и тайминги
const LETTERS = ['A', 'R', 'I', 'O', 'N', 'E', 'L'] as const
const LETTER_START = 520 // мс — когда начинают появляться буквы
const LETTER_STEP = 75 // мс — задержка между буквами
const LAST_LETTER = LETTER_START + LETTERS.length * LETTER_STEP

export const SplashAnimation: React.FC<SplashAnimationProps> = ({
	onFinish
}) => {
	// Логотип
	const logoOpacity = useSharedValue(0)
	const logoScale = useSharedValue(0.55)

	// Синяя линия под логотипом
	const lineWidth = useSharedValue(0)

	// Подзаголовок
	const subtitleOpacity = useSharedValue(0)

	// Общее затухание
	const rootOpacity = useSharedValue(1)

	useEffect(() => {
		// ── 1. Логотип появляется ──────────────────────────────────────────────
		logoOpacity.value = withTiming(1, {
			duration: 480,
			easing: Easing.out(Easing.cubic)
		})
		logoScale.value = withSpring(1, { damping: 11, stiffness: 90 })

		// ── 2. Синяя линия раскрывается ───────────────────────────────────────
		lineWidth.value = withDelay(
			280,
			withTiming(110, { duration: 380, easing: Easing.out(Easing.cubic) })
		)

		// ── 3. Подзаголовок ───────────────────────────────────────────────────
		subtitleOpacity.value = withDelay(
			LAST_LETTER + 180,
			withTiming(1, { duration: 380 })
		)

		// ── 4. Всё плавно гаснет, вызываем onFinish ───────────────────────────
		rootOpacity.value = withDelay(
			LAST_LETTER + 1050,
			withTiming(
				0,
				{ duration: 550, easing: Easing.in(Easing.cubic) },
				done => {
					if (done) runOnJS(onFinish)()
				}
			)
		)
	}, [])

	const logoStyle = useAnimatedStyle(() => ({
		opacity: logoOpacity.value,
		transform: [{ scale: logoScale.value }]
	}))

	const lineStyle = useAnimatedStyle(() => ({
		width: lineWidth.value
	}))

	const subtitleStyle = useAnimatedStyle(() => ({
		opacity: subtitleOpacity.value
	}))

	const rootStyle = useAnimatedStyle(() => ({
		opacity: rootOpacity.value
	}))

	return (
		<Animated.View style={[styles.root, rootStyle]}>
			{/* ── SVG Логотип «A» ───────────────────────────────────────────────── */}
			<Animated.View style={[styles.logoWrap, logoStyle]}>
				<Svg
					width={68}
					height={76}
					viewBox="0 0 100 100"
					fill="none"
				>
					{/* Левая нога А — 5 линий */}
					{[0, 1.5, 3, 4.5, 6].map((offset, i) => (
						<Line
							key={`l${i}`}
							x1={10 + offset}
							y1={95}
							x2={50 + offset * 0.3}
							y2={8}
							stroke="white"
							strokeWidth="1"
							strokeLinecap="round"
						/>
					))}

					{/* Правая нога А — 5 линий */}
					{[0, 1.5, 3, 4.5, 6].map((offset, i) => (
						<Line
							key={`r${i}`}
							x1={90 - offset}
							y1={95}
							x2={50 - offset * 0.3}
							y2={8}
							stroke="white"
							strokeWidth="1"
							strokeLinecap="round"
						/>
					))}

					{/* Перекладина А — 5 линий синий акцент */}
					{[0, 1.5, 3, 4.5, 6].map((offset, i) => (
						<Line
							key={`m${i}`}
							x1={28}
							y1={58 + offset}
							x2={72}
							y2={58 + offset}
							stroke="#0070f3"
							strokeWidth="1"
							strokeLinecap="round"
						/>
					))}
				</Svg>
			</Animated.View>
			{/* ── Горизонтальная синяя линия ────────────────────────────────────── */}
			<Animated.View style={[styles.accentLine, lineStyle]} />

			{/* ── Буквы ARIONEL ─────────────────────────────────────────────────── */}
			<View style={styles.lettersRow}>
				{LETTERS.map((char, i) => (
					<AnimatedLetter
						key={i}
						char={char}
						delay={LETTER_START + i * LETTER_STEP}
					/>
				))}
			</View>

			{/* ── Подзаголовок ─────────────────────────────────────────────────── */}
			<Animated.Text style={[styles.subtitle, subtitleStyle]}>
				трекер расходов
			</Animated.Text>
		</Animated.View>
	)
}

// стили
const styles = StyleSheet.create({
	root: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: '#000000',
		alignItems: 'center',
		justifyContent: 'center',
		zIndex: 999
	},
	logoWrap: {
		marginBottom: 22
	},
	accentLine: {
		height: 2,
		backgroundColor: '#0070f3',
		borderRadius: 1,
		marginBottom: 26
	},
	lettersRow: {
		flexDirection: 'row',
		alignItems: 'center'
	},
	letter: {
		fontSize: 30,
		fontFamily: 'Geist_700Bold',
		color: '#ededed',
		letterSpacing: 7
	},
	subtitle: {
		marginTop: 14,
		fontSize: 12,
		fontFamily: 'Geist_400Regular',
		color: '#a1a1a1',
		letterSpacing: 5,
		textTransform: 'uppercase'
	}
})
