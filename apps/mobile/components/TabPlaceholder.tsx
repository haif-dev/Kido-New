import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fontFamilies, fontSizes, radii, spacing } from '@app/ui/tokens';

export default function TabPlaceholder({ title }: { title: string }) {
  const { t } = useTranslation();
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.dot} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.soon}>{t('common.comingSoon')}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas, alignItems: 'center', justifyContent: 'center', padding: spacing[6], gap: spacing[3] },
  dot: { width: 56, height: 56, borderRadius: radii.lg, backgroundColor: colors.primary[50], borderWidth: 1, borderColor: colors.primary[100], marginBottom: spacing[2] },
  title: { fontFamily: fontFamilies.display, fontSize: fontSizes['2xl'], fontWeight: '600', color: colors.ink.DEFAULT },
  soon: { fontSize: fontSizes.base, color: colors.ink.muted },
});