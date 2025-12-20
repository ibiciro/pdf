'use client';

import { useState } from 'react';
import { Check, Sparkles, Zap, Award, AlertTriangle, BookCheck } from 'lucide-react';

interface QualityRatingProps {
  contentId: string;
  currentRating?: string | null;
  counts?: {
    facts: number;
    works: number;
    elite: number;
    expert: number;
    doesnt_work: number;
  };
  onRate?: (rating: string) => void;
  compact?: boolean;
  showCounts?: boolean;
}

const ratingOptions = [
  { 
    id: 'facts', 
    label: 'Facts', 
    icon: BookCheck, 
    color: 'blue',
    description: 'Factual & accurate'
  },
  { 
    id: 'works', 
    label: 'Works', 
    icon: Check, 
    color: 'green',
    description: 'Practical & useful'
  },
  { 
    id: 'elite', 
    label: 'Elite', 
    icon: Sparkles, 
    color: 'purple',
    description: 'Exceptional quality'
  },
  { 
    id: 'expert', 
    label: 'Expert', 
    icon: Award, 
    color: 'amber',
    description: 'Expert-level content'
  },
  { 
    id: 'doesnt_work', 
    label: "Doesn't Work", 
    icon: AlertTriangle, 
    color: 'red',
    description: 'Needs improvement'
  },
];

const colorClasses: Record<string, { bg: string; text: string; border: string; hover: string; active: string }> = {
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-200',
    hover: 'hover:bg-blue-100',
    active: 'bg-blue-100 border-blue-400'
  },
  green: {
    bg: 'bg-green-50',
    text: 'text-green-600',
    border: 'border-green-200',
    hover: 'hover:bg-green-100',
    active: 'bg-green-100 border-green-400'
  },
  purple: {
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    border: 'border-purple-200',
    hover: 'hover:bg-purple-100',
    active: 'bg-purple-100 border-purple-400'
  },
  amber: {
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    border: 'border-amber-200',
    hover: 'hover:bg-amber-100',
    active: 'bg-amber-100 border-amber-400'
  },
  red: {
    bg: 'bg-red-50',
    text: 'text-red-600',
    border: 'border-red-200',
    hover: 'hover:bg-red-100',
    active: 'bg-red-100 border-red-400'
  },
};

export default function QualityRating({ 
  contentId, 
  currentRating, 
  counts = { facts: 0, works: 0, elite: 0, expert: 0, doesnt_work: 0 },
  onRate,
  compact = false,
  showCounts = true
}: QualityRatingProps) {
  const [selectedRating, setSelectedRating] = useState<string | null>(currentRating || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRate = async (ratingId: string) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setSelectedRating(ratingId);
    
    if (onRate) {
      onRate(ratingId);
    }
    
    setIsSubmitting(false);
  };

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {ratingOptions.map((option) => {
          const colors = colorClasses[option.color];
          const count = counts[option.id as keyof typeof counts] || 0;
          const isSelected = selectedRating === option.id;
          
          return (
            <button
              key={option.id}
              onClick={() => handleRate(option.id)}
              disabled={isSubmitting}
              className={`
                flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                border transition-all duration-200
                ${isSelected ? colors.active : `${colors.bg} ${colors.border} ${colors.hover}`}
                ${colors.text}
                disabled:opacity-50
              `}
              title={option.description}
            >
              <option.icon className="w-3 h-3" />
              {showCounts && count > 0 && <span>{count}</span>}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-700">Rate this content</h4>
      <div className="flex flex-wrap gap-2">
        {ratingOptions.map((option) => {
          const colors = colorClasses[option.color];
          const count = counts[option.id as keyof typeof counts] || 0;
          const isSelected = selectedRating === option.id;
          
          return (
            <button
              key={option.id}
              onClick={() => handleRate(option.id)}
              disabled={isSubmitting}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                border transition-all duration-200
                ${isSelected ? colors.active : `${colors.bg} ${colors.border} ${colors.hover}`}
                ${colors.text}
                disabled:opacity-50
              `}
              title={option.description}
            >
              <option.icon className="w-4 h-4" />
              <span>{option.label}</span>
              {showCounts && <span className="opacity-60">({count})</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function QualityBadges({ 
  counts = { facts: 0, works: 0, elite: 0, expert: 0, doesnt_work: 0 }
}: { 
  counts?: { facts: number; works: number; elite: number; expert: number; doesnt_work: number } 
}) {
  const topRatings = ratingOptions
    .map(option => ({
      ...option,
      count: counts[option.id as keyof typeof counts] || 0
    }))
    .filter(r => r.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 2);

  if (topRatings.length === 0) return null;

  return (
    <div className="flex gap-1">
      {topRatings.map((rating) => {
        const colors = colorClasses[rating.color];
        return (
          <span
            key={rating.id}
            className={`
              flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
              ${colors.bg} ${colors.text} ${colors.border} border
            `}
          >
            <rating.icon className="w-3 h-3" />
            {rating.count}
          </span>
        );
      })}
    </div>
  );
}
