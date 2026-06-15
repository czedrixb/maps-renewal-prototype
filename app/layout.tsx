import type { Metadata } from 'next';
import { Noto_Sans_KR } from 'next/font/google';
import { Providers } from '@/components/Providers';
import './globals.css';

const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-kr',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MAPS 리뉴얼 프로토타입',
  description: 'MAPS UI/UX Renewal Sample Prototypes — LMS-1591',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={notoSansKR.variable}>
      <body className="min-h-screen antialiased" style={{ fontFamily: 'var(--font-noto-kr), "Noto Sans KR", sans-serif' }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
