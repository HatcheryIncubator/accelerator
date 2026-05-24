import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Screen } from '@/components/Screen';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate, formatDuration } from '@/lib/format';
import { supabase } from '@/lib/supabase';
import { colors, radius, typography } from '@/lib/theme';
import type { SessionWithVenture } from '@/lib/types';
import type { PressableState } from '@/lib/pressable';

/** Confirm dialog that works on web (window.confirm) and native (Alert). */
function confirmDelete(): Promise<boolean> {
  const message = 'Delete this session? This cannot be undone.';
  if (Platform.OS === 'web') {
    return Promise.resolve(typeof window === 'undefined' ? true : window.confirm(message));
  }
  return new Promise((resolve) => {
    Alert.alert('Delete session', message, [
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
      { text: 'Delete', style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
}

export default function ViewSessionsScreen() {
  const router = useRouter();
  const { participant } = useAuth();
  const [sessions, setSessions] = useState<SessionWithVenture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!participant) return;
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from('sessions')
      .select('*, ventures(name)')
      .eq('participant_id', participant.id)
      .order('check_in_at', { ascending: false });
    if (fetchError) setError(fetchError.message);
    else setSessions((data as SessionWithVenture[] | null) ?? []);
    setLoading(false);
  }, [participant]);

  // Refetch on focus so edits made in the editor show on return.
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  async function onDelete(id: string) {
    if (!(await confirmDelete())) return;
    setError(null);
    setDeletingId(id);
    const { error: deleteError } = await supabase.from('sessions').delete().eq('id', id);
    setDeletingId(null);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }

  function renderRow({ item }: { item: SessionWithVenture }) {
    const meta = item.check_out_at
      ? `${formatDate(item.check_in_at)} · ${formatDuration(item.check_in_at, item.check_out_at)}`
      : `${formatDate(item.check_in_at)} · In progress`;
    const ventureName = item.ventures?.name ?? 'Your venture';
    const openEditor = () => router.push({ pathname: '/session/[id]', params: { id: item.id } });

    return (
      // The whole card opens the editor. It is intentionally NOT a `button`
      // (no accessibilityRole) so it renders as a <div> on web — otherwise it
      // would be a <button> wrapping the icon <button>s (invalid HTML). The
      // icon buttons below carry the accessible actions. The icons stop
      // propagation so tapping them doesn't also trigger the card.
      <Pressable
        onPress={openEditor}
        style={({ pressed, hovered }: PressableState) => [
          styles.row,
          (pressed || (Platform.OS === 'web' && hovered)) && styles.rowActive,
        ]}>
        <View style={styles.rowText}>
          <Text style={styles.venture}>{ventureName}</Text>
          <Text style={styles.meta}>{meta}</Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Edit session for ${ventureName}`}
            hitSlop={8}
            onPress={(e) => {
              e.stopPropagation();
              openEditor();
            }}
            style={iconStyle}>
            <MaterialIcons name="edit" size={22} color={colors.blue} />
          </Pressable>

          {deletingId === item.id ? (
            <View style={styles.iconBox}>
              <ActivityIndicator color={colors.error} />
            </View>
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Delete session for ${ventureName}`}
              hitSlop={8}
              onPress={(e) => {
                e.stopPropagation();
                void onDelete(item.id);
              }}
              style={iconStyle}>
              <MaterialIcons name="delete" size={22} color={colors.error} />
            </Pressable>
          )}
        </View>
      </Pressable>
    );
  }

  return (
    <Screen title="Your sessions" scroll={false} paddingHorizontal={24} paddingVertical={16} gap={8}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.blue} />
        </View>
      ) : sessions.length === 0 ? (
        <Text style={styles.subtext}>No sessions yet.</Text>
      ) : (
        <>
          <Text style={styles.subtext}>Edit or delete a session.</Text>
          {error && <Text style={styles.error}>{error}</Text>}
          <FlatList
            data={sessions}
            keyExtractor={(item) => item.id}
            renderItem={renderRow}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </>
      )}
    </Screen>
  );
}

const iconStyle = ({ pressed, hovered }: PressableState) => [
  styles.iconBox,
  (pressed || (Platform.OS === 'web' && hovered)) && styles.iconActive,
];

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtext: {
    ...typography.subtext,
    color: colors.muted,
  },
  error: {
    ...typography.subtext,
    color: colors.error,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
  },
  separator: {
    height: 8,
  },
  row: {
    minHeight: 88,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius,
    paddingTop: 16,
    paddingRight: 16,
    paddingBottom: 14,
    paddingLeft: 14,
  },
  rowActive: {
    backgroundColor: '#f8f8f7',
  },
  rowText: {
    flex: 1,
    gap: 8,
  },
  venture: {
    ...typography.button, // 18 / Semibold
    color: colors.blueDeep,
  },
  meta: {
    ...typography.subtext, // 16
    color: colors.muted,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: radius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconActive: {
    backgroundColor: '#f0f0f3',
  },
});
