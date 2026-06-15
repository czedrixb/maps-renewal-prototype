'use client';

import { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import { AppShellB } from '@/components/sample-b/AppShellB';

export default function ReportsBPage() {
  return (
    <AppShellB breadcrumbs={[{ label: '월간 리포트' }]}>
      <div className="flex items-center justify-center h-64 text-slate-400 flex-col gap-3">
        <FileText className="w-10 h-10 opacity-30" />
        <p className="text-sm">월간 리포트 목록은 모니터링 → 월간 리포트 탭에서 확인하세요.</p>
      </div>
    </AppShellB>
  );
}
