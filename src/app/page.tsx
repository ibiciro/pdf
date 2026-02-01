import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import ContentCard from "@/components/content-card";
import { ArrowRight, ChevronRight, Search, FileText, X } from 'lucide-react';
import { createClient } from "../../supabase/server";
import Link from "next/link";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch real content from database
  const { data: dbContent } = await supabase
    .from('content')
    .select('*')
    .eq('status', 'published')
    .order('total_reads', { ascending: false })
    .limit(9);

  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, color')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

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
        category: item.category_id,
      }))
    : [];

  const CATEGORY_COLORS: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    green: 'bg-green-100 text-green-700 hover:bg-green-200',
    violet: 'bg-violet-100 text-violet-700 hover:bg-violet-200',
    amber: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
    red: 'bg-red-100 text-red-700 hover:bg-red-200',
    pink: 'bg-pink-100 text-pink-700 hover:bg-pink-200',
    cyan: 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200',
    emerald: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Minimalist Hero with Search */}
      <section className="pt-32 pb-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            {/* Logo/Brand */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">PayPerRead</h1>
            </div>
            
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Discover premium knowledge
            </h2>
            <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
              Pay only for what you read. No subscriptions, just valuable insights.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <form action="/browse" method="get" className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="q"
                  placeholder="Search for articles, guides, insights..."
                  className="w-full pl-14 pr-6 py-5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 text-lg transition-all"
                />
                <button 
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
                >
                  Search
                </button>
              </form>
            </div>
            
            {/* Category Pills */}
            {categories && categories.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {categories.slice(0, 8).map((category: any) => (
                  <Link
                    key={category.id}
                    href={`/browse?category=${category.slug}`}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      CATEGORY_COLORS[category.color || 'blue']
                    }`}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            )}
            
            {/* Content Stats */}
            <div className="flex items-center justify-center gap-8 text-sm text-gray-500 mt-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-violet-600" />
                </div>
                <span>{displayContent.filter(c => c.contentType === 'text').length} Articles</span>
              </div>
              <div className="w-px h-5 bg-gray-200" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-red-600" />
                </div>
                <span>{displayContent.filter(c => c.contentType === 'pdf').length} PDFs</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Content Grid */}
      {displayContent.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Popular content</h3>
                <p className="text-gray-500 mt-1">Trending reads from top creators</p>
              </div>
              <Link 
                href="/browse" 
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-full text-gray-900 hover:bg-gray-50 hover:border-gray-300 transition-all font-medium text-sm"
              >
                View all
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayContent.slice(0, 6).map((content) => (
                <ContentCard key={content.id} {...content} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA for Creators - Minimal */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Have knowledge to share?
            </h2>
            <p className="text-lg text-gray-500 mb-8">
              Start selling your expertise today. No subscriptions, 85% revenue share.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/sign-up" 
                className="inline-flex items-center justify-center px-8 py-4 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-all"
              >
                Start creating
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link 
                href="/pricing" 
                className="inline-flex items-center justify-center px-8 py-4 text-gray-700 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Learn more
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
