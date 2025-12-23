import Link from "next/link";
import { ArrowRight, Sparkles, FileText, File } from 'lucide-react';

export default function Hero() {
  return (
    <div className="relative min-h-[90vh] overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-violet-50/30">
      {/* Subtle gradient orbs */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200 rounded-full filter blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-200 rounded-full filter blur-[128px]" />
      </div>
      
      <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-32">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-5xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-8">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">Text & PDF Content Platform</span>
            </div>
            
            <h1 className="text-5xl sm:text-7xl font-extrabold mb-8 tracking-tight font-display leading-tight">
              <span className="text-gray-900">Monetize Your</span>
              <br />
              <span className="gradient-text">
                Text & PDF Content
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Create timed, pay-per-session reading experiences. Readers pay to unlock your premium articles and PDF documents for a limited time.
            </p>

            {/* Content Type Badges */}
            <div className="flex items-center justify-center gap-4 mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-50 border border-violet-200">
                <FileText className="w-5 h-5 text-violet-600" />
                <span className="text-sm font-semibold text-violet-700">Text Articles</span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 border border-red-200">
                <File className="w-5 h-5 text-red-600" />
                <span className="text-sm font-semibold text-red-700">PDF Documents</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/sign-up"
                className="btn-glow inline-flex items-center px-8 py-4 text-white rounded-xl text-lg font-semibold shadow-lg"
              >
                Start Creating
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              
              <Link
                href="/browse"
                className="inline-flex items-center px-8 py-4 text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-lg font-medium shadow-sm"
              >
                Explore Content
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-20 grid grid-cols-3 gap-8 max-w-3xl mx-auto">
              {[
                { value: "$2.5M+", label: "Creator Earnings" },
                { value: "50K+", label: "Active Readers" },
                { value: "10K+", label: "Text & PDF Content" },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold font-mono gradient-text mb-2">{stat.value}</div>
                  <div className="text-gray-500 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
