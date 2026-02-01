import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import ContentCard from "@/components/content-card";
import { ArrowRight, ChevronRight, Search, FileText, TrendingUp, Sparkles, Users } from 'lucide-react';
import { createClient } from "../../supabase/server";
import Link from "next/link";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch real content from database with category info
  const { data: dbContent } = await supabase
    .from('content')
    .select(`
      *,
      category:categories(id, name, slug, color)
    `)
    .eq('status', 'published')
    .order('total_reads', { ascending: false })
    .limit(12);

  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, color')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  // Fetch creator count
  const { count: creatorCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'creator');

  const displayContent = dbContent && dbContent.length > 0 
    ? dbContent.map(item => ({
        id: item.id,
        title: item.title,
        author: item.creator_name || 'Creator',
        thumbnail: item.thumbnail_url,
        price: item.price_cents,
        sessionDuration: item.session_duration_minutes,
        rating: 4.8,
        reviewCount: item.total_reads || 0,
        readCount: item.total_reads || 0,
        likeCount: item.total_likes || 0,
        contentType: item.content_type as 'text' | 'pdf',
        category: item.category?.name,
        categoryColor: item.category?.color,
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
    indigo: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200',
    orange: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
    teal: 'bg-teal-100 text-teal-700 hover:bg-teal-200',
    rose: 'bg-rose-100 text-rose-700 hover:bg-rose-200',
  };

  const textCount = displayContent.filter(c => c.contentType === 'text').length;
  const pdfCount = displayContent.filter(c => c.contentType === 'pdf').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section - Matching Browse Style */}
      <section className="pt-24 pb-8 bg-white border-b border-gray-100">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Premium content marketplace</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                Discover premium knowledge
              </h1>
              <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                Pay only for what you read. No subscriptions, just valuable insights.
              </p>
            </div>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <form action="/browse" method="get" className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="q"
                  placeholder="Search for articles, guides, insights..."
                  className="w-full pl-14 pr-32 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 text-base transition-all"
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
                >
                  Search
                </button>
              </form>
            </div>
            
            {/* Category Pills */}
            {categories && categories.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                <Link
                  href="/browse"
                  className="px-4 py-2 rounded-full text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition-all"
                >
                  All Content
                </Link>
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
            
            {/* Stats Row */}
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2 px-4 py-2 bg-violet-50 rounded-xl">
                <FileText className="w-4 h-4 text-violet-600" />
                <span className="font-medium text-violet-700">{textCount} Articles</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-xl">
                <FileText className="w-4 h-4 text-red-600" />
                <span className="font-medium text-red-700">{pdfCount} PDFs</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-700">{creatorCount || 0} Creators</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Content Grid - Matching Browse Style */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          {displayContent.length > 0 ? (
            <>
              {/* Section Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Trending Now</h2>
                    <p className="text-sm text-gray-500">Popular content from top creators</p>
                  </div>
                </div>
                <Link 
                  href="/browse" 
                  className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all font-medium text-sm shadow-sm"
                >
                  View all
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              
              {/* Content Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayContent.slice(0, 8).map((content) => (
                  <ContentCard key={content.id} {...content} />
                ))}
              </div>

              {/* View More Button */}
              {displayContent.length > 8 && (
                <div className="mt-10 text-center">
                  <Link 
                    href="/browse"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all font-medium shadow-sm"
                  >
                    Browse all content
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="py-16 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No content yet</h3>
              <p className="text-gray-500 mb-6">Be the first to create premium content!</p>
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
              >
                Start creating
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA for Creators */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
              
              <div className="relative">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-6">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-medium text-white/90">85% revenue share</span>
                </div>
                
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Have knowledge to share?
                </h2>
                <p className="text-lg text-gray-300 mb-8 max-w-xl mx-auto">
                  Start selling your expertise today. Upload PDFs or write articles - get paid per read.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link 
                    href="/sign-up" 
                    className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-all"
                  >
                    Start creating
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                  <Link 
                    href="/pricing" 
                    className="inline-flex items-center justify-center px-8 py-4 text-white border border-white/20 rounded-xl font-medium hover:bg-white/10 transition-colors"
                  >
                    View pricing
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
