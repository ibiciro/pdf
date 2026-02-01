"use client";

import Link from "next/link";
import { ArrowRight, Clock, Shield, Zap, Play, Pause } from "lucide-react";
import { useState, useEffect } from "react";

function TimerDemo() {
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = (timeLeft / 300) * 100;

  return (
    <div className="relative bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden max-w-md mx-auto">
      {/* Timer Header */}
      <div className="bg-gray-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
            <Clock className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-white font-semibold text-sm">Reading Session</div>
            <div className="text-gray-400 text-xs">Time remaining</div>
          </div>
        </div>
        <div className="text-2xl font-mono font-bold text-white">
          {formatTime(timeLeft)}
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="h-1 bg-gray-100">
        <div 
          className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Content Preview */}
      <div className="p-6">
        <div className="mb-4">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Premium Content</span>
          <h3 className="text-lg font-semibold text-gray-900 mt-1">5 Steps to Master Cold Outreach</h3>
        </div>
        
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-6 h-6 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">1</div>
            <p className="text-sm text-gray-600">Research your prospect's recent activities and pain points...</p>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-6 h-6 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">2</div>
            <p className="text-sm text-gray-600">Craft a personalized opening line that shows you understand...</p>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
            <div className="w-6 h-6 rounded-full bg-gray-300 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">3</div>
            <p className="text-sm text-gray-400 italic">Continue reading to unlock...</p>
          </div>
        </div>
        
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4" />
              Pause Session
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Start Demo
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <div className="relative min-h-screen bg-white overflow-hidden">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      
      <div className="relative container mx-auto px-6 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Content */}
          <div className="max-w-xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm mb-8">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-gray-600 font-medium">New: Quality ratings & creator analytics</span>
            </div>

            {/* Main heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-6">
              Sell your
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-600 to-gray-400">
                facts, steps & skills
              </span>
            </h1>

            <p className="text-lg text-gray-500 leading-relaxed mb-8">
              Turn your expertise into income. Create timed reading sessions for your guides, tutorials, strategies, or insights. Readers pay once, read within the time limit.{" "}
              <span className="text-gray-900 font-medium">You keep 85%.</span>
            </p>

            {/* Value props */}
            <div className="flex flex-wrap gap-4 mb-10">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>Timed sessions</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="w-4 h-4 text-gray-400" />
                <span>Copy protection</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Zap className="w-4 h-4 text-gray-400" />
                <span>Instant payouts</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center px-8 py-4 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-all hover:scale-[1.02] shadow-lg shadow-gray-900/10"
              >
                Start creating — it's free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>

              <Link
                href="/browse"
                className="inline-flex items-center justify-center px-8 py-4 text-gray-600 bg-white border border-gray-200 rounded-full font-medium hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                Browse content
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-6 pt-6 border-t border-gray-100">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-500"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <span className="text-gray-900 font-semibold">10,000+</span>
                <span className="text-gray-500"> creators earning</span>
              </div>
            </div>
          </div>

          {/* Right Column - Timer Demo */}
          <div className="relative lg:pl-8">
            {/* Decorative elements */}
            <div className="absolute -top-10 -right-10 w-72 h-72 bg-gradient-to-br from-gray-100 to-gray-50 rounded-full blur-3xl opacity-60" />
            <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-gradient-to-br from-gray-50 to-white rounded-full blur-3xl opacity-60" />
            
            <div className="relative">
              <TimerDemo />
              
              {/* Floating badges */}
              <div className="absolute -top-4 -left-4 bg-white rounded-xl shadow-lg px-4 py-2 border border-gray-100">
                <div className="text-xs text-gray-500">Price</div>
                <div className="text-lg font-bold text-gray-900">$4.99</div>
              </div>
              
              <div className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-lg px-4 py-2 border border-gray-100">
                <div className="text-xs text-gray-500">Your earnings</div>
                <div className="text-lg font-bold text-green-600">$4.24</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
