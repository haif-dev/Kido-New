import fr from './locales/fr.json';
import ar from './locales/ar.json';

export const resources = {
  fr: { translation: fr },
  ar: { translation: ar },
} as const;

export type Locale = keyof typeof resources;

export const SUPPORTED_LOCALES: Locale[] = ['fr', 'ar'];
export const DEFAULT_LOCALE: Locale = 'fr';
export const RTL_LOCALES: Locale[] = ['ar'];

export function isRtl(locale: Locale): boolean {
  return RTL_LOCALES.includes(locale);
}

export function getDir(locale: Locale): 'ltr' | 'rtl' {
  return isRtl(locale) ? 'rtl' : 'ltr';
}

export { fr, ar };
