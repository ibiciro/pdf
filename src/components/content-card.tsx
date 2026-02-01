'use client';

import { Star, Clock, FileText } from 'lucide-react';
import Link from 'next/link';

interface ContentCardProps {
  id: string;
  title: string;
  author: string;
  authorAvatar?: string;
  thumbnail?: string;
  price: number;
  sessionDuration: number;
  rating: number;
  reviewCount: number;
  readCount: number;
  likeCount: number;
  contentType?: 'text' | 'pdf';
  category?: string;
  categoryColor?: string;
  qualityRatings?: {
    facts: number;
    works: number;
    elite: number;
    expert: number;
    doesnt_work: number;
  };
}

export default function ContentCard({
  id,
  title,
  author,
  thumbnail,
  price,
  sessionDuration,
  rating,
  reviewCount,
  readCount,
  contentType = 'text',
  category,
  categoryColor,
}: ContentCardProps) {
  const getCategoryColorClass = (color?: string) => {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-700',
      green: 'bg-green-100 text-green-700',
      violet: 'bg-violet-100 text-violet-700',
      amber: 'bg-amber-100 text-amber-700',
      red: 'bg-red-100 text-red-700',
      pink: 'bg-pink-100 text-pink-700',
      cyan: 'bg-cyan-100 text-cyan-700',
      emerald: 'bg-emerald-100 text-emerald-700',
    };
    return colorMap[color || 'blue'] || colorMap.blue;
  };
  return (
    <Link href={`/content/${id}`}>
      <div className="group cursor-pointer bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
        {/* Thumbnail */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50">
              <FileText className="w-12 h-12 text-gray-300" />
            </div>
          )}
          
          {/* Price badge */}
          <div className="absolute top-3 right-3 bg-white px-3 py-1.5 rounded-full text-sm font-semibold text-gray-900">
            ${(price / 100).toFixed(2)}
          </div>
        </div>
        
        {/* Content info */}
        <div className="p-4">
          {/* Category badge */}
          {category && (
            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-2 ${getCategoryColorClass(categoryColor)}`}>
              {category}
            </span>
          )}
          
          <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-gray-600 transition-colors">
            {title}
          </h3>
          
          <p className="text-sm text-gray-500 mb-3">{author}</p>
          
          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-gray-600">{rating.toFixed(1)}</span>
              <span>({reviewCount})</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{sessionDuration} min</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
