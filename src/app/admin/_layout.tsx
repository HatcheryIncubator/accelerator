import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/lib/theme';

export default function AdminLayout() {
  const { participant, participantLoading } = useAuth();

  // Hold while the participant row resolves so we don't bounce admins out.
  if (participantLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.blue} />
      </View>
    );
  }

  // Belt-and-suspenders: RLS already gates the data, but don't render the admin
  // shell to a non-admin who types the URL.
  if (!participant || participant.role !== 'admin') {
    return <Redirect href="/home" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bodyBg },
});
