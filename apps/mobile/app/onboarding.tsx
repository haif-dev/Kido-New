// Placeholder — full auto-scrolling onboarding carousel comes in Phase 2.
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontFamilies, fontSizes, spacing } from '@app/ui/tokens';

export default function OnboardingPlaceholder() {
  return (
    <View style={styles.root}>
      <Text style={styles.heading}>Onboarding carousel</Text>
      <Text style={styles.body}>
        Coming in Phase 2: 3-page swipeable + auto-rotating intro
        (Search → Connect → Trust).
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas, padding: spacing[8], justifyContent: 'center' },
  heading: { fontFamily: fontFamilies.display, fontSize: fontSizes['2xl'], color: colors.ink.DEFAULT },
  body: { marginTop: spacing[4], color: colors.ink.muted, fontSize: fontSizes.base, lineHeight: 24 },
});
