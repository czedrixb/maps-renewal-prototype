'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  BarChart2,
  Settings,
  Bell,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage, LanguageToggle, TranslationKey } from '@/lib/i18n';

const NAV_ITEMS: { icon: React.ElementType; key: TranslationKey; href: string }[] = [
  { icon: LayoutDashboard, key: 'nav_dashboard',     href: '/sample-a/dashboard' },
  { icon: Users,           key: 'nav_students',       href: '/sample-a/students' },
  { icon: BookOpen,        key: 'nav_learningPlans',  href: '/sample-a/learning-plans' },
  { icon: BarChart2,       key: 'nav_monitoring',     href: '/sample-a/monitoring' },
];

interface AppShellAProps {
  children: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
}

export function AppShellA({ children, breadcrumbs }: AppShellAProps) {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Icon Rail — 56px wide */}
      <nav className="w-14 bg-white border-r border-slate-200 flex flex-col items-center py-3 gap-1 shrink-0 z-20">
        {/* Logo */}
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mb-3">
          <span className="text-white text-xs font-black">M</span>
        </div>

        {/* Nav items */}
        {NAV_ITEMS.map(({ icon: Icon, key, href }) => {
          const label = t(key);
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={cn(
                'group relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150',
                active
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
              )}
            >
              <Icon className="w-[18px] h-[18px]" strokeWidth={active ? 2.5 : 2} />
              {/* Tooltip */}
              <span className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                {label}
              </span>
              {/* Active indicator */}
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-600 rounded-r-full -ml-0.5" />
              )}
            </Link>
          );
        })}

        {/* Bottom: Settings + Notifications */}
        <div className="mt-auto flex flex-col items-center gap-1">
          <button
            className="relative w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            title={t('nav_notifications')}
          >
            <Bell className="w-[18px] h-[18px]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <Link
            href="#"
            title={t('nav_settings')}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <Settings className="w-[18px] h-[18px]" />
          </Link>
          <Link
            href="/"
            title={t('nav_back')}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <LogOut className="w-[18px] h-[18px]" />
          </Link>
          {/* Avatar */}
          <div className="w-8 h-8 mt-1 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
            이
          </div>
        </div>
      </nav>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar — always visible so toggle is always accessible */}
        <header className="h-12 bg-white border-b border-slate-200 flex items-center px-4 gap-2 shrink-0">
          <div className="flex-1 flex items-center gap-2">
            {breadcrumbs?.map((crumb, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-300" />}
                {crumb.href ? (
                  <Link href={crumb.href} className="text-xs text-slate-500 hover:text-indigo-600 font-medium transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-xs text-slate-800 font-semibold">{crumb.label}</span>
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
