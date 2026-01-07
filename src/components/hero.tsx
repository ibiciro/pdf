import Link from "next/link";
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <div className="relative min-h-[85vh] bg-white flex items-center pt-20">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-white" />
      
      <div className="relative container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm mb-8">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-gray-600">Join 10,000+ creators earning daily</span>
          </div>
          
          {/* Main heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-6">
            Get paid for
            <br />
            <span className="text-gray-400">every read</span>
          </h1>
          
          <p className="text-xl text-gray-500 leading-relaxed mb-10 max-w-xl mx-auto">
            Upload your content, set your price, share your link. 
            Readers pay per session. You keep 85%.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center px-8 py-4 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
            >
              Start earning
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            
            <Link
              href="/browse"
              className="inline-flex items-center justify-center px-8 py-4 text-gray-600 bg-white border border-gray-200 rounded-full font-medium hover:bg-gray-50 transition-colors"
            >
              Browse content
            </Link>
          </div>

          {/* Stats - Simple */}
          <div className="flex justify-center gap-12 sm:gap-16 pt-8 border-t border-gray-100">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">$2.5M+</div>
              <div className="text-sm text-gray-400">Creator earnings</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">50K+</div>
              <div className="text-sm text-gray-400">Content pieces</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">85%</div>
              <div className="text-sm text-gray-400">Revenue share</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
