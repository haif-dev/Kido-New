// Auth entry — sign in / sign up. Email + password + social providers.
// Sign in completes here (routes to verify-email if unconfirmed).
// Sign up collects identity, then routes through account-type → terms.
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors, fontFamilies, fontSizes, spacing } from '@app/ui/tokens';
import { email as emailSchema, password as passwordSchema } from '@app/lib/validation';
import { Button, OrDivider, SocialButton, TextField, useDir } from '../components/ui';
import {
  getLastFirstName, setPendingSignup, signInWithEmail, signInWithProvider,
} from '../lib/auth';

type Mode = 'signin' | 'signup';

// Social login is hidden until Google/Facebook OAuth is configured.
// Flip to true once providers + redirect URLs are set up in Supabase.
const SOCIAL_LOGIN_ENABLED = false;

export default function Auth() {
  const { t } = useTranslation();
  const { textDir, alignStart } = useDir();
  const [mode, setMode] = useState<Mode>('signin');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [emailValue, setEmailValue] = useState('');
  const [pwd, setPwd] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [knownName, setKnownName] = useState<string | null>(null);

  useEffect(() => { void getLastFirstName().then(setKnownName); }, []);

  const isSignup = mode === 'signup';

  function validate(): boolean {
    const next: Record<string, string> = {};
    const e = emailSchema.safeParse(emailValue.trim());
    if (!e.success) next.email = e.error.issues[0]?.message ?? t('auth.required');

    if (isSignup) {
      if (!firstName.trim()) next.firstName = t('auth.required');
      if (!lastName.trim()) next.lastName = t('auth.required');
      const p = passwordSchema.safeParse(pwd);
      if (!p.success) next.password = p.error.issues[0]?.message ?? t('auth.required');
    } else if (!pwd) {
      next.password = t('auth.required');
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit() {
    setFormError(null);
    if (!validate()) return;

    if (isSignup) {
      // Carry identity forward; role + terms are collected next.
      setPendingSignup({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: emailValue.trim(),
        password: pwd,
      });
      router.push('/account-type');
      return;
    }

    setBusy(true);
    const { data, error } = await signInWithEmail(emailValue.trim(), pwd);
    setBusy(false);
    if (error) { setFormError(t('auth.invalidCredentials')); return; }
    if (data.user && !data.user.email_confirmed_at) {
      router.replace({ pathname: '/verify-email', params: { email: emailValue.trim() } });
      return;
    }
    router.replace('/search');
  }

  async function onSocial(provider: 'google' | 'facebook') {
    setFormError(null);
    setBusy(true);
    const { error } = await signInWithProvider(provider);
    setBusy(false);
    if (error) setFormError(t('common.error'));
  }

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={[styles.brandRow, alignStart === 'flex-end' && styles.rowReverse]}>
            <View style={styles.logoMark} />
            <Text style={styles.brand}>{t('common.appName')}</Text>
          </View>

          <View style={{ alignItems: alignStart, width: '100%' }}>
            <Text style={[styles.title, textDir]}>
              {isSignup ? t('auth.signUp') : (knownName ? t('auth.welcomeBack', { name: knownName }) : t('auth.joinTitle'))}
            </Text>
            <Text style={[styles.subtitle, textDir]}>{t('auth.joinSubtitle')}</Text>
          </View>

          <View style={styles.form}>
            {isSignup && (
              <>
                <TextField
                  label={t('auth.firstName')} value={firstName} onChangeText={setFirstName}
                  autoCapitalize="words" autoComplete="name" error={errors.firstName}
                />
                <TextField
                  label={t('auth.lastName')} value={lastName} onChangeText={setLastName}
                  autoCapitalize="words" autoComplete="name"
                  hint={t('auth.lastNameHint')} error={errors.lastName}
                />
              </>
            )}

            <TextField
              label={t('auth.emailPlaceholder')} value={emailValue} onChangeText={setEmailValue}
              keyboardType="email-address" autoComplete="email"
              hint={isSignup ? t('auth.emailHint') : undefined} error={errors.email}
            />
            <TextField
              label={t('auth.passwordPlaceholder')} value={pwd} onChangeText={setPwd}
              secureTextEntry autoComplete="password" error={errors.password}
            />

            {!isSignup && (
              <Pressable onPress={() => router.push('/forgot-password')} style={{ alignSelf: alignStart }} hitSlop={8}>
                <Text style={styles.link}>{t('auth.forgotPassword')}</Text>
              </Pressable>
            )}

            {formError ? <Text style={[styles.formError, textDir]}>{formError}</Text> : null}

            <Button
              label={isSignup ? t('common.continue') : t('auth.signIn')}
              onPress={onSubmit}
              loading={busy}
            />
          </View>

          {SOCIAL_LOGIN_ENABLED && (
            <>
              <OrDivider label={t('auth.continueWith')} />
              <View style={styles.socials}>
                <SocialButton provider="google" label="Google" onPress={() => onSocial('google')} />
                <SocialButton provider="facebook" label="Facebook" onPress={() => onSocial('facebook')} />
              </View>
            </>
          )}

          <View style={[styles.switchRow, alignStart === 'flex-end' && styles.rowReverse]}>
            <Text style={styles.switchText}>
              {isSignup ? t('auth.haveAccount') : t('auth.noAccount')}
            </Text>
            <Pressable onPress={() => { setErrors({}); setFormError(null); setMode(isSignup ? 'signin' : 'signup'); }}>
              <Text style={styles.switchLink}>{isSignup ? t('auth.signIn') : t('auth.signUp')}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  scroll: { paddingHorizontal: spacing[6], paddingTop: spacing[4], paddingBottom: spacing[10], gap: spacing[5] },
  rowReverse: { flexDirection: 'row-reverse' },

  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  logoMark: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary[500] },
  brand: { fontSize: fontSizes.lg, fontWeight: '600', color: colors.ink.DEFAULT },

  title: { fontFamily: fontFamilies.display, fontSize: fontSizes['3xl'], fontWeight: '600', color: colors.ink.DEFAULT, letterSpacing: -0.5 },
  subtitle: { marginTop: spacing[1], fontSize: fontSizes.base, color: colors.ink.muted },

  form: { gap: spacing[4], width: '100%' },
  link: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.primary[600] },
  formError: { fontSize: fontSizes.sm, color: colors.danger.DEFAULT },

  socials: { gap: spacing[3], width: '100%' },

  switchRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing[2] },
  switchText: { fontSize: fontSizes.sm, color: colors.ink.muted },
  switchLink: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.primary[600] },
});