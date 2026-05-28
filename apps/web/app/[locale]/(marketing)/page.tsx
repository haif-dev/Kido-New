import Link from 'next/link';
import { resources, type Locale } from '@app/i18n';

export default function MarketingHome({ params }: { params: { locale: string } }) {
  const locale = params.locale as Locale;
  const t = resources[locale]?.translation ?? resources.fr.translation;

  return (
    <main className="min-h-screen flex flex-col">
      <header className="px-6 py-5 flex items-center justify-between border-b border-line">
        <div className="flex items-center gap-2">
          {/* Placeholder logo — swap for your real mark */}
          <div
            aria-hidden
            className="w-9 h-9 rounded-md bg-primary"
            style={{
              background:
                'radial-gradient(circle at 30% 30%, #E48D6A, #C45A3F 70%)',
            }}
          />
          <span className="font-display text-xl font-semibold">
            {t.common.appName}
          </span>
        </div>
        <nav className="flex items-center gap-3">
          <Link
            href={`/${locale}/auth/sign-in`}
            className="text-sm text-ink-muted hover:text-ink"
          >
            {t.auth.signIn}
          </Link>
          <Link
            href={`/${locale}/auth/sign-up`}
            className="btn-primary py-2 px-4 text-sm"
          >
            {t.auth.signUp}
          </Link>
        </nav>
      </header>

      <section className="flex-1 flex items-center px-6 py-16 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-10 items-center w-full">
          <div>
            <h1 className="font-display text-5xl md:text-6xl font-semibold leading-tight tracking-tight">
              {t.onboarding.welcome.title}
            </h1>
            <p className="mt-6 text-lg text-ink-muted leading-relaxed">
              {t.onboarding.trust.intro}
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href={`/${locale}/onboarding`} className="btn-primary">
                {t.onboarding.welcome.cta}
              </Link>
              <Link href={`/${locale}/auth/sign-in`} className="btn-secondary">
                {t.auth.signIn}
              </Link>
            </div>
          </div>
          <div className="relative aspect-[4/5] rounded-2xl bg-elevated border border-line shadow-soft overflow-hidden">
            {/* Hero placeholder. Replace with your own original photography. */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(135deg, #F6D9CC 0%, #EDB39B 50%, #E48D6A 100%)',
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-primary-900/40 font-display text-2xl">
              your hero image
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
