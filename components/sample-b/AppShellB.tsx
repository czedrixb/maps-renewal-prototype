'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, BookOpen, BarChart2, Bell, ChevronRight,
  Calendar, FileText, LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage, LanguageToggle, TranslationKey } from '@/lib/i18n';

const NAV_SECTIONS: { titleKey?: TranslationKey; items: { icon: React.ElementType; key: TranslationKey; href: string }[] }[] = [
  {
    items: [
      { icon: LayoutDashboard, key: 'nav_dashboard',      href: '/sample-b/dashboard' },
      { icon: Users,           key: 'nav_studentsManage',  href: '/sample-b/students' },
      { icon: BookOpen,        key: 'nav_learningPlans',   href: '/sample-b/learning-plans' },
    ],
  },
  {
    titleKey: 'nav_monitoring',
    items: [
      { icon: BarChart2, key: 'nav_testScores',     href: '/sample-b/monitoring?tab=scores' },
      { icon: Calendar,  key: 'nav_makeup',          href: '/sample-b/monitoring?tab=makeup' },
      { icon: FileText,  key: 'nav_monthlyReports',  href: '/sample-b/monitoring?tab=reports' },
    ],
  },
];

interface AppShellBProps {
  children: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
}

export function AppShellB({ children, breadcrumbs }: AppShellBProps) {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar — 240px */}
      <aside className="w-60 bg-slate-800 text-slate-200 flex flex-col shrink-0 z-20">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-700">
          <div className="w-7 h-7 bg-sky-500 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-black">M</span>
          </div>
          <div>
            <p className="text-sm font-bold text-white">MAPS</p>
            <p className="text-[10px] text-slate-400">{t('nav_lms')}</p>
          </div>
        </div>

        {/* User info */}
        <div className="px-5 py-3 border-b border-slate-700 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs font-bold shrink-0">이</div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-100 truncate">이지현 선생님</p>
            <p className="text-[10px] text-slate-400">강사 · W아카데미</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
          {NAV_SECTIONS.map((section, si) => (
            <div key={si}>
              {section.titleKey && (
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-3 mb-1">{t(section.titleKey)}</p>
              )}
              {section.items.map(({ icon: Icon, key, href }) => {
                const label = t(key);
                const active = pathname === href || (pathname.startsWith(href.split('?')[0]) && href !== '/sample-b/dashboard');
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors',
                      active
                        ? 'bg-sky-600 text-white'
                        : 'text-slate-300 hover:bg-slate-700 hover:text-slate-100'
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" strokeWidth={active ? 2.5 : 2} />
                    {label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-2 py-3 border-t border-slate-700 space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-300 hover:bg-slate-700 hover:text-slate-100">
            <Bell className="w-4 h-4" />
            {t('nav_notifications')}
            <span className="ml-auto bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">2</span>
          </button>
          <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-400 hover:bg-slate-700 hover:text-slate-300">
            <LogOut className="w-4 h-4" />
            {t('nav_back')}
          </Link>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-12 bg-white border-b border-gray-200 flex items-center px-5 gap-2 shrink-0">
          <div className="flex-1 flex items-center gap-2">
            {breadcrumbs?.map((crumb, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-gray-300" />}
                {crumb.href ? (
                  <Link href={crumb.href} className="text-xs text-gray-500 hover:text-sky-600 font-medium transition-colors">{crumb.label}</Link>
                ) : (
                  <span className="text-xs text-gray-800 font-semibold">{crumb.label}</span>
                )}
              </span>
            ))}
          </div>
          <LanguageToggle />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
