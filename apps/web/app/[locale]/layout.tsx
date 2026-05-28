import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import React from 'react';
import { SUPPORTED_LOCALES, getDir, type Locale } from '@app/i18n';
import '../globals.css';

export const metadata: Metadata = {
  title: 'Kido',
  description: "La plateforme de garde d'enfants de confiance.",
};

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!SUPPORTED_LOCALES.includes(params.locale as Locale)) notFound();
  const locale = params.locale as Locale;
  const dir = getDir(locale);

  return (
    <html lang={locale} dir={dir}>
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Manrope:wght@400;500;600;700&family=Tajawal:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
