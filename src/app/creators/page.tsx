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
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-purple-500 rounded-full filter blur-[128px] opacity-20" />
          <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-cyan-500 rounded-full filter blur-[128px] opacity-20" />
        </div>
        
        <div className="container mx-auto px-6 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 glow-purple">
              <span className="text-sm font-medium text-purple-400">For Creators</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white font-display mb-6">
              Turn Your Knowledge Into{" "}
              <span className="gradient-text">Revenue</span>
            </h1>
            
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              Join thousands of creators earning from their premium content. 
              Set your prices, control access, and get paid for every read.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/sign-up"
                className="btn-glow inline-flex items-center justify-center px-8 py-4 text-white rounded-xl text-lg font-semibold"
              >
                Start Creating Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center px-8 py-4 text-gray-300 glass rounded-xl hover:bg-white/10 transition-all text-lg font-medium"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Grid */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white font-display mb-4">Everything You Need to Succeed</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Powerful tools and features designed to help you monetize your content effectively.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="glass rounded-xl p-6 hover:bg-white/10 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400/20 to-cyan-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* How It Works */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent" />
        <div className="container mx-auto px-6 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white font-display mb-4">How It Works</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Get started in three simple steps and begin earning from your content today.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="text-6xl font-bold font-mono gradient-text mb-4">{step.number}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-gray-400">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Earnings Calculator */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6">
          <div className="glass-strong rounded-2xl p-12 max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white font-display mb-4">Potential Earnings</h2>
              <p className="text-gray-400">See how much you could earn with PayPerRead</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="glass rounded-xl p-6">
                <div className="text-sm text-gray-400 mb-2">100 readers/month</div>
                <div className="text-3xl font-bold font-mono gradient-text">$499</div>
                <div className="text-xs text-gray-500 mt-1">at $4.99/session</div>
              </div>
              <div className="glass rounded-xl p-6 border border-cyan-400/30">
                <div className="text-sm text-gray-400 mb-2">500 readers/month</div>
                <div className="text-3xl font-bold font-mono gradient-text">$2,495</div>
                <div className="text-xs text-gray-500 mt-1">at $4.99/session</div>
              </div>
              <div className="glass rounded-xl p-6">
                <div className="text-sm text-gray-400 mb-2">1,000 readers/month</div>
                <div className="text-3xl font-bold font-mono gradient-text">$4,990</div>
                <div className="text-xs text-gray-500 mt-1">at $4.99/session</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 to-transparent" />
        <div className="container mx-auto px-6 text-center relative">
          <h2 className="text-4xl font-bold text-white font-display mb-4">Ready to Start Earning?</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Join PayPerRead today and turn your expertise into income. No upfront costs, no commitments.
          </p>
          <Link
            href="/sign-up"
            className="btn-glow inline-flex items-center px-8 py-4 text-white rounded-xl text-lg font-semibold"
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
