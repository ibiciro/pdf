import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import Link from "next/link";
import { ArrowRight, DollarSign, BarChart3, Shield, Clock, Users, Zap, Check, FileText, File } from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Text & PDF Support",
    description: "Write articles directly or upload PDF documents. We're optimized for text-based content.",
  },
  {
    icon: DollarSign,
    title: "Earn Per Session",
    description: "Set your own prices and earn every time a reader purchases access to your content.",
  },
  {
    icon: Clock,
    title: "Timed Access Model",
    description: "Create urgency with time-limited sessions. Readers value their time and your content.",
  },
  {
    icon: BarChart3,
    title: "Detailed Analytics",
    description: "Track reads, earnings, engagement, and more with our comprehensive dashboard.",
  },
  {
    icon: Shield,
    title: "Content Protection",
    description: "Your text and PDF content is protected in our secure reading environment.",
  },
  {
    icon: Zap,
    title: "Instant Payouts",
    description: "Get paid quickly with our streamlined payment processing. No waiting weeks.",
  },
];

const steps = [
  {
    number: "01",
    title: "Create Your Account",
    description: "Sign up for free and set up your creator profile in minutes.",
  },
  {
    number: "02",
    title: "Add Text or PDF Content",
    description: "Write text articles in our editor or upload PDF documents. Set your price and session duration.",
  },
  {
    number: "03",
    title: "Start Earning",
    description: "Publish your content and start earning from every reader session.",
  },
];

export default function CreatorsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-br from-violet-50 via-white to-blue-50">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-violet-300 rounded-full filter blur-[128px] opacity-30" />
          <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-blue-300 rounded-full filter blur-[128px] opacity-30" />
        </div>
        
        <div className="container mx-auto px-6 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 border border-violet-200 mb-8">
              <span className="text-sm font-medium text-violet-700">For Creators</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 font-display mb-6">
              Turn Your Knowledge Into{" "}
              <span className="gradient-text">Revenue</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Join thousands of creators earning from their premium content. 
              Set your prices, control access, and get paid for every read.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/sign-up"
                className="btn-glow inline-flex items-center justify-center px-8 py-4 text-white rounded-xl text-lg font-semibold shadow-lg"
              >
                Start Creating Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center px-8 py-4 text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-lg font-medium shadow-sm"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Grid */}
      <section className="py-24 relative bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 font-display mb-4">Everything You Need to Succeed</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Powerful tools and features designed to help you monetize your content effectively.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-all group border border-gray-100">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-blue-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-violet-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* How It Works */}
      <section className="py-24 relative bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-6 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 font-display mb-4">How It Works</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Get started in three simple steps and begin earning from your content today.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="text-6xl font-bold font-mono gradient-text mb-4">{step.number}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Earnings Calculator */}
      <section className="py-24 relative bg-white">
        <div className="container mx-auto px-6">
          <div className="bg-gradient-to-br from-violet-50 to-blue-50 rounded-2xl p-12 max-w-4xl mx-auto border border-violet-100">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 font-display mb-4">Potential Earnings</h2>
              <p className="text-gray-500">See how much you could earn with PayPerRead</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="text-sm text-gray-500 mb-2">100 readers/month</div>
                <div className="text-3xl font-bold font-mono gradient-text">$499</div>
                <div className="text-xs text-gray-400 mt-1">at $4.99/session</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-md border-2 border-violet-300 ring-2 ring-violet-100">
                <div className="text-sm text-violet-600 mb-2">500 readers/month</div>
                <div className="text-3xl font-bold font-mono gradient-text">$2,495</div>
                <div className="text-xs text-gray-400 mt-1">at $4.99/session</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="text-sm text-gray-500 mb-2">1,000 readers/month</div>
                <div className="text-3xl font-bold font-mono gradient-text">$4,990</div>
                <div className="text-xs text-gray-400 mt-1">at $4.99/session</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-24 relative bg-gradient-to-br from-violet-600 to-blue-600">
        <div className="container mx-auto px-6 text-center relative">
          <h2 className="text-4xl font-bold text-white font-display mb-4">Ready to Start Earning?</h2>
          <p className="text-violet-100 mb-8 max-w-2xl mx-auto">
            Join PayPerRead today and turn your expertise into income. No upfront costs, no commitments.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center px-8 py-4 bg-white text-violet-600 rounded-xl text-lg font-semibold shadow-lg hover:bg-gray-50 transition-colors"
          >
            Create Your Account
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
