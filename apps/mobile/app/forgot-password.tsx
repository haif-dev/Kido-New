// Forgot password — request a reset link. Completing the reset (setting a
// new password from the email link) needs deep-link handling, wired later
// alongside the email-verification deep link.
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors, fontFamilies, fontSizes, spacing } from '@app/ui/tokens';
import { email as emailSchema } from '@app/lib/validation';
import { Button, TextField, useDir } from '../components/ui';
import { sendPasswordReset } from '../lib/auth';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const { textDir, alignStart } = useDir();
  const [emailValue, setEmailValue] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSend() {
    const parsed = emailSchema.safeParse(emailValue.trim());
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? t('auth.required')); return; }
    setError(undefined);
    setBusy(true);
    await sendPasswordReset(emailValue.trim());
    setBusy(false);
    // Always show success — never reveal whether an account exists.
    setSent(true);
  }

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={{ alignItems: alignStart, width: '100%' }}>
            <Text style={[styles.title, textDir]}>{t('auth.resetTitle')}</Text>
            <Text style={[styles.body, textDir]}>
              {sent ? t('auth.resetSent') : t('auth.resetBody')}
            </Text>
          </View>

          {!sent && (
            <>
              <TextField
                label={t('auth.emailPlaceholder')}
                value={emailValue}
                onChangeText={setEmailValue}
                keyboardType="email-address"
                autoComplete="email"
                error={error}
              />
              <Button label={t('auth.resetSend')} onPress={onSend} loading={busy} />
            </>
          )}

          <Pressable onPress={() => router.replace('/auth')} style={{ alignSelf: 'center' }} hitSlop={8}>
            <Text style={styles.link}>{t('auth.signIn')}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  scroll: { paddingHorizontal: spacing[6], paddingTop: spacing[8], paddingBottom: spacing[10], gap: spacing[6] },
  title: { fontFamily: fontFamilies.display, fontSize: fontSizes['2xl'], fontWeight: '600', color: colors.ink.DEFAULT },
  body: { marginTop: spacing[2], fontSize: fontSizes.base, lineHeight: fontSizes.base * 1.5, color: colors.ink.muted },
  link: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.primary[600] },
});