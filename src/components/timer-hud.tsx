'use client';

interface TimerHUDProps {
  timeRemaining: number;
  totalTime: number;
  status: 'normal' | 'warning' | 'critical';
  onClick: () => void;
}

export default function TimerHUD({ timeRemaining, totalTime, status, onClick }: TimerHUDProps) {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const progress = (timeRemaining / totalTime) * 100;
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const getStatusColors = () => {
    switch (status) {
      case 'critical':
        return {
          stroke: 'url(#gradient-critical)',
          glow: 'rgba(239, 68, 68, 0.3)',
          text: 'text-red-500',
          bg: 'bg-red-50',
          border: 'border-red-200',
          animation: 'timer-critical',
        };
      case 'warning':
        return {
          stroke: 'url(#gradient-warning)',
          glow: 'rgba(245, 158, 11, 0.3)',
          text: 'text-amber-500',
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          animation: 'timer-warning',
        };
      default:
        return {
          stroke: 'url(#gradient-normal)',
          glow: 'rgba(59, 130, 246, 0.2)',
          text: 'text-blue-600',
          bg: 'bg-white',
          border: 'border-gray-200',
          animation: '',
        };
    }
  };

  const colors = getStatusColors();

  return (
    <button
      onClick={onClick}
      className={`fixed top-24 right-6 z-50 w-[120px] h-[120px] rounded-full ${colors.bg} border ${colors.border} flex items-center justify-center cursor-pointer transition-all hover:scale-105 ${colors.animation}`}
      style={{ boxShadow: `0 4px 20px ${colors.glow}` }}
    >
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="gradient-normal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
          <linearGradient id="gradient-warning" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#EF4444" />
          </linearGradient>
          <linearGradient id="gradient-critical" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="100%" stopColor="#DC2626" />
          </linearGradient>
        </defs>
        
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="rgba(0, 0, 0, 0.05)"
          strokeWidth="4"
        />
        
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={colors.stroke}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-linear"
        />
      </svg>
      
      {/* Time display */}
      <div className="relative text-center">
        <div className={`text-2xl font-bold font-mono ${colors.text}`}>
          {minutes}:{seconds.toString().padStart(2, '0')}
        </div>
        <div className="text-xs text-gray-400">remaining</div>
      </div>
    </button>
  );
}
}
