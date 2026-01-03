'use client';

import { useState, useEffect } from 'react';
import { Star, Clock, Eye, Heart, User as UserIcon, Calendar, FileText, ArrowRight, X, Download, Shield, Lock, Loader2, ThumbsUp, CheckCircle } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import PaymentModal from './payment-modal';
import SecureDownloadModal from './secure-download-modal';
import QualityRating, { QualityBadges } from './quality-rating';
import { createClient } from '../../supabase/client';

interface ContentDetailClientProps {
  content: {
    id: string;
    title: string;
    description: string;
    author: string;
    authorBio: string;
    thumbnail: string | null;
    price: number;
    sessionDuration: number;
    rating: number;
    reviewCount: number;
    readCount: number;
    likeCount: number;
    contentType: 'text' | 'pdf';
    createdAt: string;
    allowDownload?: boolean;
    downloadPrice?: number;
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
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(content.likeCount);
  const [isLiking, setIsLiking] = useState(false);
  const [hasActiveSession, setHasActiveSession] = useState(false);

  // Check like status and active session on mount
  useEffect(() => {
    const checkStatus = async () => {
      if (!user) return;
      
      const supabase = createClient();
      
      // Check like status
      const { data: like } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('content_id', content.id)
        .single();
      
      setIsLiked(!!like);
      
      // Check for active session
      const { data: session } = await supabase
        .from('reading_sessions')
        .select('id')
        .eq('reader_id', user.id)
        .eq('content_id', content.id)
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString())
        .single();
      
      setHasActiveSession(!!session);
    };
    
    checkStatus();
  }, [user, content.id]);

  const handlePayAndRead = () => {
    if (!user) {
      window.location.href = '/sign-in';
      return;
    }
    
    // If user has active session, go directly to read
    if (hasActiveSession) {
      window.location.href = `/read/${content.id}`;
      return;
    }
    
    setShowPaymentModal(true);
  };

  const handleDownload = () => {
    if (!user) {
      window.location.href = '/sign-in';
      return;
    }
    setShowDownloadModal(true);
  };

  const handleLike = async () => {
    if (!user) {
      window.location.href = '/sign-in';
      return;
    }
    
    setIsLiking(true);
    
    try {
      const supabase = createClient();
      
      if (isLiked) {
        // Unlike
        await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('content_id', content.id);
        
        setIsLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
      } else {
        // Like
        await supabase
          .from('likes')
          .insert({
            user_id: user.id,
            content_id: content.id,
          });
        
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsLiking(false);
    }
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
          {/* Background Image or Gradient */}
          {content.thumbnail ? (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${content.thumbnail})`,
              }}
            />
          ) : (
            <div className={`absolute inset-0 ${
              content.contentType === 'pdf'
                ? 'bg-gradient-to-br from-red-100 via-red-50 to-orange-50'
                : 'bg-gradient-to-br from-violet-100 via-violet-50 to-purple-50'
            }`}>
              <div className="absolute inset-0 flex items-center justify-center opacity-20">
                <FileText className={`w-64 h-64 ${
                  content.contentType === 'pdf' ? 'text-red-300' : 'text-violet-300'
                }`} />
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-white" />
          
          {/* Content */}
          <div className="relative h-full container mx-auto px-6 flex items-end pb-16">
            <div className="max-w-3xl">
              {/* Content Type Badge */}
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 backdrop-blur-sm rounded-full mb-6 shadow-sm ${
                content.contentType === 'pdf' 
                  ? 'bg-red-500/90 text-white' 
                  : 'bg-violet-500/90 text-white'
              }`}>
                <FileText className="w-4 h-4" />
                <span className="text-sm capitalize font-semibold">
                  {content.contentType === 'pdf' ? 'PDF Document' : 'Text Article'}
                </span>
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
                    <Heart className={`w-4 h-4 ${isLiked ? 'text-pink-500 fill-pink-500' : ''}`} />
                    <span>{likeCount.toLocaleString()}</span>
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
                    onClick={handleLike}
                    disabled={isLiking}
                    className={`p-4 rounded-xl transition-all ${
                      isLiked
                        ? 'bg-pink-100 text-pink-500'
                        : 'bg-gray-100 text-gray-400 hover:text-pink-500 hover:bg-pink-50'
                    } disabled:opacity-50`}
                  >
                    {isLiking ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
                    )}
                  </button>
                  
                  <button
                    onClick={handlePayAndRead}
                    className={`px-8 py-4 rounded-xl font-semibold text-lg flex items-center gap-2 transition-all ${
                      hasActiveSession
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : 'btn-glow text-white'
                    }`}
                  >
                    {hasActiveSession ? (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Continue Reading
                      </>
                    ) : (
                      <>
                        Pay & Read Now
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
                
                {/* Download Option */}
                {content.allowDownload && content.downloadPrice && content.downloadPrice > 0 && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                          <Shield className="w-5 h-5 text-violet-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">Secure Download Available</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            Encrypted & device-locked
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleDownload}
                        className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium text-sm flex items-center gap-2 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        ${(content.downloadPrice / 100).toFixed(2)}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Content Preview */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 font-display mb-6">About This Content</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                {content.description}
              </p>
              
              {/* Protection Features */}
              <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800 text-sm">Protected Content</p>
                    <p className="text-xs text-green-600 mt-1">
                      This content is protected with encryption, watermarking, and anti-copy measures to ensure creators get fairly compensated.
                    </p>
                  </div>
                </div>
              </div>
              
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
      
      {/* Secure Download Modal */}
      {showDownloadModal && user && (
        <SecureDownloadModal
          isOpen={showDownloadModal}
          onClose={() => setShowDownloadModal(false)}
          content={{
            id: content.id,
            title: content.title,
            contentType: content.contentType,
            downloadPrice: content.downloadPrice || 0,
          }}
          user={{
            id: user.id,
            email: user.email || '',
          }}
        />
      )}
    </>
  );
}
