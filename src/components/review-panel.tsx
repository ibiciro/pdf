'use client';

import { useState } from 'react';
import { Star, Heart, X, Send, Check, Sparkles, Zap, Award, AlertTriangle, BookCheck } from 'lucide-react';

interface ReviewPanelProps {
  contentTitle: string;
  contentId?: string;
  onSubmit: () => void;
  onClose: () => void;
}

const qualityOptions = [
  { id: 'facts', label: 'Facts', icon: BookCheck, color: 'blue', description: 'Factual & accurate' },
  { id: 'works', label: 'Works', icon: Check, color: 'green', description: 'Practical & useful' },
  { id: 'elite', label: 'Elite', icon: Sparkles, color: 'purple', description: 'Exceptional quality' },
  { id: 'expert', label: 'Expert', icon: Award, color: 'amber', description: 'Expert-level content' },
  { id: 'doesnt_work', label: "Doesn't Work", icon: AlertTriangle, color: 'red', description: 'Needs improvement' },
];

const colorClasses: Record<string, { bg: string; text: string; border: string; active: string }> = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', active: 'bg-blue-100 border-blue-400' },
  green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200', active: 'bg-green-100 border-green-400' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', active: 'bg-purple-100 border-purple-400' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', active: 'bg-amber-100 border-amber-400' },
  red: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', active: 'bg-red-100 border-red-400' },
};

export default function ReviewPanel({ contentTitle, contentId, onSubmit, onClose }: ReviewPanelProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [qualityRating, setQualityRating] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    onSubmit();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Panel */}
      <div className="relative w-full max-w-2xl bg-white rounded-t-3xl overflow-hidden animate-in slide-in-from-bottom duration-500 shadow-2xl">
        {/* Handle */}
        <div className="flex justify-center pt-4 pb-2">
          <div className="w-12 h-1.5 rounded-full bg-gray-200" />
        </div>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400"
        >
          <X className="w-5 h-5" />
        </button>
        
        {/* Content */}
        <div className="p-8">
          <h3 className="text-2xl font-bold text-gray-900 font-display mb-2">How was your experience?</h3>
          <p className="text-gray-500 mb-8">Share your thoughts on "{contentTitle}"</p>
          
          {/* Quality Rating */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">Rate Content Quality</label>
            <div className="flex flex-wrap gap-2">
              {qualityOptions.map((option) => {
                const colors = colorClasses[option.color];
                const isSelected = qualityRating === option.id;
                
                return (
                  <button
                    key={option.id}
                    onClick={() => setQualityRating(option.id)}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                      border transition-all duration-200
                      ${isSelected ? colors.active : `${colors.bg} ${colors.border} hover:opacity-80`}
                      ${colors.text}
                    `}
                    title={option.description}
                  >
                    <option.icon className="w-4 h-4" />
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Star Rating */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">Your Rating</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-gray-200'
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-4 text-lg font-medium text-gray-700">
                  {rating === 5 ? 'Excellent!' : rating === 4 ? 'Great!' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Poor'}
                </span>
              )}
            </div>
          </div>
          
          {/* Review Text */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">Your Review (Optional)</label>
            <div className="relative">
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your thoughts about this content..."
                maxLength={500}
                rows={4}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 resize-none"
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                {reviewText.length}/500
              </div>
            </div>
          </div>
          
          {/* Like Button */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">Show Your Appreciation</label>
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all ${
                isLiked
                  ? 'bg-pink-100 text-pink-600 border border-pink-300'
                  : 'bg-gray-50 border border-gray-200 text-gray-500 hover:text-pink-500 hover:border-pink-200'
              }`}
            >
              <Heart className={`w-6 h-6 transition-transform ${isLiked ? 'fill-current scale-110' : ''}`} />
              <span className="font-medium">{isLiked ? 'Liked!' : 'Like this content'}</span>
            </button>
          </div>
          
          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 py-4 bg-gray-100 rounded-xl text-gray-600 font-medium hover:bg-gray-200 transition-colors"
            >
              Skip
            </button>
            <button
              onClick={handleSubmit}
              disabled={rating === 0 || isSubmitting}
              className="flex-1 btn-glow py-4 rounded-xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                'Submitting...'
              ) : (
                <>
                  Submit Review
                  <Send className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
