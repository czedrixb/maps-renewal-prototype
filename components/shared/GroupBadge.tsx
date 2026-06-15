import { cn } from '@/lib/utils';
import type { StudentGroup } from '@/lib/types';

const GROUP_STYLES: Record<StudentGroup, string> = {
  HN: 'bg-blue-100 text-blue-700 ring-blue-200',
  AC: 'bg-purple-100 text-purple-700 ring-purple-200',
  RS: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  ST: 'bg-orange-100 text-orange-700 ring-orange-200',
};

const GROUP_LABELS: Record<StudentGroup, string> = {
  HN: 'HN반',
  AC: 'AC반',
  RS: 'RS반',
  ST: 'ST반',
};

interface GroupBadgeProps {
  group: StudentGroup;
  showFull?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function GroupBadge({ group, showFull = false, size = 'md', className }: GroupBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold rounded-full ring-1',
        size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs',
        GROUP_STYLES[group],
        className
      )}
    >
      {showFull ? GROUP_LABELS[group] : group}
    </span>
  );
}
