import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/lib/theme';

/** Profile + sign-out icons for the home header (shared by participant + admin). */
export function HeaderActions() {
  const router = useRouter();
  const { signOut } = useAuth();

  async function handleSignOut() {
    await signOut();
    router.replace('/login');
  }

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Edit profile"
        hitSlop={8}
        onPress={() => router.push('/profile')}>
        <MaterialIcons name="person" size={22} color={colors.surface} />
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Sign out"
        hitSlop={8}
        onPress={handleSignOut}>
        <MaterialIcons name="logout" size={20} color={colors.surface} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
});
