// Email verification — shown after signup (and after sign-in if the
// account isn't confirmed yet). Resend with cooldown + troubleshoot list.
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { colors, fontFamilies, fontSizes, radii, spacing } from '@app/ui/tokens';
import { Button, useDir } from '../components/ui';
import { resendConfirmation } from '../lib/auth';

const RESEND_COOLDOWN_S = 45;

export default function VerifyEmail() {
  const { t } = useTranslation();
  const { textDir, alignStart, rtl } = useDir();
  const params = useLocalSearchParams<{ email?: string }>();
  const email = typeof params.email === 'string' ? params.email : '';

  const [cooldown, setCooldown] = useState(0);
  const [resent, setResent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  function toggle() {
    const to = open ? 0 : 1;
    setOpen(!open);
    Animated.timing(rotate, { toValue: to, duration: 200, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
  }

  async function onResend() {
    if (cooldown > 0 || !email) return;
    setBusy(true);
    const { error } = await resendConfirmation(email);
    setBusy(false);
    if (!error) { setResent(true); setCooldown(RESEND_COOLDOWN_S); }
  }

  const chevron = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const tips = [
    t('auth.troubleshoot.spam'),
    t('auth.troubleshoot.typo'),
    t('auth.troubleshoot.other'),
    t('auth.troubleshoot.blocked'),
  ];

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.iconWrap}>
          <View style={styles.envelope}>
            <View style={styles.envelopeFlap} />
          </View>
        </View>

        <View style={{ alignItems: alignStart, width: '100%' }}>
          <Text style={[styles.title, textDir]}>{t('auth.verifyEmailTitle')}</Text>
          <Text style={[styles.body, textDir]}>{t('auth.verifyEmailBody', { email })}</Text>
        </View>

        <View style={{ alignItems: alignStart, width: '100%', gap: spacing[2] }}>
          <Text style={[styles.didnt, textDir]}>{t('auth.didntReceive')}</Text>
          <Button
            label={cooldown > 0 ? `${t('auth.resend')} (${cooldown}s)` : t('auth.resend')}
            onPress={onResend}
            variant="secondary"
            loading={busy}
            disabled={cooldown > 0}
          />
          {resent ? <Text style={[styles.resent, textDir]}>{t('auth.resent')}</Text> : null}
        </View>

        {/* Troubleshoot accordion */}
        <View style={styles.accordion}>
          <Pressable onPress={toggle} style={[styles.accHeader, rtl && styles.rowReverse]}>
            <Text style={[styles.accTitle, textDir]}>{t('auth.troubleshoot.intro')}</Text>
            <Animated.View style={{ transform: [{ rotate: chevron }] }}>
              <View style={styles.chevron} />
            </Animated.View>
          </Pressable>
          {open ? (
            <View style={styles.accBody}>
              {tips.map((tip, i) => (
                <View key={i} style={[styles.tipRow, rtl && styles.rowReverse]}>
                  <View style={styles.tipDot} />
                  <Text style={[styles.tipText, textDir]}>{tip}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        <Pressable onPress={() => router.replace('/auth')} style={{ alignSelf: 'center' }}>
          <Text style={styles.link}>{t('auth.signIn')}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  scroll: { paddingHorizontal: spacing[6], paddingTop: spacing[8], paddingBottom: spacing[10], gap: spacing[6] },
  rowReverse: { flexDirection: 'row-reverse' },

  iconWrap: { alignItems: 'center', marginBottom: spacing[2] },
  envelope: {
    width: 88, height: 64, borderRadius: radii.md, backgroundColor: colors.primary[50],
    borderWidth: 2, borderColor: colors.primary[200], overflow: 'hidden', alignItems: 'center',
  },
  envelopeFlap: {
    width: 0, height: 0, marginTop: 2,
    borderLeftWidth: 42, borderRightWidth: 42, borderTopWidth: 30,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: colors.primary[200],
  },

  title: { fontFamily: fontFamilies.display, fontSize: fontSizes['2xl'], fontWeight: '600', color: colors.ink.DEFAULT },
  body: { marginTop: spacing[2], fontSize: fontSizes.base, lineHeight: fontSizes.base * 1.5, color: colors.ink.muted },

  didnt: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.ink.DEFAULT },
  resent: { fontSize: fontSizes.sm, color: colors.success.DEFAULT },

  accordion: { borderWidth: 1, borderColor: colors.line, borderRadius: radii.lg, backgroundColor: colors.surface, overflow: 'hidden' },
  accHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing[4], gap: spacing[3] },
  accTitle: { flex: 1, fontSize: fontSizes.sm, fontWeight: '600', color: colors.ink.DEFAULT },
  chevron: {
    width: 9, height: 9, borderRightWidth: 2, borderBottomWidth: 2, borderColor: colors.ink.muted,
    transform: [{ rotate: '45deg' }], marginTop: -3,
  },
  accBody: { paddingHorizontal: spacing[4], paddingBottom: spacing[4], gap: spacing[2] },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing[3] },
  tipDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent.DEFAULT, marginTop: 7 },
  tipText: { flex: 1, fontSize: fontSizes.sm, lineHeight: fontSizes.sm * 1.5, color: colors.ink.muted },

  link: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.primary[600] },
});