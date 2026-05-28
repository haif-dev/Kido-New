import { useTranslation } from 'react-i18next';
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors, fontFamilies, fontSizes, radii, spacing } from '@app/ui/tokens';

export default function Welcome() {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.brandRow}>
        <View style={styles.logoMark} />
        <Text style={styles.brand}>{t('common.appName')}</Text>
      </View>

      <View style={{ flex: 1, justifyContent: 'center', maxWidth: 560 }}>
        <Text style={styles.headline}>{t('onboarding.welcome.title')}</Text>
        <Text style={styles.subhead}>{t('onboarding.trust.intro')}</Text>
      </View>

      <Pressable
        onPress={() => router.push('/onboarding')}
        style={({ pressed }) => [
          styles.cta,
          { width: Math.min(width - 48, 480), opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <Text style={styles.ctaLabel}>{t('onboarding.welcome.cta')}</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.canvas,
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[8],
    alignItems: 'flex-start',
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  logoMark: {
    width: 32, height: 32, borderRadius: radii.md, backgroundColor: colors.primary[500],
  },
  brand: { fontSize: fontSizes.lg, fontWeight: '600', color: colors.ink.DEFAULT },
  headline: {
    fontFamily: fontFamilies.display,
    fontSize: fontSizes['4xl'],
    fontWeight: '600',
    color: colors.ink.DEFAULT,
    letterSpacing: -0.5,
  },
  subhead: {
    marginTop: spacing[4],
    fontSize: fontSizes.base,
    lineHeight: fontSizes.base * 1.5,
    color: colors.ink.muted,
  },
  cta: {
    backgroundColor: colors.primary[500],
    borderRadius: radii.pill,
    paddingVertical: spacing[4],
    alignItems: 'center',
    alignSelf: 'center',
  },
  ctaLabel: {
    color: colors.primary.contrast,
    fontSize: fontSizes.base,
    fontWeight: '600',
  },
});
