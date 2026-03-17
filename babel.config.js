module.exports = function (api) {
	api.cache(true)
	return {
		presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }]],
		plugins: [
			// Нужен для корректной работы Reanimated (требует victory-native)
			'react-native-reanimated/plugin'
		]
	}
}
