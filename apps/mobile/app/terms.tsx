// Terms gate — final step of signup. Community standards + ToS must be
// accepted; marketing is optional. On accept, the signup is created and
// the user is sent to verify their email.
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, router } from 'expo-router';
import { colors, fontFamilies, fontSizes, radii, spacing } from '@app/ui/tokens';
import { Button, Checkbox, useDir } from '../components/ui';
import { clearPendingSignup, getPendingSignup, signUpWithEmail } from '../lib/auth';

export default function Terms() {
  const { t, i18n } = useTranslation();
  const { textDir, alignStart } = useDir();

  const [community, setCommunity] = useState(false);
  const [tos, setTos] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  if (!getPendingSignup()) return <Redirect href="/auth" />;

  const canAccept = community && tos;

  async function onAccept() {
    const pending = getPendingSignup();
    if (!pending || !canAccept) return;
    setFormError(null);
    setBusy(true);
    const { data, error } = await signUpWithEmail(
      { ...pending, marketingOptIn: marketing },
      i18n.language?.slice(0, 2) ?? 'fr',
    );
    setBusy(false);
    if (error) { setFormError(error.message || t('common.error')); return; }
    const email = pending.email;
    clearPendingSignup();
    // With email confirmation off, signup returns a session → go straight in.
    // Otherwise, ask the user to verify their email first.
    if (data.session) router.replace('/search');
    else router.replace({ pathname: '/verify-email', params: { email } });
  }

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={{ alignItems: alignStart, width: '100%' }}>
          <Text style={[styles.title, textDir]}>{t('terms.title')}</Text>
        </View>

        <View style={styles.block}>
          <Text style={[styles.blockTitle, textDir]}>{t('terms.missionTitle')}</Text>
          <Text style={[styles.blockBody, textDir]}>{t('terms.missionBody')}</Text>
        </View>

        <View style={styles.block}>
          <Text style={[styles.blockTitle, textDir]}>{t('terms.communityTitle')}</Text>
          <Text style={[styles.blockBody, textDir]}>{t('terms.communityBody')}</Text>
          <Checkbox checked={community} onChange={setCommunity}>
            <Text style={[styles.checkLabel, textDir]}>{t('terms.communityRead')}</Text>
          </Checkbox>
        </View>

        <View style={styles.block}>
          <Text style={[styles.blockTitle, textDir]}>{t('terms.tosTitle')}</Text>
          <Checkbox checked={tos} onChange={setTos}>
            <Text style={[styles.checkLabel, textDir]}>{t('terms.tosBody')}</Text>
          </Checkbox>
        </View>

        <Checkbox checked={marketing} onChange={setMarketing}>
          <Text style={[styles.checkLabel, textDir]}>{t('terms.marketingOptIn')}</Text>
        </Checkbox>

        {formError ? <Text style={[styles.formError, textDir]}>{formError}</Text> : null}

        <Button
          label={t('terms.accept')}
          onPress={onAccept}
          disabled={!canAccept}
          loading={busy}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  scroll: { paddingHorizontal: spacing[6], paddingTop: spacing[6], paddingBottom: spacing[10], gap: spacing[6] },

  title: { fontFamily: fontFamilies.display, fontSize: fontSizes['2xl'], fontWeight: '600', color: colors.ink.DEFAULT },

  block: { gap: spacing[3], backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: radii.lg, padding: spacing[5] },
  blockTitle: { fontSize: fontSizes.lg, fontWeight: '600', color: colors.ink.DEFAULT },
  blockBody: { fontSize: fontSizes.sm, lineHeight: fontSizes.sm * 1.6, color: colors.ink.muted },
  checkLabel: { fontSize: fontSizes.sm, lineHeight: fontSizes.sm * 1.5, color: colors.ink.DEFAULT },

  formError: { fontSize: fontSizes.sm, color: colors.danger.DEFAULT },
});