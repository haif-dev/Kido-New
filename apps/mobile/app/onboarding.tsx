// Onboarding carousel — 3 pages (Search → Connect → Trust),
// auto-rotating + swipeable, with a crossfading rotating-word headline.
// FR-first, AR (RTL) aware. Consumes shared design tokens + i18n.
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors, fontFamilies, fontSizes, radii, spacing } from '@app/ui/tokens';
import { getDir, isRtl, type Locale } from '@app/i18n';

const PAGE_KEYS = ['search', 'connect', 'trust'] as const;
const AUTO_ADVANCE_MS = 4200;
const PAUSE_AFTER_TOUCH_MS = 5000;
const ROTATOR_INTERVAL_MS = 2400;

export default function Onboarding() {
  const { t, i18n } = useTranslation();
  const { width } = useWindowDimensions();

  const locale = (i18n.language?.slice(0, 2) as Locale) ?? 'fr';
  const rtl = isRtl(locale);
  const dir = getDir(locale);
  const textDir = { writingDirection: dir, textAlign: rtl ? 'right' : 'left' } as const;
  const alignStart = rtl ? 'flex-end' : 'flex-start';

  const scrollRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const indexRef = useRef(0);
  const lastTouch = useRef(0);
  const [index, setIndex] = useState(0);
  const isLast = index === PAGE_KEYS.length - 1;

  // Single source of truth for the current page. Updates synchronously so
  // rapid taps don't read a stale value (onMomentumScrollEnd is async and
  // unreliable for programmatic animated scrolls, especially on Android).
  const goTo = (i: number) => {
    const clamped = Math.max(0, Math.min(i, PAGE_KEYS.length - 1));
    indexRef.current = clamped;
    setIndex(clamped);
    scrollRef.current?.scrollTo({ x: clamped * width, animated: true });
  };

  // --- Auto-advance (pauses briefly after the user interacts) ---
  useEffect(() => {
    const id = setInterval(() => {
      if (Date.now() - lastTouch.current < PAUSE_AFTER_TOUCH_MS) return;
      goTo((indexRef.current + 1) % PAGE_KEYS.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [width]);

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false },
  );
  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    indexRef.current = i;
    setIndex(i);
  };
  const markTouched = () => { lastTouch.current = Date.now(); };

  const goNext = () => {
    markTouched();
    if (indexRef.current >= PAGE_KEYS.length - 1) { finish(); return; }
    goTo(indexRef.current + 1);
  };
  const finish = () => router.replace('/auth');

  return (
    <SafeAreaView style={styles.root}>
      {/* Brand + skip */}
      <View style={[styles.topBar, rtl && styles.rowReverse]}>
        <View style={[styles.brandRow, rtl && styles.rowReverse]}>
          <View style={styles.logoMark} />
          <Text style={styles.brand}>{t('common.appName')}</Text>
        </View>
        <Pressable hitSlop={10} onPress={() => { markTouched(); finish(); }}>
          <Text style={styles.skip}>{t('onboarding.skip')}</Text>
        </Pressable>
      </View>

      {/* Rotating-word headline */}
      <View style={[styles.headlineWrap, { alignItems: alignStart }]}>
        <Text style={[styles.headlinePrefix, textDir]}>
          {t('onboarding.welcome.rotatorPrefix')}
        </Text>
        <RotatingWord
          words={t('onboarding.welcome.rotators', { returnObjects: true }) as string[]}
          style={[styles.headlineWord, textDir]}
        />
      </View>

      {/* Pages */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onScrollBeginDrag={markTouched}
        onMomentumScrollEnd={onMomentumEnd}
        style={styles.pager}
      >
        {PAGE_KEYS.map((key) => (
          <View key={key} style={[styles.page, { width }]}>
            <View style={styles.illustration}>{renderArt(key)}</View>
            <View style={{ alignItems: alignStart, width: '100%' }}>
              <Text style={[styles.pageTitle, textDir]}>
                {t(`onboarding.${key}.title`)}
              </Text>
              <View style={styles.points}>
                {pointsFor(key).map((line, i) => (
                  <View key={i} style={[styles.pointRow, rtl && styles.rowReverse]}>
                    <View style={styles.bullet} />
                    <Text style={[styles.pointText, textDir]}>{t(line)}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Dots */}
      <View style={[styles.dots, rtl && styles.rowReverse]}>
        {PAGE_KEYS.map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
          const w = scrollX.interpolate({ inputRange, outputRange: [8, 22, 8], extrapolate: 'clamp' });
          const opacity = scrollX.interpolate({ inputRange, outputRange: [0.35, 1, 0.35], extrapolate: 'clamp' });
          return <Animated.View key={i} style={[styles.dot, { width: w, opacity }]} />;
        })}
      </View>

      {/* CTA */}
      <Pressable
        onPress={goNext}
        style={({ pressed }) => [
          styles.cta,
          { width: Math.min(width - spacing[6] * 2, 480), opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <Text style={styles.ctaLabel}>
          {isLast ? t('onboarding.welcome.cta') : t('common.next')}
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}

// --- Rotating word with crossfade (core Animated, no extra deps) ---
function RotatingWord({ words, style }: { words: string[]; style: any }) {
  const opacity = useRef(new Animated.Value(1)).current;
  const [i, setI] = useState(0);

  useEffect(() => {
    if (!words || words.length < 2) return;
    const id = setInterval(() => {
      Animated.timing(opacity, {
        toValue: 0, duration: 260, easing: Easing.in(Easing.quad), useNativeDriver: true,
      }).start(() => {
        setI((prev) => (prev + 1) % words.length);
        Animated.timing(opacity, {
          toValue: 1, duration: 260, easing: Easing.out(Easing.quad), useNativeDriver: true,
        }).start();
      });
    }, ROTATOR_INTERVAL_MS);
    return () => clearInterval(id);
  }, [words]);

  return <Animated.Text style={[style, { opacity }]}>{words?.[i] ?? ''}</Animated.Text>;
}

// --- Page bullet keys ---
function pointsFor(key: (typeof PAGE_KEYS)[number]): string[] {
  if (key === 'trust') {
    return [
      'onboarding.trust.idVerification',
      'onboarding.trust.criminalRecord',
      'onboarding.trust.reviews',
      'onboarding.trust.payments',
    ];
  }
  return [`onboarding.${key}.point1`, `onboarding.${key}.point2`, `onboarding.${key}.point3`];
}

// --- Lightweight on-brand illustrations composed from Views (no SVG dep) ---
function renderArt(key: (typeof PAGE_KEYS)[number]) {
  if (key === 'search') return <SearchArt />;
  if (key === 'connect') return <ConnectArt />;
  return <TrustArt />;
}

function SearchArt() {
  return (
    <View style={art.mapCard}>
      <View style={[art.faintDot, { top: 26, left: 34 }]} />
      <View style={[art.faintDot, { top: 70, left: 96 }]} />
      <View style={[art.faintDot, { top: 104, left: 40 }]} />
      <View style={art.pinWrap}>
        <View style={art.pinHead} />
        <View style={art.pinTail} />
      </View>
    </View>
  );
}

function ConnectArt() {
  return (
    <View style={art.chatWrap}>
      <View style={[art.bubble, art.bubbleIn]} />
      <View style={[art.bubble, art.bubbleOut]} />
      <View style={[art.bubble, art.bubbleInSm]} />
    </View>
  );
}

function TrustArt() {
  return (
    <View style={art.shieldWrap}>
      <View style={art.shield}>
        <View style={art.checkStem} />
        <View style={art.checkKick} />
      </View>
      <View style={[art.spark, { top: 8, left: 14 }]} />
      <View style={[art.spark, { bottom: 18, right: 10 }]} />
    </View>
  );
}

const ART = 196;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.canvas,
    paddingTop: spacing[2],
    paddingBottom: spacing[8],
  },
  rowReverse: { flexDirection: 'row-reverse' },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[2],
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  logoMark: { width: 28, height: 28, borderRadius: radii.md, backgroundColor: colors.primary[500] },
  brand: { fontSize: fontSizes.lg, fontWeight: '600', color: colors.ink.DEFAULT },
  skip: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.ink.muted },

  headlineWrap: { paddingHorizontal: spacing[6], paddingTop: spacing[3], paddingBottom: spacing[1] },
  headlinePrefix: { fontSize: fontSizes.lg, color: colors.ink.muted, fontWeight: '500' },
  headlineWord: {
    fontFamily: fontFamilies.display,
    fontSize: fontSizes['3xl'],
    fontWeight: '700',
    color: colors.primary[600],
    letterSpacing: -0.5,
  },

  pager: { flexGrow: 0 },
  page: { paddingHorizontal: spacing[6], paddingTop: spacing[6], alignItems: 'center' },
  illustration: { height: ART, justifyContent: 'center', alignItems: 'center', marginBottom: spacing[8] },

  pageTitle: {
    fontFamily: fontFamilies.display,
    fontSize: fontSizes['2xl'],
    fontWeight: '600',
    color: colors.ink.DEFAULT,
    marginBottom: spacing[4],
  },
  points: { gap: spacing[3], width: '100%' },
  pointRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing[3] },
  bullet: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent.DEFAULT, marginTop: 7 },
  pointText: { flex: 1, fontSize: fontSizes.base, lineHeight: fontSizes.base * 1.5, color: colors.ink.muted },

  dots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing[2], marginVertical: spacing[6] },
  dot: { height: 8, borderRadius: 4, backgroundColor: colors.primary[500] },

  cta: {
    backgroundColor: colors.primary[500],
    borderRadius: radii.pill,
    paddingVertical: spacing[4],
    alignItems: 'center',
    alignSelf: 'center',
  },
  ctaLabel: { color: colors.primary.contrast, fontSize: fontSizes.base, fontWeight: '600' },
});

const art = StyleSheet.create({
  // Search — stylized map card with a pin
  mapCard: {
    width: ART, height: ART, borderRadius: radii.lg,
    backgroundColor: colors.secondary[50], borderWidth: 1, borderColor: colors.line,
    overflow: 'hidden',
  },
  faintDot: { position: 'absolute', width: 10, height: 10, borderRadius: 5, backgroundColor: colors.secondary[100] },
  pinWrap: { position: 'absolute', top: 58, left: ART / 2 - 22, alignItems: 'center' },
  pinHead: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary[500], borderWidth: 4, borderColor: colors.surface },
  pinTail: {
    width: 0, height: 0, marginTop: -4,
    borderLeftWidth: 9, borderRightWidth: 9, borderTopWidth: 16,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: colors.primary[500],
  },

  // Connect — chat bubbles
  chatWrap: { width: ART, height: ART, justifyContent: 'center' },
  bubble: { borderRadius: radii.lg },
  bubbleIn: { width: 132, height: 48, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, alignSelf: 'flex-start', borderBottomLeftRadius: radii.sm },
  bubbleOut: { width: 150, height: 56, backgroundColor: colors.primary[500], alignSelf: 'flex-end', marginTop: spacing[3], borderBottomRightRadius: radii.sm },
  bubbleInSm: { width: 96, height: 40, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, alignSelf: 'flex-start', marginTop: spacing[3], borderBottomLeftRadius: radii.sm },

  // Trust — shield with check
  shieldWrap: { width: ART, height: ART, justifyContent: 'center', alignItems: 'center' },
  shield: {
    width: 120, height: 140, borderRadius: 60,
    borderBottomLeftRadius: 60, borderBottomRightRadius: 60,
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    backgroundColor: colors.secondary[500], justifyContent: 'center', alignItems: 'center',
  },
  checkStem: { position: 'absolute', width: 8, height: 44, borderRadius: 4, backgroundColor: colors.canvas, transform: [{ rotate: '45deg' }, { translateX: 6 }, { translateY: 6 }] },
  checkKick: { position: 'absolute', width: 8, height: 24, borderRadius: 4, backgroundColor: colors.canvas, transform: [{ rotate: '-45deg' }, { translateX: -14 }, { translateY: 10 }] },
  spark: { position: 'absolute', width: 14, height: 14, borderRadius: 7, backgroundColor: colors.accent.DEFAULT },
});