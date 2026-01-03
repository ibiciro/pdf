import Link from "next/link";
import { ArrowRight, Play, CheckCircle } from 'lucide-react';

export default function Hero() {
  return (
    <div className="relative min-h-screen bg-white overflow-hidden">
      {/* Minimal background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-gray-50 to-transparent" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 -translate-x-1/2 translate-y-1/2" />
      </div>
      
      <div className="relative pt-24 pb-16 lg:pt-32">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Content */}
            <div className="max-w-xl">
              {/* Small badge */}
              <div className="inline-flex items-center gap-2 text-sm text-gray-500 mb-6">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Trusted by 10,000+ creators</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight tracking-tight mb-6">
                Content that
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">
                  pays you back
                </span>
              </h1>
              
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                Turn your knowledge into income. Create timed reading sessions, 
                set your price, and earn every time someone reads your content.
              </p>

              {/* Feature list */}
              <ul className="space-y-3 mb-10">
                {[
                  'Pay-per-read model — earn with every view',
                  'Protected content — no copying or screenshots',
                  'Instant payouts to your account',
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/sign-up"
                  className="inline-flex items-center justify-center px-8 py-4 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-800 transition-colors"
                >
                  Start for free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                
                <Link
                  href="/browse"
                  className="inline-flex items-center justify-center px-8 py-4 text-gray-700 bg-gray-100 rounded-full font-semibold hover:bg-gray-200 transition-colors"
                >
                  <Play className="mr-2 w-5 h-5" />
                  See how it works
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center gap-8 mt-12 pt-8 border-t border-gray-100">
                <div>
                  <div className="text-2xl font-bold text-gray-900">$2.5M+</div>
                  <div className="text-sm text-gray-500">Paid to creators</div>
                </div>
                <div className="w-px h-10 bg-gray-200" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">50K+</div>
                  <div className="text-sm text-gray-500">Active readers</div>
                </div>
                <div className="w-px h-10 bg-gray-200" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">4.9★</div>
                  <div className="text-sm text-gray-500">Average rating</div>
                </div>
              </div>
            </div>

            {/* Right Column - Visual */}
            <div className="relative lg:pl-8">
              {/* Main card preview */}
              <div className="relative">
                {/* Background decoration */}
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-100 to-violet-100 rounded-3xl blur-2xl opacity-40" />
                
                {/* Preview image */}
                <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
                  <img 
                    src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=800&q=80" 
                    alt="Content creation"
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        Live
                      </span>
                      <span className="text-sm text-gray-500">30 min session</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      The Future of Content Monetization
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-500" />
                        <span className="text-sm text-gray-600">Sarah Chen</span>
                      </div>
                      <div className="font-bold text-gray-900">$4.99</div>
                    </div>
                  </div>
                </div>

                {/* Floating stats card */}
                <div className="absolute -right-4 -bottom-4 bg-white rounded-xl shadow-lg p-4 border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-green-600 font-bold">↑</span>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">+$1,234</div>
                      <div className="text-xs text-gray-500">This week</div>
                    </div>
                  </div>
                </div>

                {/* Floating notification */}
                <div className="absolute -left-4 top-1/3 bg-white rounded-xl shadow-lg p-3 border border-gray-100 max-w-[200px]">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 text-sm">💰</span>
                    </div>
                    <div className="text-xs">
                      <span className="font-semibold text-gray-900">New sale!</span>
                      <span className="text-gray-500"> just now</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
