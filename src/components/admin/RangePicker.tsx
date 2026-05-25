import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { RANGE_LABELS, type DateRange } from '@/hooks/useAdminDashboard';
import { colors, radius, typography } from '@/lib/theme';
import type { PressableState } from '@/types';

const ORDER: DateRange[] = ['last7', 'last30', 'cohort'];

export function RangePicker({ value, onChange }: { value: DateRange; onChange: (r: DateRange) => void }) {
  // Web: a real <select> is keyboard/screen-reader accessible and prerenders safely.
  if (Platform.OS === 'web') {
    return (
      <select
        value={value}
        onChange={(e) => onChange((e.target as HTMLSelectElement).value as DateRange)}
        style={webSelectStyle}>
        {ORDER.map((r) => (
          <option key={r} value={r}>
            {RANGE_LABELS[r]}
          </option>
        ))}
      </select>
    );
  }
  return <NativeRange value={value} onChange={onChange} />;
}

function NativeRange({ value, onChange }: { value: DateRange; onChange: (r: DateRange) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Pressable accessibilityRole="button" style={styles.control} onPress={() => setOpen(true)}>
        <Text style={styles.controlText}>{RANGE_LABELS[value]}</Text>
        <MaterialIcons name="arrow-drop-down" size={20} color={colors.surface} />
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            {ORDER.map((r) => (
              <Pressable
                key={r}
                style={({ pressed }: PressableState) => [styles.option, pressed && styles.optionActive]}
                onPress={() => {
                  onChange(r);
                  setOpen(false);
                }}>
                <Text style={styles.optionText}>{RANGE_LABELS[r]}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

// DOM style for the web <select>, sized to sit in the compact navy header bar.
const webSelectStyle = {
  height: 32,
  borderRadius: radius,
  border: `1px solid ${colors.surface}`,
  backgroundColor: colors.surface,
  color: colors.text,
  fontSize: 14,
  fontFamily: 'OpenSans_600SemiBold',
  padding: '0 8px',
  cursor: 'pointer',
} as const;

const styles = StyleSheet.create({
  control: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    height: 32,
    paddingHorizontal: 10,
    borderRadius: radius,
    borderWidth: 1,
    borderColor: colors.surface,
  },
  controlText: { ...typography.subtext, fontSize: 14, color: colors.surface },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 24 },
  sheet: { backgroundColor: colors.surface, borderRadius: radius, overflow: 'hidden' },
  option: { paddingVertical: 16, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  optionActive: { backgroundColor: '#f4f4f3' },
  optionText: { ...typography.body, color: colors.text },
});
