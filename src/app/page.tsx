import Footer from "@/components/footer";
import Hero from "@/components/hero";
import Navbar from "@/components/navbar";
import ContentCard from "@/components/content-card";
import { ArrowRight, ChevronRight } from 'lucide-react';
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
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">How it works</h2>
            <p className="text-gray-500">Three simple steps to start earning</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: '1', title: 'Create', desc: 'Upload your content and set your price' },
              { step: '2', title: 'Share', desc: 'Share your content link anywhere' },
              { step: '3', title: 'Earn', desc: 'Get paid when readers purchase access' },
            ].map((item, i) => (
              <div key={i} className="text-center p-6">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-400 mx-auto mb-4">{item.step}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
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
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Why creators choose us
              </h2>
              <p className="text-gray-500">Simple tools to monetize your expertise</p>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                { title: 'Timed Sessions', desc: 'Create urgency with time-limited access to your content' },
                { title: 'Protected Content', desc: 'No copying, no screenshots, no unauthorized sharing' },
                { title: 'Instant Payouts', desc: 'Get paid directly to your account when readers pay' },
                { title: 'Full Control', desc: 'Set your own prices and session durations' },
              ].map((feature, i) => (
                <div key={i} className="p-6 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-500">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA - Clean */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Start earning today
          </h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Join thousands of creators monetizing their content.
          </p>
          <Link 
            href="/sign-up" 
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 rounded-full font-medium hover:bg-gray-100 transition-colors"
          >
            Get started free
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
