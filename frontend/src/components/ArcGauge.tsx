import React from 'react';

interface ArcGaugeProps {
  percentRemaining: number; // 0 - 100
  safeAmount: number;
  currency?: string;
  subtitle?: string;
  size?: number;
}

export const ArcGauge: React.FC<ArcGaugeProps> = ({
  percentRemaining = 72,
  safeAmount = 1240,
  currency = 'INR',
  subtitle = 'this week',
  size = 180,
}) => {
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;

  // Arc of 240 degrees (from 150deg to 390deg)
  const startAngle = 135;
  const totalAngle = 270;
  const currentAngle = (percentRemaining / 100) * totalAngle;

  const polarToCartesian = (centerX: number, centerY: number, r: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + r * Math.cos(angleInRadians),
      y: centerY + r * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x: number, y: number, r: number, start: number, end: number) => {
    const startPoint = polarToCartesian(x, y, r, end);
    const endPoint = polarToCartesian(x, y, r, start);
    const largeArcFlag = end - start <= 180 ? '0' : '1';
    return ['M', startPoint.x, startPoint.y, 'A', r, r, 0, largeArcFlag, 0, endPoint.x, endPoint.y].join(' ');
  };

  const bgPath = describeArc(center, center, radius, startAngle, startAngle + totalAngle);
  const fgPath = describeArc(center, center, radius, startAngle, startAngle + currentAngle);

  const getGlowColor = () => {
    if (percentRemaining > 50) return '#10b981'; // vibrant emerald
    if (percentRemaining > 25) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  const color = getGlowColor();

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="overflow-visible">
        <defs>
          <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="60%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
          <filter id="arcGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Background Track */}
        <path
          d={bgPath}
          fill="none"
          stroke="#1e293b"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="opacity-40"
        />

        {/* Progress Arc */}
        {percentRemaining > 0 && (
          <path
            d={fgPath}
            fill="none"
            stroke="url(#arcGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            filter="url(#arcGlow)"
            className="transition-all duration-700 ease-out"
          />
        )}
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none pt-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400/90 mb-0.5">
          SAFE TO SPEND
        </span>
        <div className="flex items-baseline justify-center">
          <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            ₹{safeAmount.toLocaleString('en-IN')}
          </span>
        </div>
        <span className="text-xs font-medium text-slate-400 mt-0.5">{subtitle}</span>
      </div>
    </div>
  );
};
