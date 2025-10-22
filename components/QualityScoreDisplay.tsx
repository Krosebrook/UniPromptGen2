import React from 'react';

interface QualityScoreDisplayProps {
  score: number;
  size?: 'sm' | 'lg';
}

const QualityScoreDisplay: React.FC<QualityScoreDisplayProps> = ({ score, size = 'sm' }) => {
  const getScoreColor = (s: number) => {
    if (s >= 90) return 'text-success';
    if (s >= 80) return 'text-info';
    if (s >= 60) return 'text-warning';
    return 'text-destructive';
  };
  
  const getRingColor = (s: number) => {
    if (s >= 90) return 'stroke-success';
    if (s >= 80) return 'stroke-info';
    if (s >= 60) return 'stroke-warning';
    return 'stroke-destructive';
  }

  const sizeClasses = {
    sm: {
      wrapper: 'w-12 h-12',
      radius: 20,
      stroke: 4,
      textSize: 'text-base font-bold',
    },
    lg: {
      wrapper: 'w-20 h-20',
      radius: 36,
      stroke: 6,
      textSize: 'text-2xl font-bold',
    },
  };

  const { wrapper, radius, stroke, textSize } = sizeClasses[size];
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${wrapper}`}>
      <svg className="w-full h-full" viewBox={`0 0 ${radius * 2 + stroke} ${radius * 2 + stroke}`}>
        <circle
          className="stroke-secondary"
          strokeWidth={stroke}
          fill="transparent"
          r={radius}
          cx={radius + stroke / 2}
          cy={radius + stroke / 2}
        />
        <circle
          className={`transform -rotate-90 origin-center transition-all duration-500 ${getRingColor(score)}`}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={radius + stroke / 2}
          cy={radius + stroke / 2}
        />
      </svg>
      <span className={`absolute ${textSize} ${getScoreColor(score)}`}>
        {Math.round(score)}
      </span>
    </div>
  );
};

export default QualityScoreDisplay;
