import { Text, View } from 'react-native'

export default function DashboardScreen() {
	return (
		<View
			style={{
				flex: 1,
				backgroundColor: '#000000',
				alignItems: 'center',
				justifyContent: 'center'
			}}
		>
			<Text style={{ color: '#ededed', fontSize: 18 }}>Дашборд</Text>
		</View>
	)
}
