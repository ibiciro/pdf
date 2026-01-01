'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import { 
  BookOpen, Clock, DollarSign, Star, Heart, TrendingUp, 
  Search, Filter, ChevronRight, Eye, Calendar, Bookmark,
  History, Library, Sparkles, ArrowRight, Play
} from 'lucide-react';
import { createClient } from '../../supabase/client';

interface ReaderDashboardProps {
  user: User;
}

interface ReadingSession {
  id: string;
  content_id: string;
  created_at: string;
  expires_at: string;
  amount_paid_cents: number;
  status: string;
  content?: {
    id: string;
    title: string;
    thumbnail_url: string;
    content_type: string;
    users?: {
      full_name: string;
    };
  };
}

interface SavedContent {
  id: string;
  content_id: string;
  created_at: string;
  content?: {
    id: string;
    title: string;
    thumbnail_url: string;
    price_cents: number;
    content_type: string;
    users?: {
      full_name: string;
    };
  };
}

interface ReaderStats {
  totalReads: number;
  totalSpent: number;
  activeSubscriptions: number;
  savedContent: number;
}

export default function ReaderDashboard({ user }: ReaderDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'saved' | 'discover'>('overview');
  const [readingSessions, setReadingSessions] = useState<ReadingSession[]>([]);
  const [savedContent, setSavedContent] = useState<SavedContent[]>([]);
  const [recommendedContent, setRecommendedContent] = useState<any[]>([]);
  const [stats, setStats] = useState<ReaderStats>({
    totalReads: 0,
    totalSpent: 0,
    activeSubscriptions: 0,
    savedContent: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const supabase = createClient();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch reading history
      const { data: sessions } = await supabase
        .from('reading_sessions')
        .select(`
          *,
          content (
            id,
            title,
            thumbnail_url,
            content_type,
            users!content_creator_id_fkey (
              full_name
            )
          )
        `)
        .eq('reader_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      setReadingSessions(sessions || []);

      // Fetch saved/bookmarked content (likes)
      const { data: likes } = await supabase
        .from('likes')
        .select(`
          *,
          content (
            id,
            title,
            thumbnail_url,
            price_cents,
            content_type,
            users!content_creator_id_fkey (
              full_name
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setSavedContent(likes || []);

      // Fetch recommended content (popular content the user hasn't read)
      const { data: recommended } = await supabase
        .from('content')
        .select(`
          *,
          users!content_creator_id_fkey (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('status', 'published')
        .order('total_reads', { ascending: false })
        .limit(6);

      setRecommendedContent(recommended || []);

      // Calculate stats
      const totalReads = sessions?.length || 0;
      const totalSpent = sessions?.reduce((acc, s) => acc + (s.amount_paid_cents || 0), 0) || 0;
      const activeSubscriptions = sessions?.filter(s => 
        s.status === 'active' && new Date(s.expires_at) > new Date()
      ).length || 0;

      setStats({
        totalReads,
        totalSpent,
        activeSubscriptions,
        savedContent: likes?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  return (
    <main className="pt-20 pb-16">
      <div className="container mx-auto px-6 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 font-display mb-2">
            Welcome back{user.user_metadata?.full_name ? `, ${user.user_metadata.full_name.split(' ')[0]}` : ''}! 👋
          </h1>
          <p className="text-gray-500">
            Your reading dashboard - track your progress and discover new content
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 font-mono">{stats.totalReads}</div>
            <div className="text-sm text-gray-500">Articles Read</div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 font-mono">{formatPrice(stats.totalSpent)}</div>
            <div className="text-sm text-gray-500">Total Spent</div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 font-mono">{stats.activeSubscriptions}</div>
            <div className="text-sm text-gray-500">Active Sessions</div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center">
                <Heart className="w-6 h-6 text-rose-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 font-mono">{stats.savedContent}</div>
            <div className="text-sm text-gray-500">Saved Articles</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-3 font-medium text-sm transition-colors relative ${
              activeTab === 'overview'
                ? 'text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Overview
            </span>
            {activeTab === 'overview' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-3 font-medium text-sm transition-colors relative ${
              activeTab === 'history'
                ? 'text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <History className="w-4 h-4" />
              Reading History
            </span>
            {activeTab === 'history' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-3 font-medium text-sm transition-colors relative ${
              activeTab === 'saved'
                ? 'text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <Bookmark className="w-4 h-4" />
              Saved
            </span>
            {activeTab === 'saved' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('discover')}
            className={`px-4 py-3 font-medium text-sm transition-colors relative ${
              activeTab === 'discover'
                ? 'text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Discover
            </span>
            {activeTab === 'discover' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Continue Reading */}
                {readingSessions.filter(s => s.status === 'active' && new Date(s.expires_at) > new Date()).length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-gray-900">Continue Reading</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {readingSessions
                        .filter(s => s.status === 'active' && new Date(s.expires_at) > new Date())
                        .slice(0, 2)
                        .map((session) => (
                          <Link
                            key={session.id}
                            href={`/read/${session.content_id}`}
                            className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-500 to-violet-500 rounded-xl text-white group hover:shadow-lg transition-all"
                          >
                            <div className="w-16 h-16 rounded-lg bg-white/20 flex items-center justify-center">
                              <Play className="w-8 h-8" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold line-clamp-1">{session.content?.title}</h3>
                              <p className="text-sm text-white/80">
                                Time remaining: {Math.max(0, Math.round((new Date(session.expires_at).getTime() - Date.now()) / 60000))} min
                              </p>
                            </div>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        ))}
                    </div>
                  </div>
                )}

                {/* Recommended For You */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Recommended For You</h2>
                    <Link href="/browse" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                      Browse All <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recommendedContent.slice(0, 6).map((content) => (
                      <Link
                        key={content.id}
                        href={`/content/${content.id}`}
                        className="group bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all"
                      >
                        <div className="aspect-video bg-gray-100 relative overflow-hidden">
                          <img
                            src={content.thumbnail_url || 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&q=80'}
                            alt={content.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-3 right-3">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                              content.content_type === 'pdf' 
                                ? 'bg-red-100 text-red-700' 
                                : 'bg-violet-100 text-violet-700'
                            }`}>
                              {content.content_type === 'pdf' ? 'PDF' : 'Article'}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                            {content.title}
                          </h3>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">{content.users?.full_name}</span>
                            <span className="font-semibold text-blue-600">{formatPrice(content.price_cents)}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                {readingSessions.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-100">
                      {readingSessions.slice(0, 5).map((session) => (
                        <div key={session.id} className="p-4 flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 line-clamp-1">{session.content?.title}</h3>
                            <p className="text-sm text-gray-500">{formatDate(session.created_at)}</p>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{formatPrice(session.amount_paid_cents)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div>
                {readingSessions.length === 0 ? (
                  <div className="text-center py-20">
                    <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reading History Yet</h3>
                    <p className="text-gray-500 mb-6">Start reading to build your history</p>
                    <Link
                      href="/browse"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                    >
                      Browse Content <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          <th className="text-left p-4 text-sm font-medium text-gray-500">Content</th>
                          <th className="text-left p-4 text-sm font-medium text-gray-500">Date</th>
                          <th className="text-left p-4 text-sm font-medium text-gray-500">Status</th>
                          <th className="text-right p-4 text-sm font-medium text-gray-500">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {readingSessions.map((session) => (
                          <tr key={session.id} className="border-b border-gray-50 hover:bg-gray-50">
                            <td className="p-4">
                              <Link href={`/content/${session.content_id}`} className="flex items-center gap-3 group">
                                <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden">
                                  <img
                                    src={session.content?.thumbnail_url || 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=100&q=80'}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900 group-hover:text-blue-600 line-clamp-1">
                                    {session.content?.title || 'Unknown Content'}
                                  </div>
                                  <div className="text-sm text-gray-500">{session.content?.users?.full_name}</div>
                                </div>
                              </Link>
                            </td>
                            <td className="p-4 text-sm text-gray-600">{formatDate(session.created_at)}</td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                session.status === 'active' && new Date(session.expires_at) > new Date()
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {session.status === 'active' && new Date(session.expires_at) > new Date()
                                  ? 'Active'
                                  : 'Expired'}
                              </span>
                            </td>
                            <td className="p-4 text-right font-medium text-gray-900">
                              {formatPrice(session.amount_paid_cents)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Saved Tab */}
            {activeTab === 'saved' && (
              <div>
                {savedContent.length === 0 ? (
                  <div className="text-center py-20">
                    <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Saved Content</h3>
                    <p className="text-gray-500 mb-6">Like articles to save them here</p>
                    <Link
                      href="/browse"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                    >
                      Browse Content <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedContent.map((item) => (
                      <Link
                        key={item.id}
                        href={`/content/${item.content_id}`}
                        className="group bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all"
                      >
                        <div className="aspect-video bg-gray-100 relative overflow-hidden">
                          <img
                            src={item.content?.thumbnail_url || 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&q=80'}
                            alt={item.content?.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-3 right-3">
                            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                            {item.content?.title}
                          </h3>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">{item.content?.users?.full_name}</span>
                            <span className="font-semibold text-blue-600">
                              {formatPrice(item.content?.price_cents || 0)}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Discover Tab */}
            {activeTab === 'discover' && (
              <div>
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search for topics, authors, or titles..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendedContent
                    .filter(c => 
                      !searchQuery || 
                      c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      c.users?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((content) => (
                      <Link
                        key={content.id}
                        href={`/content/${content.id}`}
                        className="group bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all"
                      >
                        <div className="aspect-video bg-gray-100 relative overflow-hidden">
                          <img
                            src={content.thumbnail_url || 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&q=80'}
                            alt={content.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute bottom-3 left-3 flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-black/60 text-white backdrop-blur-sm">
                              {content.total_reads || 0} reads
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                            {content.title}
                          </h3>
                          <p className="text-sm text-gray-500 line-clamp-2 mb-3">{content.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                                {content.users?.full_name?.[0] || 'A'}
                              </div>
                              <span className="text-sm text-gray-600">{content.users?.full_name}</span>
                            </div>
                            <span className="font-semibold text-blue-600">{formatPrice(content.price_cents)}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Become Creator CTA */}
        <div className="mt-12 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-8 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Ready to Share Your Knowledge?</h2>
              <p className="text-white/80">Become a creator and start earning from your content</p>
            </div>
            <Link
              href="/creators"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors whitespace-nowrap"
            >
              Become a Creator <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
