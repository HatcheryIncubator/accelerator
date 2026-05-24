import { type ReactNode, useId, useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { colors, radius, typography } from '@/lib/theme';

type TextFieldProps = TextInputProps & {
  label: string;
  /** Render a custom control (e.g. a picker) instead of the default TextInput. */
  children?: ReactNode;
};

export function TextField({ label, children, style, ...inputProps }: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  // Web autofill needs a stable id on the rendered <input>; fall back to a
  // generated one when a call site doesn't pass a semantic id/nativeID.
  const generatedId = useId();

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children ?? (
        <TextInput
          {...inputProps}
          id={inputProps.id ?? inputProps.nativeID ?? generatedId}
          onFocus={(e) => {
            setFocused(true);
            inputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            inputProps.onBlur?.(e);
          }}
          placeholderTextColor={colors.muted}
          style={[
            styles.input,
            focused && styles.inputFocused,
            // react-native-web: kill the default browser focus outline.
            Platform.OS === 'web' && ({ outlineStyle: 'none' } as object),
            style,
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 6,
  },
  label: {
    ...typography.fieldLabel,
    color: colors.muted,
  },
  input: {
    height: 52,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius,
    paddingHorizontal: 14,
    ...typography.body,
    color: colors.text,
  },
  inputFocused: {
    borderColor: colors.blue,
  },
});
