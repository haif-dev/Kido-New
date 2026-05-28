import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fontFamilies, fontSizes, radii, spacing } from '@app/ui/tokens';
import { Button, useDir } from '../../components/ui';
import { signOut, useSession } from '../../lib/auth';

export default function AccountTab() {
  const { t } = useTranslation();
  const { textDir, alignStart } = useDir();
  const { session } = useSession();

  const user = session?.user;
  const meta = (user?.user_metadata ?? {}) as { first_name?: string; last_name?: string; role?: string };
  const firstName = meta.first_name ?? '';
  const initial = (firstName || user?.email || '?').charAt(0).toUpperCase();

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{initial}</Text></View>
        <View style={{ flex: 1, alignItems: alignStart }}>
          {firstName ? (
            <Text style={[styles.name, textDir]}>{t('auth.welcomeBack', { name: firstName })}</Text>
          ) : null}
          <Text style={[styles.email, textDir]}>{user?.email ?? ''}</Text>
        </View>
      </View>

      <View style={{ flex: 1 }} />

      <Button label={t('auth.signOut')} variant="secondary" onPress={() => { void signOut(); }} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas, padding: spacing[6], paddingTop: spacing[8] },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing[4] },
  avatar: { width: 64, height: 64, borderRadius: radii.pill, backgroundColor: colors.primary[500], alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.primary.contrast, fontSize: fontSizes['2xl'], fontWeight: '700', fontFamily: fontFamilies.display },
  name: { fontFamily: fontFamilies.display, fontSize: fontSizes.xl, fontWeight: '600', color: colors.ink.DEFAULT },
  email: { marginTop: spacing[1], fontSize: fontSizes.sm, color: colors.ink.muted },
  role: { marginTop: spacing[1], fontSize: fontSizes.sm, color: colors.primary[600], fontWeight: '600' },
});