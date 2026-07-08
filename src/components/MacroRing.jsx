export default function MacroRing({ consumed, target, label, sublabel, color = 'hsl(43 58% 53%)', size = 72 }) {
  const safeTarget = target > 0 ? target : 1;
  const percentage = Math.min(consumed / safeTarget, 1);
  const isOver = consumed > target && target > 0;
  const stroke = size > 100 ? 7 : 5;
  const radius = (size - stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - percentage * circumference;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(270 18% 14%)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={isOver ? 'hsl(0 70% 55%)' : color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-heading font-semibold leading-none" style={{ fontSize: size > 100 ? '1.5rem' : '0.95rem' }}>
            {Math.round(consumed)}
          </span>
          {sublabel && (
            <span className="text-[9px] text-muted-foreground mt-0.5">{sublabel}</span>
          )}
        </div>
      </div>
      <span className="text-[11px] font-medium text-muted-foreground tracking-wide">{label}</span>
    </div>
  );
}