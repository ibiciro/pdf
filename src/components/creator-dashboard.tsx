'use client';

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { 
  DollarSign, 
  Users, 
  BookOpen, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Plus,
  Eye,
  Edit,
  Trash2,
  Star,
  BarChart3,
  FileText,
  Settings,
  Home,
  AlertCircle,
  Loader2,
  RefreshCw,
  Download,
  Shield
} from 'lucide-react';
import Link from 'next/link';
import UploadModal from './upload-modal';
import DashboardSidebar from './dashboard-sidebar';
import { getCreatorContentAction, deleteContentAction, updateContentAction } from '@/app/actions';

interface CreatorDashboardProps {
  user: User;
  initialContent?: ContentItem[];
  initialAnalytics?: AnalyticsData;
}

interface ContentItem {
  id: string;
  title: string;
  description: string | null;
  content_type: 'text' | 'pdf';
  status: string;
  price_cents: number;
  session_duration_minutes: number;
  total_reads: number;
  total_earnings_cents: number;
  created_at: string;
  thumbnail_url: string | null;
  allow_download?: boolean;
  download_price_cents?: number;
}

interface AnalyticsData {
  totalEarnings: number;
  totalReads: number;
  totalContent: number;
  activeReaders: number;
  avgRating: number;
}

export default function CreatorDashboard({ user, initialContent = [], initialAnalytics }: CreatorDashboardProps) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [contentItems, setContentItems] = useState<ContentItem[]>(initialContent);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchContent = async () => {
    setIsLoading(true);
    setError(null);
    const result = await getCreatorContentAction();
    if (result.error) {
      setError(result.error);
    } else {
      setContentItems(result.content as ContentItem[]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return;
    
    setDeletingId(id);
    const result = await deleteContentAction(id);
    if (result.error) {
      alert(result.error);
    } else {
      setContentItems(prev => prev.filter(item => item.id !== id));
    }
    setDeletingId(null);
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    const result = await updateContentAction(id, { status: newStatus as 'draft' | 'published' });
    if (result.error) {
      alert(result.error);
    } else {
      setContentItems(prev => prev.map(item => 
        item.id === id ? { ...item, status: newStatus } : item
      ));
    }
  };

  // Calculate analytics from content
  const analytics = {
    totalEarnings: contentItems.reduce((acc, c) => acc + c.total_earnings_cents, 0),
    totalReads: contentItems.reduce((acc, c) => acc + c.total_reads, 0),
    totalContent: contentItems.length,
    publishedContent: contentItems.filter(c => c.status === 'published').length,
    draftContent: contentItems.filter(c => c.status === 'draft').length,
    textContent: contentItems.filter(c => c.content_type === 'text').length,
    pdfContent: contentItems.filter(c => c.content_type === 'pdf').length,
  };

  const analyticsCards = [
    {
      title: 'Total Earnings',
      value: `$${(analytics.totalEarnings / 100).toFixed(2)}`,
      change: '+12.5%',
      trend: 'up' as const,
      icon: DollarSign,
      color: 'cyan' as const,
    },
    {
      title: 'Published Content',
      value: analytics.publishedContent.toString(),
      change: `${analytics.draftContent} drafts`,
      trend: 'up' as const,
      icon: FileText,
      color: 'purple' as const,
    },
    {
      title: 'Total Reads',
      value: analytics.totalReads.toLocaleString(),
      change: '+23.1%',
      trend: 'up' as const,
      icon: BookOpen,
      color: 'green' as const,
    },
    {
      title: 'Content Types',
      value: `${analytics.textContent} Text / ${analytics.pdfContent} PDF`,
      change: 'Text & PDF only',
      trend: 'up' as const,
      icon: Clock,
      color: 'amber' as const,
    },
  ];

  return (
    <div className="flex min-h-screen pt-16 bg-gray-50">
      {/* Sidebar */}
      <DashboardSidebar user={user} activeTab={activeTab} />
      
      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-display">Dashboard</h1>
            <p className="text-gray-500">Welcome back! Here's your content performance.</p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-glow px-6 py-3 rounded-xl text-white font-semibold flex items-center gap-2 lg:hidden"
          >
            <Plus className="w-5 h-5" />
            New Content
          </button>
        </div>
        
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 stagger-animation">
          {analyticsCards.map((card, index) => (
            <div
              key={card.title}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${
                  card.color === 'cyan' ? 'bg-blue-50' :
                  card.color === 'purple' ? 'bg-violet-50' :
                  card.color === 'green' ? 'bg-green-50' :
                  'bg-amber-50'
                } flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <card.icon className={`w-6 h-6 ${
                    card.color === 'cyan' ? 'text-blue-600' :
                    card.color === 'purple' ? 'text-violet-600' :
                    card.color === 'green' ? 'text-green-600' :
                    'text-amber-600'
                  }`} />
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  card.trend === 'up' 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-red-100 text-red-600'
                }`}>
                  {card.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {card.change}
                </div>
              </div>
              <div className="text-3xl font-bold font-mono text-gray-900 mb-1">{card.value}</div>
              <div className="text-sm text-gray-500">{card.title}</div>
              
              {/* Mini sparkline placeholder */}
              <div className="mt-4 h-8 flex items-end gap-1">
                {[40, 60, 45, 80, 55, 70, 90].map((height, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-sm ${
                      card.color === 'cyan' ? 'bg-blue-200' :
                      card.color === 'purple' ? 'bg-violet-200' :
                      card.color === 'green' ? 'bg-green-200' :
                      'bg-amber-200'
                    }`}
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* Content Library */}
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-900 font-display">Content Library</h2>
              <button
                onClick={fetchContent}
                disabled={isLoading}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">{contentItems.length} items</span>
            </div>
          </div>
          
          {error && (
            <div className="p-4 bg-red-50 border-b border-red-100 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
              <p className="text-gray-500">Loading your content...</p>
            </div>
          ) : contentItems.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No content yet</h3>
              <p className="text-gray-500 mb-6">Start by creating your first text article or uploading a PDF document.</p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="btn-glow px-6 py-3 rounded-xl text-white font-semibold inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create Content
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left p-4 text-sm font-medium text-gray-500">Content</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-500">Type</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-500">Price</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-500">Earnings</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-500">Reads</th>
                    <th className="text-right p-4 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contentItems.map((item) => (
                    <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            item.content_type === 'pdf' ? 'bg-red-50' : 'bg-violet-50'
                          }`}>
                            <FileText className={`w-6 h-6 ${
                              item.content_type === 'pdf' ? 'text-red-500' : 'text-violet-500'
                            }`} />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 line-clamp-1">{item.title}</div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {new Date(item.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          item.content_type === 'pdf'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-violet-100 text-violet-700'
                        }`}>
                          {item.content_type === 'pdf' ? 'PDF' : 'Text'}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleStatus(item.id, item.status)}
                          className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                            item.status === 'published'
                              ? 'bg-green-100 text-green-600 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          {item.status}
                        </button>
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-gray-900">
                          ${(item.price_cents / 100).toFixed(2)}
                        </span>
                        <span className="text-xs text-gray-400 ml-1">
                          / {item.session_duration_minutes}min
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-green-600">
                          ${(item.total_earnings_cents / 100).toFixed(2)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-gray-600">{item.total_reads.toLocaleString()}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link 
                            href={`/content/${item.id}`}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            disabled={deletingId === item.id}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-red-500 disabled:opacity-50"
                          >
                            {deletingId === item.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      
      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal 
          onClose={() => setShowUploadModal(false)} 
          onSuccess={fetchContent}
        />
      )}
    </div>
  );
}
