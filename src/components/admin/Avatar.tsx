import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/lib/theme';

export function initials(first: string | null, last: string | null): string {
  const a = (first ?? '').trim()[0] ?? '';
  const b = (last ?? '').trim()[0] ?? '';
  return (a + b).toUpperCase() || '?';
}

export function Avatar({
  first,
  last,
  size = 36,
  bg = colors.blueBright,
}: {
  first: string | null;
  last: string | null;
  size?: number;
  bg?: string;
}) {
  return (
    <View
      style={[styles.circle, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg }]}>
      <Text style={[styles.text, { fontSize: Math.round(size * 0.4) }]}>{initials(first, last)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center' },
  text: { color: colors.surface, fontFamily: fonts.semibold },
});
