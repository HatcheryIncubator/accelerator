import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CONTENT_MAX_WIDTH, colors, spacing, typography } from '@/lib/theme';

type HeaderProps = {
  title: string;
  showBack?: boolean;
  /** Optional element rendered on the right side of the bar (e.g. an icon button). */
  right?: ReactNode;
};

export function Header({ title, showBack = true, right }: HeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.bar}>
      <View style={styles.inner}>
        {showBack && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={8}
            onPress={() => router.back()}
            style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={colors.surface} />
          </Pressable>
        )}
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {right ? <View style={styles.right}>{right}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Full-width navy bar; only the inner content respects the max width.
  bar: {
    backgroundColor: colors.blue,
    height: 72,
  },
  inner: {
    flex: 1,
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md - 4, // 12
    paddingTop: 16,
    paddingRight: 16,
    paddingBottom: 14,
    paddingLeft: 14,
  },
  backButton: {
    marginRight: -4,
  },
  title: {
    ...typography.headerBar,
    color: colors.surface,
    flex: 1,
  },
  right: {
    marginLeft: 'auto',
  },
});
