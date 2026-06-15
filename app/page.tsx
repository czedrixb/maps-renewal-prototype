'use client';

import Link from 'next/link';
import { ArrowRight, LayoutGrid, PanelLeftOpen, Star, Check } from 'lucide-react';
import { useLanguage, LanguageToggle } from '@/lib/i18n';

const ACCENT = {
  indigo: {
    card: 'hover:border-indigo-300 hover:shadow-indigo-100/60',
    label: 'bg-indigo-600 text-white',
    iconBg: 'bg-indigo-50',
    icon: 'text-indigo-600',
    check: 'text-indigo-500',
    btn: 'bg-indigo-600 hover:bg-indigo-700 text-white',
  },
  sky: {
    card: 'hover:border-sky-300 hover:shadow-sky-100/60',
    label: 'bg-sky-600 text-white',
    iconBg: 'bg-sky-50',
    icon: 'text-sky-600',
    check: 'text-sky-500',
    btn: 'bg-sky-600 hover:bg-sky-700 text-white',
  },
};

export default function LandingPage() {
  const { t } = useLanguage();

  const samples = [
    {
      id: 'a',
      href: '/sample-a/dashboard',
      label: 'Sample A',
      title: t('land_sampleA_title'),
      subtitle: t('land_sampleA_subtitle'),
      description: t('land_sampleA_desc'),
      icon: LayoutGrid,
      features: [t('land_sampleA_f1'), t('land_sampleA_f2'), t('land_sampleA_f3'), t('land_sampleA_f4')],
      accent: 'indigo' as const,
    },
    {
      id: 'b',
      href: '/sample-b/dashboard',
      label: 'Sample B',
      title: t('land_sampleB_title'),
      subtitle: t('land_sampleB_subtitle'),
      description: t('land_sampleB_desc'),
      icon: PanelLeftOpen,
      features: [t('land_sampleB_f1'), t('land_sampleB_f2'), t('land_sampleB_f3'), t('land_sampleB_f4')],
      accent: 'sky' as const,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-slate-800 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-black">M</span>
            </div>
            <span className="font-bold text-slate-800 text-sm">MAPS</span>
            <span className="text-slate-300 text-sm">|</span>
            <span className="text-sm text-slate-500">{t('land_renewalSub')}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-semibold">
              LMS-1591 · Prototype
            </span>
            <LanguageToggle />
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 pt-16 pb-10 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-semibold mb-5">
          <Star className="w-3.5 h-3.5" />
          {t('land_badge')}
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-3 leading-tight">
          {t('land_heading')}
        </h1>
        <p className="text-slate-500 text-base max-w-xl mx-auto leading-relaxed">
          {t('land_subtitle')}
        </p>
      </div>

      {/* Sample Cards */}
      <div className="max-w-5xl mx-auto px-6 pb-16 grid md:grid-cols-2 gap-6">
        {samples.map((s) => {
          const Icon = s.icon;
          const ac = ACCENT[s.accent];
          return (
            <div
              key={s.id}
              className={`bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-5 shadow-sm hover:shadow-lg transition-all duration-200 ${ac.card}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${ac.iconBg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 ${ac.icon}`} />
                </div>
                <div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ac.label}`}>{s.label}</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">{s.subtitle}</p>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-800 mb-2">{s.title}</h2>
                <p className="text-sm text-slate-500 leading-relaxed">{s.description}</p>
              </div>

              <ul className="space-y-1.5">
                {s.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                    <Check className={`w-3.5 h-3.5 ${ac.check} shrink-0`} />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={s.href}
                className={`mt-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${ac.btn}`}
              >
                {s.label} {t('land_explore')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          );
        })}
      </div>

      <footer className="border-t border-slate-100 py-6 text-center mt-auto">
        <p className="text-xs text-slate-400">{t('land_footer')}</p>
      </footer>
    </div>
  );
}
