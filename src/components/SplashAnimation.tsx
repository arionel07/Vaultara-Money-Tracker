import React, { useEffect } from 'react'
import { StyleSheet } from 'react-native'
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

interface SplashAnimationProps {
	onFinish: () => void
}

export const SplashAnimation: React.FC<SplashAnimationProps> = ({
	onFinish
}) => {
	const scale = useSharedValue(0.7)
	const opacity = useSharedValue(0)
	const rootOpacity = useSharedValue(1)

	useEffect(() => {
		// ── 1. Буква А появляется с пружиной ─────────────────────────────────
		opacity.value = withTiming(1, {
			duration: 400,
			easing: Easing.out(Easing.cubic)
		})
		scale.value = withSpring(1, {
			damping: 12,
			stiffness: 100
		})

		// ── 2. Пауза → плавно гаснет → onFinish ──────────────────────────────
		rootOpacity.value = withDelay(
			1400,
			withTiming(
				0,
				{ duration: 500, easing: Easing.in(Easing.cubic) },
				done => {
					if (done) runOnJS(onFinish)()
				}
			)
		)
	}, [])

	const logoStyle = useAnimatedStyle(() => ({
		opacity: opacity.value,
		transform: [{ scale: scale.value }]
	}))

	const rootStyle = useAnimatedStyle(() => ({
		opacity: rootOpacity.value
	}))

	return (
		<Animated.View style={[styles.root, rootStyle]}>
			<Animated.View style={logoStyle}>
				<Svg
					width={160}
					height={170}
					viewBox="0 0 100 100"
					fill="none"
				>
					{/* Левая нога А */}
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

					{/* Правая нога А */}
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

					{/* Перекладина — синий акцент */}
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
		</Animated.View>
	)
}

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
		zIndex: 9999
	}
})
