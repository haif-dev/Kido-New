// Mobile UI primitives built on the shared design tokens.
// Kept in apps/mobile (not packages/ui) because these use React Native
// primitives; packages/ui stays platform-agnostic for the web build.
import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, fontFamilies, fontSizes, radii, spacing } from '@app/ui/tokens';
import { isRtl, type Locale } from '@app/i18n';

export function useDir() {
  const { i18n } = useTranslation();
  const locale = (i18n.language?.slice(0, 2) as Locale) ?? 'fr';
  const rtl = isRtl(locale);
  return {
    rtl,
    locale,
    textDir: { writingDirection: rtl ? 'rtl' : 'ltr', textAlign: rtl ? 'right' : 'left' } as const,
    alignStart: (rtl ? 'flex-end' : 'flex-start') as 'flex-end' | 'flex-start',
  };
}

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}
export function Button({ label, onPress, variant = 'primary', loading, disabled, style }: ButtonProps) {
  const isPrimary = variant === 'primary';
  const blocked = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={blocked}
      style={({ pressed }) => [
        s.btn,
        isPrimary ? s.btnPrimary : s.btnSecondary,
        { opacity: blocked ? 0.55 : pressed ? 0.85 : 1 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? colors.primary.contrast : colors.ink.DEFAULT} />
      ) : (
        <Text style={[s.btnLabel, isPrimary ? s.btnLabelPrimary : s.btnLabelSecondary]}>{label}</Text>
      )}
    </Pressable>
  );
}

interface TextFieldProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  hint?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: 'email' | 'password' | 'name' | 'off';
}
export function TextField({
  label, value, onChangeText, placeholder, hint, error,
  secureTextEntry, keyboardType, autoCapitalize = 'none', autoComplete,
}: TextFieldProps) {
  const { textDir, alignStart } = useDir();
  return (
    <View style={{ width: '100%', alignItems: alignStart }}>
      <Text style={[s.label, textDir]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.ink.subtle}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete}
        autoCorrect={false}
        style={[s.input, textDir, error ? s.inputError : null]}
      />
      {error ? (
        <Text style={[s.error, textDir]}>{error}</Text>
      ) : hint ? (
        <Text style={[s.hint, textDir]}>{hint}</Text>
      ) : null}
    </View>
  );
}

interface CheckboxProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  children: ReactNode;
}
export function Checkbox({ checked, onChange, children }: CheckboxProps) {
  const { rtl } = useDir();
  return (
    <Pressable onPress={() => onChange(!checked)} style={[s.checkRow, rtl && s.rowReverse]}>
      <View style={[s.checkBox, checked && s.checkBoxOn]}>
        {checked ? <View style={s.checkMark} /> : null}
      </View>
      <View style={{ flex: 1 }}>{children}</View>
    </Pressable>
  );
}

export function OrDivider({ label }: { label: string }) {
  return (
    <View style={s.dividerRow}>
      <View style={s.dividerLine} />
      <Text style={s.dividerLabel}>{label}</Text>
      <View style={s.dividerLine} />
    </View>
  );
}

interface SocialButtonProps {
  provider: 'google' | 'facebook';
  label: string;
  onPress: () => void;
}
export function SocialButton({ provider, label, onPress }: SocialButtonProps) {
  const { rtl } = useDir();
  const mark = provider === 'google' ? 'G' : 'f';
  const markColor = provider === 'google' ? '#4285F4' : '#1877F2';
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [s.social, rtl && s.rowReverse, { opacity: pressed ? 0.85 : 1 }]}
    >
      <View style={[s.socialMark, { borderColor: markColor }]}>
        <Text style={[s.socialMarkText, { color: markColor }]}>{mark}</Text>
      </View>
      <Text style={s.socialLabel}>{label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  rowReverse: { flexDirection: 'row-reverse' },

  btn: { borderRadius: radii.pill, paddingVertical: spacing[4], alignItems: 'center', justifyContent: 'center', width: '100%' },
  btnPrimary: { backgroundColor: colors.primary[500] },
  btnSecondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.lineStrong },
  btnLabel: { fontSize: fontSizes.base, fontWeight: '600' },
  btnLabelPrimary: { color: colors.primary.contrast },
  btnLabelSecondary: { color: colors.ink.DEFAULT },

  label: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.ink.DEFAULT, marginBottom: spacing[1] },
  input: {
    width: '100%', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line,
    borderRadius: radii.md, paddingHorizontal: spacing[4], paddingVertical: spacing[3],
    fontSize: fontSizes.base, color: colors.ink.DEFAULT,
  },
  inputError: { borderColor: colors.danger.DEFAULT },
  hint: { marginTop: spacing[1], fontSize: fontSizes.xs, color: colors.ink.subtle, lineHeight: fontSizes.xs * 1.4 },
  error: { marginTop: spacing[1], fontSize: fontSizes.xs, color: colors.danger.DEFAULT },

  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing[3] },
  checkBox: {
    width: 22, height: 22, borderRadius: radii.sm, borderWidth: 1.5, borderColor: colors.lineStrong,
    backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', marginTop: 2,
  },
  checkBoxOn: { backgroundColor: colors.primary[500], borderColor: colors.primary[500] },
  checkMark: {
    width: 6, height: 11, borderRightWidth: 2, borderBottomWidth: 2, borderColor: colors.primary.contrast,
    transform: [{ rotate: '45deg' }], marginTop: -2,
  },

  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], width: '100%' },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.line },
  dividerLabel: { fontSize: fontSizes.sm, color: colors.ink.muted },

  social: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing[3],
    width: '100%', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.lineStrong,
    borderRadius: radii.pill, paddingVertical: spacing[3],
  },
  socialMark: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  socialMarkText: { fontSize: fontSizes.sm, fontWeight: '700', fontFamily: fontFamilies.body },
  socialLabel: { fontSize: fontSizes.base, fontWeight: '600', color: colors.ink.DEFAULT },
});