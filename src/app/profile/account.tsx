import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { TextButton } from '@/components/TextButton';
import { TextField } from '@/components/TextField';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { colors, radius, typography } from '@/lib/theme';
import type { PressableState } from '@/lib/pressable';

const MIN_PASSWORD = 8;

export default function AccountScreen() {
  const router = useRouter();
  const { participant, signOut } = useAuth();

  // --- Change email ---
  const [email, setEmail] = useState('');
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  // --- Change password ---
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwDone, setPwDone] = useState(false);

  // --- Delete account ---
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function updateEmail() {
    setEmailError(null);
    setEmailSent(false);
    const next = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next)) {
      setEmailError('Enter a valid email address.');
      return;
    }
    if (next.toLowerCase() === participant?.email?.toLowerCase()) {
      setEmailError('That is already your email.');
      return;
    }
    setEmailSaving(true);
    try {
      // Supabase's secure email-change flow sends confirmation links to BOTH the
      // old and new address; the change only lands after they're clicked. The
      // redirect must be allow-listed in Supabase Auth → URL Configuration.
      const { error } = await supabase.auth.updateUser(
        { email: next },
        { emailRedirectTo: Linking.createURL('/') },
      );
      if (error) throw error;
      setEmail('');
      setEmailSent(true);
    } catch (e) {
      setEmailError(e instanceof Error ? e.message : 'Could not start the email change.');
    } finally {
      setEmailSaving(false);
    }
  }

  async function updatePassword() {
    setPwError(null);
    setPwDone(false);
    if (password.length < MIN_PASSWORD) {
      setPwError(`Password must be at least ${MIN_PASSWORD} characters.`);
      return;
    }
    if (password !== confirm) {
      setPwError('Passwords do not match.');
      return;
    }
    setPwSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setPassword('');
      setConfirm('');
      setPwDone(true);
    } catch (e) {
      setPwError(e instanceof Error ? e.message : 'Could not update your password.');
    } finally {
      setPwSaving(false);
    }
  }

  async function deleteAccount() {
    setDeleteError(null);
    setDeleting(true);
    try {
      const { error } = await supabase.rpc('delete_own_account');
      if (error) throw error;
      // The auth user is gone; clear the local session and let the gate route to login.
      await signOut().catch(() => {});
      router.replace('/login');
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : 'Could not delete your account.');
      setDeleting(false);
    }
  }

  return (
    <Screen title="Account" gap={12}>
      <Text style={styles.sectionLabel}>Change email</Text>
      <Text style={styles.note}>Current: {participant?.email ?? '—'}</Text>
      <TextField
        label="New email"
        placeholder="you@example.com"
        value={email}
        onChangeText={(t) => {
          setEmail(t);
          setEmailSent(false);
        }}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
      />
      {emailError && <Text style={styles.error}>{emailError}</Text>}
      {emailSent && (
        <Text style={styles.success}>
          Confirmation links sent. Check both your old and new inbox to finish the change.
        </Text>
      )}
      {emailSaving ? (
        <View style={styles.busy}>
          <ActivityIndicator color={colors.surface} />
        </View>
      ) : (
        <PrimaryButton label="Update email" onPress={updateEmail} />
      )}

      <View style={styles.divider} />

      <Text style={styles.sectionLabel}>Change password</Text>
      <TextField
        label="New password"
        placeholder="New password"
        value={password}
        onChangeText={(t) => {
          setPassword(t);
          setPwDone(false);
        }}
        secureTextEntry
        autoCapitalize="none"
        textContentType="newPassword"
      />
      <TextField
        label="Confirm new password"
        placeholder="Re-enter new password"
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry
        autoCapitalize="none"
        textContentType="newPassword"
      />
      {pwError && <Text style={styles.error}>{pwError}</Text>}
      {pwDone && <Text style={styles.success}>Password updated.</Text>}
      {pwSaving ? (
        <View style={styles.busy}>
          <ActivityIndicator color={colors.surface} />
        </View>
      ) : (
        <PrimaryButton label="Update password" onPress={updatePassword} />
      )}

      <View style={styles.divider} />

      <Text style={styles.sectionLabel}>Delete account</Text>
      <Text style={styles.note}>
        This permanently deletes your account and all of your sessions. This can&apos;t be undone.
      </Text>
      {deleteError && <Text style={styles.error}>{deleteError}</Text>}

      {!confirmingDelete ? (
        <DestructiveButton label="Delete account" onPress={() => setConfirmingDelete(true)} />
      ) : deleting ? (
        <View style={[styles.busy, styles.busyDanger]}>
          <ActivityIndicator color={colors.surface} />
        </View>
      ) : (
        <>
          <Text style={styles.confirmPrompt}>Are you sure? This is permanent.</Text>
          <DestructiveButton label="Yes, delete my account" onPress={deleteAccount} />
          <TextButton label="Cancel" onPress={() => setConfirmingDelete(false)} />
        </>
      )}
    </Screen>
  );
}

function DestructiveButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed, hovered }: PressableState) => [
        styles.danger,
        (pressed || (Platform.OS === 'web' && hovered)) && styles.dangerActive,
      ]}>
      <Text style={styles.dangerLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    ...typography.fieldLabel,
    color: colors.blueDeep,
  },
  note: {
    ...typography.subtext,
    color: colors.muted,
  },
  error: {
    ...typography.subtext,
    color: colors.error,
  },
  success: {
    ...typography.subtext,
    color: colors.blueBright,
  },
  confirmPrompt: {
    ...typography.subtext,
    color: colors.error,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  busy: {
    width: '100%',
    height: 56,
    borderRadius: radius,
    backgroundColor: colors.blueDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  busyDanger: {
    backgroundColor: colors.error,
  },
  danger: {
    width: '100%',
    height: 56,
    borderRadius: radius,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerActive: {
    opacity: 0.85,
  },
  dangerLabel: {
    ...typography.button,
    color: colors.surface,
  },
});
