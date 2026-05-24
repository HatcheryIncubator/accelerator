import { useId, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, typography } from '@/lib/theme';
import type { PressableState } from '@/types';
import type { Venture } from '@/types';

type VenturePickerProps = {
  ventures: Venture[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  placeholder?: string;
};

export function VenturePicker({
  ventures,
  selectedId,
  onSelect,
  placeholder = 'Select a venture…',
}: VenturePickerProps) {
  const selected = ventures.find((v) => v.id === selectedId) ?? null;
  const id = useId();

  // Web: a real <select> renders/behaves natively and is keyboard-accessible.
  if (Platform.OS === 'web') {
    return (
      <select
        id={id}
        value={selectedId ?? ''}
        onChange={(e) => onSelect((e.target as HTMLSelectElement).value)}
        style={webSelectStyle}>
        <option value="" disabled>
          {placeholder}
        </option>
        {ventures.map((v) => (
          <option key={v.id} value={v.id}>
            {v.name}
          </option>
        ))}
      </select>
    );
  }

  return <NativePicker {...{ ventures, selected, onSelect, placeholder }} />;
}

function NativePicker({
  ventures,
  selected,
  onSelect,
  placeholder,
}: {
  ventures: Venture[];
  selected: Venture | null;
  onSelect: (id: string) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        accessibilityRole="button"
        style={styles.control}
        onPress={() => setOpen(true)}>
        <Text style={[styles.controlText, !selected && styles.placeholder]}>
          {selected ? selected.name : placeholder}
        </Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            {ventures.map((v) => (
              <Pressable
                key={v.id}
                style={({ pressed }: PressableState) => [styles.option, pressed && styles.optionActive]}
                onPress={() => {
                  onSelect(v.id);
                  setOpen(false);
                }}>
                <Text style={styles.optionText}>{v.name}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

// DOM style object for the web <select>; mirrors the TextField input.
const webSelectStyle = {
  width: '100%',
  height: 52,
  border: `1px solid ${colors.border}`,
  borderRadius: radius,
  padding: '0 14px',
  fontSize: 18,
  fontFamily: 'OpenSans_400Regular',
  color: colors.text,
  backgroundColor: colors.surface,
  outline: 'none',
} as const;

const styles = StyleSheet.create({
  control: {
    height: 52,
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius,
    paddingHorizontal: 14,
  },
  controlText: {
    ...typography.body,
    color: colors.text,
  },
  placeholder: {
    color: colors.muted,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 24,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderRadius: radius,
    overflow: 'hidden',
  },
  option: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionActive: {
    backgroundColor: '#f4f4f3',
  },
  optionText: {
    ...typography.body,
    color: colors.text,
  },
});
