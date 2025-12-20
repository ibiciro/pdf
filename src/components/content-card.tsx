'use client';

import { Star, Clock, Eye, Heart } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { QualityBadges } from './quality-rating';

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
  authorAvatar,
  thumbnail,
  price,
  sessionDuration,
  rating,
  reviewCount,
  readCount,
  likeCount,
  qualityRatings,
}: ContentCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  return (
    <Link href={`/content/${id}`}>
      <div
        className="content-card group cursor-pointer border border-gray-100 shadow-sm"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Thumbnail */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl bg-gray-100">
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-500"
            style={{
              backgroundImage: thumbnail
                ? `url(${thumbnail})`
                : 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
              transform: isHovered ? 'scale(1.05)' : 'scale(1)',
            }}
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Price badge */}
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
            <span className="font-mono text-sm font-semibold text-gray-900">
              ${(price / 100).toFixed(2)}
            </span>
          </div>
          
          {/* Like button */}
          <button
            onClick={handleLike}
            className={`absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
              isLiked 
                ? 'bg-pink-500 text-white' 
                : 'bg-white/95 backdrop-blur-sm text-gray-600 hover:text-pink-500'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-xs font-medium">{likeCount + (isLiked ? 1 : 0)}</span>
          </button>
          
          {/* Preview button on hover */}
          <div
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <button className="btn-glow px-6 py-3 rounded-xl text-white font-semibold shadow-lg">
              Preview
            </button>
          </div>
        </div>
        
        {/* Content info */}
        <div className="p-4">
          <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2 font-display group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
          
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-xs font-bold text-white">
              {author.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-gray-600">{author}</span>
          </div>
          
          {/* Quality ratings */}
          {qualityRatings && (
            <div className="mb-3">
              <QualityBadges counts={qualityRatings} />
            </div>
          )}
          
          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="text-gray-700 font-medium">{rating.toFixed(1)}</span>
                <span className="text-gray-400">({reviewCount})</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-gray-400" />
                <span>{readCount}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-blue-600">
              <Clock className="w-3.5 h-3.5" />
              <span className="font-medium">{sessionDuration}min</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
