import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, typography } from '@/lib/theme';

type DisplayCardProps = {
  label: string;
  value: string;
};

export function DisplayCard({ label, value }: DisplayCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    borderRadius: radius,
    paddingTop: 16,
    paddingRight: 16,
    paddingBottom: 14,
    paddingLeft: 14,
    gap: 4,
  },
  label: {
    ...typography.fieldLabel, // 16 / Semibold
    color: colors.muted,
  },
  value: {
    ...typography.button, // 18 / Semibold
    color: colors.text,
  },
});
