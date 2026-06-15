import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function formatDate(dateStr: string, lang: 'ko' | 'en' = 'ko'): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function formatYearMonth(year: number, month: number, lang: 'ko' | 'en' = 'ko'): string {
  if (lang === 'en') {
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${MONTHS[month - 1]} ${year}`;
  }
  return `${year}년 ${month}월`;
}
