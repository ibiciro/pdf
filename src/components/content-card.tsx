'use client';

import { useState } from 'react';
import { Heart, Bookmark, FileText, User } from 'lucide-react';
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
  authorAvatar,
  thumbnail,
  price,
  contentType = 'text',
  category,
  categoryColor,
  likeCount = 0,
}: ContentCardProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [currentLikes, setCurrentLikes] = useState(likeCount);

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
      indigo: 'bg-indigo-100 text-indigo-700',
      orange: 'bg-orange-100 text-orange-700',
      teal: 'bg-teal-100 text-teal-700',
      rose: 'bg-rose-100 text-rose-700',
    };
    return colorMap[color || 'blue'] || colorMap.blue;
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLiked(!liked);
    setCurrentLikes(prev => liked ? prev - 1 : prev + 1);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSaved(!saved);
  };

  return (
    <Link href={`/content/${id}`}>
      <div className="group cursor-pointer bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-300">
        {/* Thumbnail with overlay */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
              <FileText className={`w-12 h-12 ${contentType === 'pdf' ? 'text-red-300' : 'text-violet-300'}`} />
            </div>
          )}
          
          {/* Content type badge */}
          <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
            contentType === 'pdf' 
              ? 'bg-red-500/90 text-white' 
              : 'bg-violet-500/90 text-white'
          }`}>
            {contentType === 'pdf' ? 'PDF' : 'Article'}
          </div>
          
          {/* Price badge */}
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-bold text-gray-900 shadow-sm">
            ${(price / 100).toFixed(2)}
          </div>

          {/* Category badge at bottom */}
          {category && (
            <div className="absolute bottom-3 left-3">
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${getCategoryColorClass(categoryColor)}`}>
                {category}
              </span>
            </div>
          )}
        </div>
        
        {/* Content info */}
        <div className="p-4">
          {/* Title */}
          <h3 className="text-base font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">
            {title}
          </h3>
          
          {/* Author and actions row */}
          <div className="flex items-center justify-between">
            {/* Author */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center flex-shrink-0">
                {authorAvatar ? (
                  <img src={authorAvatar} alt={author} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User className="w-3.5 h-3.5 text-white" />
                )}
              </div>
              <span className="text-sm text-gray-600 truncate max-w-[100px]">{author}</span>
            </div>
            
            {/* Like and Save buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full transition-all ${
                  liked 
                    ? 'bg-red-50 text-red-500' 
                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                }`}
              >
                <Heart className={`w-4 h-4 ${liked ? 'fill-red-500' : ''}`} />
                {currentLikes > 0 && (
                  <span className="text-xs font-medium">{currentLikes}</span>
                )}
              </button>
              
              <button
                onClick={handleSave}
                className={`p-1.5 rounded-full transition-all ${
                  saved 
                    ? 'bg-blue-50 text-blue-500' 
                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${saved ? 'fill-blue-500' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
