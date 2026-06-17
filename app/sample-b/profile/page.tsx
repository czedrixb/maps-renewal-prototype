'use client';

import { useState, useEffect } from 'react';
import { AppShellB } from '@/components/sample-b/AppShellB';
import { useLanguage } from '@/lib/i18n';
import { useProfile, initialOf } from '@/lib/profile';
import { cn } from '@/lib/utils';

export default function ProfilePageB() {
  const { t } = useLanguage();
  const { profile, setProfile } = useProfile();

  const [name, setName]       = useState(profile.name);
  const [role, setRole]       = useState(profile.role);
  const [academy, setAcademy] = useState(profile.academy);
  const [saved, setSaved]     = useState(false);

  // Keep local form in sync when profile changes externally
  useEffect(() => {
    setName(profile.name);
    setRole(profile.role);
    setAcademy(profile.academy);
  }, [profile]);

  const isDirty =
    name !== profile.name ||
    role !== profile.role ||
    academy !== profile.academy;

  const handleSave = () => {
    setProfile({ name: name.trim() || profile.name, role: role.trim() || profile.role, academy: academy.trim() || profile.academy });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCancel = () => {
    setName(profile.name);
    setRole(profile.role);
    setAcademy(profile.academy);
  };

  const inputCls =
    'w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-400 bg-white';

  return (
    <AppShellB breadcrumbs={[{ label: t('nav_profile') }]}>
      <div className="p-6 max-w-lg mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-sky-50 px-6 py-5 flex items-center gap-4 border-b border-slate-200">
            <div className="w-14 h-14 rounded-full bg-sky-600 text-white flex items-center justify-center text-xl font-black select-none">
              {initialOf(name || profile.name)}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">{name || profile.name}</p>
              <p className="text-xs text-slate-500">{role || profile.role} · {academy || profile.academy}</p>
            </div>
          </div>

          {/* Form */}
          <div className="px-6 py-5 space-y-4">
            <p className="text-xs text-slate-500">{t('prof_subtitle')}</p>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  {t('prof_name')}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setSaved(false); }}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  {t('prof_role')}
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => { setRole(e.target.value); setSaved(false); }}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  {t('prof_academy')}
                </label>
                <input
                  type="text"
                  value={academy}
                  onChange={(e) => { setAcademy(e.target.value); setSaved(false); }}
                  className={inputCls}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleSave}
                disabled={!isDirty && !saved}
                className={cn(
                  'px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors',
                  saved
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : isDirty
                    ? 'bg-sky-600 hover:bg-sky-700 text-white'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                )}
              >
                {saved ? t('cls_saved') : t('cls_save')}
              </button>
              {isDirty && (
                <button
                  onClick={handleCancel}
                  className="px-3 py-1.5 text-slate-500 text-xs font-semibold rounded-lg hover:bg-slate-100 transition-colors"
                >
                  {t('cls_cancel')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShellB>
  );
}
