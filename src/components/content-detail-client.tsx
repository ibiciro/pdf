'use client';

import { useState } from 'react';
import { Star, Clock, Eye, Heart, User as UserIcon, Calendar, FileText, ArrowRight, X } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import PaymentModal from './payment-modal';
import QualityRating, { QualityBadges } from './quality-rating';

interface ContentDetailClientProps {
  content: {
    id: string;
    title: string;
    description: string;
    author: string;
    authorBio: string;
    thumbnail: string;
    price: number;
    sessionDuration: number;
    rating: number;
    reviewCount: number;
    readCount: number;
    likeCount: number;
    contentType: string;
    createdAt: string;
    qualityRatings?: {
      facts: number;
      works: number;
      elite: number;
      expert: number;
      doesnt_work: number;
    };
  };
  user: User | null;
}

export default function ContentDetailClient({ content, user }: ContentDetailClientProps) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const handlePayAndRead = () => {
    if (!user) {
      window.location.href = '/sign-in';
      return;
    }
    setShowPaymentModal(true);
  };

  // Mock quality ratings for demo
  const qualityRatings = content.qualityRatings || {
    facts: 45,
    works: 89,
    elite: 23,
    expert: 67,
    doesnt_work: 3,
  };

  return (
    <>
      <main className="pt-20">
        {/* Hero Section */}
        <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${content.thumbnail})`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-white" />
          
          {/* Content */}
          <div className="relative h-full container mx-auto px-6 flex items-end pb-16">
            <div className="max-w-3xl">
              {/* Content Type Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full mb-6 shadow-sm">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-600 capitalize font-medium">{content.contentType}</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-white font-display mb-4 drop-shadow-lg">
                {content.title}
              </h1>
            </div>
          </div>
        </div>
        
        {/* Main Content Section */}
        <div className="container mx-auto px-6 py-12 -mt-8">
          <div className="max-w-4xl mx-auto">
            {/* Author & Stats Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                {/* Author Info */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-xl font-bold text-white">
                    {content.author.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{content.author}</div>
                    <div className="text-sm text-gray-500">{content.authorBio}</div>
                  </div>
                </div>
                
                {/* Stats Row */}
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="text-gray-900 font-semibold">{content.rating}</span>
                    <span className="text-gray-400">({content.reviewCount})</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Eye className="w-4 h-4" />
                    <span>{content.readCount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Heart className="w-4 h-4" />
                    <span>{content.likeCount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(content.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              {/* Quality Ratings */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Community Ratings</span>
                  <QualityBadges counts={qualityRatings} />
                </div>
              </div>
            </div>
            
            {/* Payment Card */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-4 mb-2">
                    <span className="text-4xl font-bold font-mono gradient-text">
                      ${(content.price / 100).toFixed(2)}
                    </span>
                    <span className="text-gray-500">per session</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-600">
                    <Clock className="w-5 h-5" />
                    <span className="font-medium">{content.sessionDuration} minutes access</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsLiked(!isLiked)}
                    className={`p-4 rounded-xl transition-all ${
                      isLiked
                        ? 'bg-pink-100 text-pink-500'
                        : 'bg-gray-100 text-gray-400 hover:text-pink-500'
                    }`}
                  >
                    <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
                  </button>
                  
                  <button
                    onClick={handlePayAndRead}
                    className="btn-glow px-8 py-4 rounded-xl text-white font-semibold text-lg flex items-center gap-2"
                  >
                    Pay & Read Now
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Content Preview */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 font-display mb-6">About This Content</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                {content.description}
              </p>
              <p className="text-gray-500 leading-relaxed">
                This premium content is available for timed reading sessions. Once you purchase access, 
                you'll have {content.sessionDuration} minutes to read the full content. You can extend 
                your session at any time if you need more time.
              </p>
            </div>
            
            {/* Reviews Section */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 font-display">Reviews</h2>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <span className="text-gray-900 font-semibold">{content.rating}</span>
                  <span className="text-gray-400">({content.reviewCount} reviews)</span>
                </div>
              </div>
              
              {/* Sample Reviews */}
              <div className="space-y-6">
                {[
                  {
                    author: 'John D.',
                    rating: 5,
                    text: 'Incredibly insightful content. Worth every penny!',
                    date: '2 days ago',
                  },
                  {
                    author: 'Maria S.',
                    rating: 5,
                    text: 'The author really knows their stuff. Highly recommended.',
                    date: '1 week ago',
                  },
                  {
                    author: 'Alex K.',
                    rating: 4,
                    text: 'Great content, learned a lot. Would love more examples.',
                    date: '2 weeks ago',
                  },
                ].map((review, index) => (
                  <div key={index} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-xs font-bold text-white">
                          {review.author.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900">{review.author}</span>
                      </div>
                      <span className="text-sm text-gray-400">{review.date}</span>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-gray-600">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          content={content}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </>
  );
}
