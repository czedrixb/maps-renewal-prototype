import { cn } from '@/lib/utils';
import { getVPBarColor, getVPBarBgColor, getVPTextColor } from '@/lib/vp';

interface VPProgressBarProps {
  vp: number;
  max?: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function VPProgressBar({
  vp,
  max = 10,
  showLabel = false,
  size = 'md',
  className,
}: VPProgressBarProps) {
  const pct = Math.min((vp / max) * 100, 100);
  const barColor = getVPBarColor(vp, max);
  const bgColor = getVPBarBgColor(vp, max);
  const textColor = getVPTextColor(vp, max);

  const heights: Record<string, string> = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className={cn('w-full rounded-full overflow-hidden bg-slate-100', heights[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-300', barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className={cn('text-xs font-semibold tabular-nums', textColor)}>
          {vp} / {max} VP
          {vp > max && <span className="ml-1 text-red-600">(초과)</span>}
        </span>
      )}
    </div>
  );
}

// Ring variant for dashboard cards
interface VPRingProps {
  vp: number;
  total: number;
  size?: number;
  strokeWidth?: number;
}

export function VPRing({ vp, total, size = 56, strokeWidth = 5 }: VPRingProps) {
  const pct = total > 0 ? vp / total : 0;
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);

  const color =
    pct > 1 ? '#ef4444' : pct === 1 ? '#3b82f6' : pct >= 0.8 ? '#eab308' : '#22c55e';

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={strokeWidth} className="stroke-slate-100 fill-none" />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        strokeWidth={strokeWidth}
        fill="none"
        stroke={color}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.4s ease' }}
      />
    </svg>
  );
}
