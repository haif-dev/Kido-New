import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import { I18nManager } from 'react-native';
import { resources, DEFAULT_LOCALE, isRtl, type Locale } from '@app/i18n';

const deviceLocale = (Localization.getLocales()[0]?.languageCode ?? DEFAULT_LOCALE) as Locale;
const initial: Locale = (resources as Record<string, unknown>)[deviceLocale]
  ? deviceLocale
  : DEFAULT_LOCALE;

void i18next.use(initReactI18next).init({
  resources,
  lng: initial,
  fallbackLng: DEFAULT_LOCALE,
  interpolation: { escapeValue: false },
  compatibilityJSON: 'v4',
});

// Apply RTL once — full effect requires app reload (see Expo docs).
if (isRtl(initial) !== I18nManager.isRTL) {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(isRtl(initial));
}

export default i18next;
