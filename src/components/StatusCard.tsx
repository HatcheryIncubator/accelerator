import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, typography } from '@/lib/theme';

type StatusCardProps = {
  title: string;
  body: string;
};

export function StatusCard({ title, body }: StatusCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.accent} />
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.goldBg,
    borderRadius: radius,
    overflow: 'hidden',
  },
  accent: {
    width: 4,
    backgroundColor: colors.gold,
  },
  content: {
    flex: 1,
    padding: 16,
    gap: 6,
  },
  title: {
    ...typography.button, // 18 / Semibold
    color: '#5a4900',
  },
  body: {
    ...typography.subtext, // 16 / Regular
    color: '#4a3d00',
  },
});
