import Footer from "@/components/footer";
import Hero from "@/components/hero";
import Navbar from "@/components/navbar";
import ContentCard from "@/components/content-card";
import { ArrowRight, Clock, DollarSign, Shield, Zap, ChevronRight, Star } from 'lucide-react';
import { createClient } from "../../supabase/server";
import Link from "next/link";

// Featured content for demo
const featuredContent = [
  {
    id: '1',
    title: 'The Future of AI in Content Creation',
    author: 'Sarah Chen',
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
    price: 499,
    sessionDuration: 30,
    rating: 4.8,
    reviewCount: 124,
    readCount: 1520,
    likeCount: 342,
    contentType: 'text' as const,
  },
  {
    id: '2',
    title: 'Mastering Web3 Development',
    author: 'Alex Rivera',
    thumbnail: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80',
    price: 699,
    sessionDuration: 45,
    rating: 4.9,
    reviewCount: 89,
    readCount: 980,
    likeCount: 256,
    contentType: 'pdf' as const,
  },
  {
    id: '3',
    title: 'Investment Strategies for 2024',
    author: 'Michael Park',
    thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
    price: 899,
    sessionDuration: 60,
    rating: 4.7,
    reviewCount: 203,
    readCount: 2340,
    likeCount: 567,
    contentType: 'pdf' as const,
  },
];

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch real content from database
  const { data: dbContent } = await supabase
    .from('content')
    .select('*')
    .eq('status', 'published')
    .order('total_reads', { ascending: false })
    .limit(3);

  const displayContent = dbContent && dbContent.length > 0 
    ? dbContent.map(item => ({
        id: item.id,
        title: item.title,
        author: item.creator_name || 'Creator',
        thumbnail: item.thumbnail_url || 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=800&q=80',
        price: item.price_cents,
        sessionDuration: item.session_duration_minutes,
        rating: 4.8,
        reviewCount: item.total_reads || 0,
        readCount: item.total_reads || 0,
        likeCount: 0,
        contentType: item.content_type as 'text' | 'pdf',
      }))
    : featuredContent;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      
      {/* How it works - Simple 3 steps */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How it works</h2>
            <p className="text-gray-500">Three simple steps to start earning</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 max-w-4xl mx-auto">
            {[
              { step: '01', title: 'Create', desc: 'Upload your content and set your price per reading session' },
              { step: '02', title: 'Share', desc: 'Share your content link with your audience anywhere' },
              { step: '03', title: 'Earn', desc: 'Get paid instantly when readers purchase access' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="text-5xl font-bold text-gray-100 mb-4">{item.step}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Content */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Popular now</h2>
              <p className="text-gray-500">See what readers are loving</p>
            </div>
            <Link 
              href="/browse" 
              className="flex items-center gap-2 text-gray-900 hover:text-gray-600 transition-colors font-medium"
            >
              Browse all
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {displayContent.map((content) => (
              <ContentCard key={content.id} {...content} />
            ))}
          </div>
        </div>
      </section>

      {/* Features - Minimal */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Built for creators who value their work
              </h2>
              <p className="text-gray-500 mb-8">
                We handle the technical stuff so you can focus on creating great content.
              </p>
              
              <div className="space-y-6">
                {[
                  { icon: <Clock className="w-5 h-5" />, title: 'Timed Sessions', desc: 'Create urgency with time-limited access' },
                  { icon: <Shield className="w-5 h-5" />, title: 'Protected Content', desc: 'No copying, no screenshots, no piracy' },
                  { icon: <Zap className="w-5 h-5" />, title: 'Instant Payouts', desc: 'Get paid as soon as someone reads' },
                  { icon: <DollarSign className="w-5 h-5" />, title: 'You Set the Price', desc: 'Full control over your earnings' },
                ].map((feature, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 flex-shrink-0">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                      <p className="text-sm text-gray-500">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl p-8">
                <img 
                  src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80"
                  alt="Creator workspace"
                  className="rounded-xl shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof - Minimal */}
      <section className="py-16 bg-gray-50 border-y border-gray-100">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <span className="font-semibold text-gray-900">4.9/5</span>
              <span className="text-gray-500">from 2,000+ reviews</span>
            </div>
            <div className="h-6 w-px bg-gray-300 hidden md:block" />
            <div className="text-gray-500">
              Trusted by <span className="font-semibold text-gray-900">10,000+</span> creators worldwide
            </div>
            <div className="h-6 w-px bg-gray-300 hidden md:block" />
            <div className="text-gray-500">
              <span className="font-semibold text-gray-900">$2.5M+</span> paid to creators
            </div>
          </div>
        </div>
      </section>

      {/* CTA - Clean */}
      <section className="py-24 bg-gray-900">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to start earning?
          </h2>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">
            Join thousands of creators who are already monetizing their content with PayPerRead.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/sign-up" 
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              Get started free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link 
              href="/pricing" 
              className="inline-flex items-center justify-center px-8 py-4 text-white border border-gray-700 rounded-full font-semibold hover:bg-gray-800 transition-colors"
            >
              View pricing
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
