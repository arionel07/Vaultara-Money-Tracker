import { useTheme } from '@/hooks/useTheme.hook'
import { StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function BudgetScreen() {
	const { colors } = useTheme()
	const insets = useSafeAreaInsets()
}

const styles = StyleSheet.create({
	root: {
		flex: 1
	},
	scroll: {
		paddingHorizontal: 16,
		gap: 12
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 4
	},
	backBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 2,
		marginBottom: 4,
		paddingVertical: 4
	},
	addButton: {
		width: 44,
		height: 44,
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center'
	},
	summaryRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginVertical: 10
	},
	percentCircle: {
		width: 64,
		height: 64,
		borderRadius: 32,
		borderWidth: 2,
		alignItems: 'center',
		justifyContent: 'center'
	},
	track: {
		height: 6,
		borderRadius: 3,
		overflow: 'hidden'
	},
	fill: {
		height: 6,
		borderRadius: 3
	},
	emptyCard: {
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 40
	},
	budgetHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10
	},
	categoryIcon: {
		width: 40,
		height: 40,
		borderRadius: 10,
		alignItems: 'center',
		justifyContent: 'center'
	},
	pctBadge: {
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 6,
		borderWidth: 1
	}
})
