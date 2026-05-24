import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';

import { Header } from './Header';

import { CONTENT_MAX_WIDTH, colors, spacing } from '@/lib/theme';

type ScreenProps = {
  title: string;
  showBack?: boolean;
  /** Optional element on the right of the header bar. */
  headerRight?: ReactNode;
  children: ReactNode;
  /** Gap between body children (default 16). */
  gap?: number;
  paddingVertical?: number;
  paddingHorizontal?: number;
  /**
   * When false, the body is not wrapped in a ScrollView — use for screens that
   * own their own scroller (e.g. a FlatList). Default true.
   */
  scroll?: boolean;
  contentStyle?: ViewStyle;
};

export function Screen({
  title,
  showBack = true,
  headerRight,
  children,
  gap = spacing.md,
  paddingVertical = spacing.lg,
  paddingHorizontal = spacing.lg,
  scroll = true,
  contentStyle,
}: ScreenProps) {
  // Centered, phone-width body so the layout looks right on desktop too.
  const body = (
    <View
      style={[
        styles.centered,
        { gap, paddingVertical, paddingHorizontal },
        !scroll && styles.fill,
        contentStyle,
      ]}>
      {children}
    </View>
  );

  return (
    <View style={styles.root}>
      <Header title={title} showBack={showBack} right={headerRight} />
      {scroll ? (
        <ScrollView style={styles.fill} contentContainerStyle={styles.scrollContent}>
          {body}
        </ScrollView>
      ) : (
        body
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bodyBg,
  },
  fill: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  centered: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
  },
});
