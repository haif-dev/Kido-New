// Account-type picker — second step of signup. Sets the role on the
// pending signup, then routes to the terms gate which finalizes it.
// "Nanny" is a sitter variant (role 'sitter' + isNanny metadata).
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, router } from 'expo-router';
import { colors, fontFamilies, fontSizes, radii, spacing } from '@app/ui/tokens';
import type { AccountRole } from '@app/lib/types';
import { Button, useDir } from '../components/ui';
import { getPendingSignup, patchPendingSignup } from '../lib/auth';

type Choice = 'parent' | 'sitter' | 'nanny';
const OPTIONS: { key: Choice; labelKey: string; role: AccountRole; isNanny: boolean }[] = [
  { key: 'parent', labelKey: 'auth.iLookFor', role: 'parent', isNanny: false },
  { key: 'sitter', labelKey: 'auth.iAmSitter', role: 'sitter', isNanny: false },
  { key: 'nanny',  labelKey: 'auth.iAmNanny',  role: 'sitter', isNanny: true },
];

export default function AccountType() {
  const { t } = useTranslation();
  const { textDir, alignStart, rtl } = useDir();
  const [choice, setChoice] = useState<Choice | null>(null);

  // If someone deep-links here without an in-progress signup, bounce back.
  if (!getPendingSignup()) return <Redirect href="/auth" />;

  function onContinue() {
    const opt = OPTIONS.find((o) => o.key === choice);
    if (!opt) return;
    patchPendingSignup({ role: opt.role, isNanny: opt.isNanny });
    router.push('/terms');
  }

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={{ alignItems: alignStart, width: '100%' }}>
          <Text style={[styles.title, textDir]}>{t('auth.accountTypeTitle')}</Text>
          <Text style={[styles.subtitle, textDir]}>{t('auth.accountTypeSubtitle')}</Text>
        </View>

        <View style={styles.options}>
          {OPTIONS.map((o) => {
            const selected = choice === o.key;
            return (
              <Pressable
                key={o.key}
                onPress={() => setChoice(o.key)}
                style={[styles.option, rtl && styles.rowReverse, selected && styles.optionOn]}
              >
                <View style={[styles.radio, selected && styles.radioOn]}>
                  {selected ? <View style={styles.radioDot} /> : null}
                </View>
                <Text style={[styles.optionLabel, textDir, selected && styles.optionLabelOn]}>
                  {t(o.labelKey)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Button label={t('common.continue')} onPress={onContinue} disabled={!choice} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  scroll: { paddingHorizontal: spacing[6], paddingTop: spacing[8], paddingBottom: spacing[10], gap: spacing[8] },
  rowReverse: { flexDirection: 'row-reverse' },

  title: { fontFamily: fontFamilies.display, fontSize: fontSizes['3xl'], fontWeight: '600', color: colors.ink.DEFAULT, letterSpacing: -0.5 },
  subtitle: { marginTop: spacing[2], fontSize: fontSizes.base, color: colors.ink.muted },

  options: { gap: spacing[3] },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[4],
    backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.line,
    borderRadius: radii.lg, paddingVertical: spacing[5], paddingHorizontal: spacing[5],
  },
  optionOn: { borderColor: colors.primary[500], backgroundColor: colors.primary[50] },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: colors.lineStrong, alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: colors.primary[500] },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary[500] },
  optionLabel: { flex: 1, fontSize: fontSizes.lg, fontWeight: '500', color: colors.ink.DEFAULT },
  optionLabelOn: { color: colors.primary[700], fontWeight: '600' },
});