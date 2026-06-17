'use client';

import { LanguageProvider } from '@/lib/i18n';
import { ProfileProvider } from '@/lib/profile';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <ProfileProvider>{children}</ProfileProvider>
    </LanguageProvider>
  );
}
