import Link from "next/link";
import { ArrowRight, Play, CheckCircle, Sparkles, Shield, Clock, DollarSign, Users, TrendingUp } from 'lucide-react';

export default function Hero() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-violet-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-tr from-emerald-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-violet-200/20 to-pink-200/20 rounded-full blur-3xl" />
        
        {/* Floating icons */}
        <div className="absolute top-32 left-[15%] w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center animate-bounce delay-100">
          <DollarSign className="w-6 h-6 text-green-500" />
        </div>
        <div className="absolute top-48 right-[20%] w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center animate-bounce delay-300">
          <Shield className="w-5 h-5 text-blue-500" />
        </div>
        <div className="absolute bottom-32 left-[25%] w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center animate-bounce delay-500">
          <Clock className="w-5 h-5 text-violet-500" />
        </div>
      </div>
      
      <div className="relative pt-24 pb-20 lg:pt-32">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column - Content */}
            <div className="max-w-xl">
              {/* Announcement badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-violet-500/10 border border-blue-200/50 rounded-full text-sm mb-8 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-gray-700 font-medium">New: Multiple payment gateways supported</span>
                <ArrowRight className="w-4 h-4 text-blue-600" />
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-6">
                Monetize your
                <br />
                <span className="relative">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600">
                    premium content
                  </span>
                  <svg className="absolute -bottom-2 left-0 w-full h-3 text-blue-500/30" viewBox="0 0 300 12" fill="none">
                    <path d="M2 8C50 4 150 2 298 8" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                  </svg>
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                Create protected, timed reading sessions. Set your price, share your link, 
                and get paid <span className="font-semibold text-gray-900">instantly</span> — every single time someone reads.
              </p>

              {/* Feature list */}
              <ul className="grid sm:grid-cols-2 gap-3 mb-10">
                {[
                  { icon: <DollarSign className="w-4 h-4" />, text: 'Pay-per-read earnings' },
                  { icon: <Shield className="w-4 h-4" />, text: 'Piracy protection' },
                  { icon: <Clock className="w-4 h-4" />, text: 'Timed sessions' },
                  { icon: <TrendingUp className="w-4 h-4" />, text: 'Real-time analytics' },
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white flex-shrink-0">
                      {feature.icon}
                    </div>
                    <span className="font-medium">{feature.text}</span>
                  </li>
                ))}
              </ul>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  href="/sign-up"
                  className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-full font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-105 transition-all duration-300"
                >
                  Start earning today
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <Link
                  href="/browse"
                  className="inline-flex items-center justify-center px-8 py-4 text-gray-700 bg-white border-2 border-gray-200 rounded-full font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-300"
                >
                  <Play className="mr-2 w-5 h-5 text-blue-600" />
                  Explore content
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center gap-6 lg:gap-10 pt-8 border-t border-gray-200/70">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">$2.5M+</div>
                    <div className="text-sm text-gray-500">Paid to creators</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">50K+</div>
                    <div className="text-sm text-gray-500">Active readers</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                    <span className="text-white text-lg">★</span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">4.9</div>
                    <div className="text-sm text-gray-500">Average rating</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Visual */}
            <div className="relative lg:pl-8">
              {/* Main card preview */}
              <div className="relative">
                {/* Background decoration */}
                <div className="absolute -inset-8 bg-gradient-to-r from-blue-500/20 via-violet-500/20 to-purple-500/20 rounded-[40px] blur-2xl" />
                
                {/* Preview cards stack */}
                <div className="relative">
                  {/* Back card */}
                  <div className="absolute -right-4 -top-4 w-full bg-gradient-to-br from-violet-100 to-purple-100 rounded-3xl h-full transform rotate-3 opacity-60" />
                  
                  {/* Main card */}
                  <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                    <div className="relative">
                      <img 
                        src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=800&q=80" 
                        alt="Content creation"
                        className="w-full h-56 object-cover"
                      />
                      <div className="absolute top-4 right-4 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-green-700 flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        Live Now
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                          Premium
                        </span>
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          30 min session
                        </span>
                      </div>
                      <h3 className="font-bold text-xl text-gray-900 mb-3">
                        The Future of Content Monetization
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        Learn how top creators are earning $10K+ monthly with protected premium content...
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white font-semibold">
                            S
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-900">Sarah Chen</span>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <span className="text-amber-500">★</span> 4.9 · 1.2K reads
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">$4.99</div>
                          <div className="text-xs text-gray-500">per read</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating earnings card */}
                <div className="absolute -right-6 -bottom-6 bg-white rounded-2xl shadow-xl p-5 border border-gray-100 backdrop-blur-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                      <TrendingUp className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">+$1,234</div>
                      <div className="text-sm text-green-600 font-medium">↑ 23% this week</div>
                    </div>
                  </div>
                </div>

                {/* Floating notification */}
                <div className="absolute -left-6 top-1/4 bg-white rounded-2xl shadow-xl p-4 border border-gray-100 max-w-[220px] backdrop-blur-sm animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">New sale!</p>
                      <p className="text-xs text-gray-500">You earned $4.99</p>
                    </div>
                  </div>
                </div>

                {/* Protected badge */}
                <div className="absolute left-1/2 -translate-x-1/2 -bottom-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg">
                  <Shield className="w-4 h-4" />
                  Content Protected
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Brands/Trust bar */}
      <div className="relative bg-gray-50/80 backdrop-blur-sm border-y border-gray-200/50 py-8">
        <div className="container mx-auto px-6">
          <p className="text-center text-sm text-gray-500 mb-6">Trusted by creators using</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            {['Stripe', 'PayPal', 'Paystack', 'Flutterwave'].map((name) => (
              <div key={name} className="text-xl font-bold text-gray-400 hover:text-gray-700 transition-colors cursor-pointer">
                {name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
