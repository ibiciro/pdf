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
  CreditCard,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Bell,
  User as UserIcon,
  Lock,
  Palette,
  ChevronRight,
  Wallet,
  PiggyBank,
  Receipt
} from 'lucide-react';
import Link from 'next/link';
import UploadModal from './upload-modal';
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
}

interface AnalyticsData {
  totalEarnings: number;
  totalReads: number;
  totalContent: number;
  activeReaders: number;
  avgRating: number;
}

const sidebarItems = [
  { icon: Home, label: 'Overview', key: 'overview', description: 'Dashboard overview' },
  { icon: FileText, label: 'My Content', key: 'content', description: 'Manage your content' },
  { icon: BarChart3, label: 'Analytics', key: 'analytics', description: 'View detailed stats' },
  { icon: Wallet, label: 'Earnings', key: 'earnings', description: 'Track your revenue' },
  { icon: Settings, label: 'Settings', key: 'settings', description: 'Account preferences' },
];

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

  // Generate mock analytics data for charts
  const monthlyData = [
    { month: 'Jan', earnings: 120, reads: 45 },
    { month: 'Feb', earnings: 185, reads: 62 },
    { month: 'Mar', earnings: 230, reads: 78 },
    { month: 'Apr', earnings: 175, reads: 55 },
    { month: 'May', earnings: 290, reads: 92 },
    { month: 'Jun', earnings: 340, reads: 110 },
  ];

  const maxEarnings = Math.max(...monthlyData.map(d => d.earnings));
  const maxReads = Math.max(...monthlyData.map(d => d.reads));

  // Recent transactions mock data
  const recentTransactions = [
    { id: '1', date: '2024-01-15', amount: 4.99, content: 'Advanced React Patterns', type: 'earning' },
    { id: '2', date: '2024-01-14', amount: 2.99, content: 'CSS Grid Mastery', type: 'earning' },
    { id: '3', date: '2024-01-13', amount: 9.99, content: 'TypeScript Deep Dive', type: 'earning' },
    { id: '4', date: '2024-01-12', amount: 1.99, content: 'JavaScript Tips', type: 'earning' },
    { id: '5', date: '2024-01-11', amount: 50.00, content: 'Payout to Bank', type: 'payout' },
  ];

  // Render Analytics Tab
  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-display">Analytics</h1>
        <p className="text-gray-500">Track your content performance and reader engagement.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-gray-500 text-sm">Total Views</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 font-mono">{(analytics.totalReads * 3.2).toFixed(0)}</div>
          <div className="flex items-center gap-1 mt-2 text-green-600 text-sm">
            <ArrowUpRight className="w-4 h-4" />
            <span>+18.3% from last month</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-violet-600" />
            </div>
            <span className="text-gray-500 text-sm">Paid Reads</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 font-mono">{analytics.totalReads}</div>
          <div className="flex items-center gap-1 mt-2 text-green-600 text-sm">
            <ArrowUpRight className="w-4 h-4" />
            <span>+23.1% from last month</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-gray-500 text-sm">Avg. Read Time</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 font-mono">8.4 min</div>
          <div className="flex items-center gap-1 mt-2 text-green-600 text-sm">
            <ArrowUpRight className="w-4 h-4" />
            <span>+2.1 min from last month</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earnings Chart */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Earnings Over Time</h3>
          <div className="h-64 flex items-end justify-between gap-4">
            {monthlyData.map((data, i) => (
              <div key={data.month} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: '200px' }}>
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all duration-500"
                    style={{ height: `${(data.earnings / maxEarnings) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 mt-2">{data.month}</span>
                <span className="text-xs font-semibold text-gray-700">${data.earnings}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reads Chart */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Reads Over Time</h3>
          <div className="h-64 flex items-end justify-between gap-4">
            {monthlyData.map((data, i) => (
              <div key={data.month} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: '200px' }}>
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-violet-600 to-violet-400 rounded-t-lg transition-all duration-500"
                    style={{ height: `${(data.reads / maxReads) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 mt-2">{data.month}</span>
                <span className="text-xs font-semibold text-gray-700">{data.reads}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content Performance Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Content Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left p-4 text-sm font-medium text-gray-500">Content</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Views</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Reads</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Conversion</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {contentItems.slice(0, 5).map((item) => (
                <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">{item.title}</td>
                  <td className="p-4 text-gray-600">{(item.total_reads * 3.2).toFixed(0)}</td>
                  <td className="p-4 text-gray-600">{item.total_reads}</td>
                  <td className="p-4 text-gray-600">{((item.total_reads / (item.total_reads * 3.2 || 1)) * 100).toFixed(1)}%</td>
                  <td className="p-4 font-mono text-green-600">${(item.total_earnings_cents / 100).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Render Earnings Tab
  const renderEarningsTab = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-display">Earnings</h1>
        <p className="text-gray-500">Track your revenue and manage payouts.</p>
      </div>

      {/* Earnings Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Wallet className="w-6 h-6 opacity-80" />
            <span className="opacity-80 text-sm">Available Balance</span>
          </div>
          <div className="text-4xl font-bold font-mono">${(analytics.totalEarnings / 100).toFixed(2)}</div>
          <button className="mt-4 w-full bg-white/20 hover:bg-white/30 transition-colors py-2 rounded-lg text-sm font-medium">
            Withdraw Funds
          </button>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-gray-500 text-sm">This Month</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 font-mono">${(analytics.totalEarnings * 0.35 / 100).toFixed(2)}</div>
          <div className="flex items-center gap-1 mt-2 text-green-600 text-sm">
            <ArrowUpRight className="w-4 h-4" />
            <span>+15.2%</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
              <PiggyBank className="w-5 h-5 text-violet-600" />
            </div>
            <span className="text-gray-500 text-sm">Lifetime Earnings</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 font-mono">${(analytics.totalEarnings * 2.5 / 100).toFixed(2)}</div>
          <span className="text-xs text-gray-500">Since joining</span>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-gray-500 text-sm">Pending</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 font-mono">${(analytics.totalEarnings * 0.1 / 100).toFixed(2)}</div>
          <span className="text-xs text-gray-500">Processing</span>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
          <button className="text-blue-600 text-sm font-medium hover:text-blue-700">View All</button>
        </div>
        <div className="divide-y divide-gray-50">
          {recentTransactions.map((tx) => (
            <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  tx.type === 'earning' ? 'bg-green-50' : 'bg-blue-50'
                }`}>
                  {tx.type === 'earning' ? (
                    <ArrowDownRight className="w-5 h-5 text-green-600" />
                  ) : (
                    <ArrowUpRight className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{tx.content}</div>
                  <div className="text-xs text-gray-500">{tx.date}</div>
                </div>
              </div>
              <div className={`font-mono font-semibold ${
                tx.type === 'earning' ? 'text-green-600' : 'text-blue-600'
              }`}>
                {tx.type === 'earning' ? '+' : '-'}${tx.amount.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payout Settings */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payout Settings</h3>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-medium text-gray-900">Bank Account</div>
              <div className="text-sm text-gray-500">****4532 • Chase Bank</div>
            </div>
          </div>
          <button className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center gap-1">
            Edit <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  // Render Settings Tab
  const renderSettingsTab = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-display">Settings</h1>
        <p className="text-gray-500">Manage your account preferences and security.</p>
      </div>

      {/* Profile Settings */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <UserIcon className="w-5 h-5" />
            Profile Settings
          </h3>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-2xl font-bold text-white">
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                Change Avatar
              </button>
              <p className="text-xs text-gray-500 mt-2">JPG, PNG or GIF. Max 2MB.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
              <input 
                type="text" 
                defaultValue={user.email?.split('@')[0]}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input 
                type="email" 
                defaultValue={user.email || ''}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500"
                disabled
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              <textarea 
                rows={3}
                placeholder="Tell readers about yourself..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </div>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
            Save Changes
          </button>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security
          </h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <Lock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Password</div>
                <div className="text-sm text-gray-500">Last changed 30 days ago</div>
              </div>
            </div>
            <Link 
              href="/dashboard/reset-password"
              className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center gap-1"
            >
              Change <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                <Shield className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Two-Factor Authentication</div>
                <div className="text-sm text-gray-500">Add an extra layer of security</div>
              </div>
            </div>
            <button className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors">
              Enable
            </button>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </h3>
        </div>
        <div className="p-6 space-y-4">
          {[
            { label: 'Email notifications for new readers', enabled: true },
            { label: 'Weekly earnings summary', enabled: true },
            { label: 'Content performance alerts', enabled: false },
            { label: 'Marketing and promotional emails', enabled: false },
          ].map((setting, index) => (
            <div key={index} className="flex items-center justify-between py-2">
              <span className="text-gray-700">{setting.label}</span>
              <button className={`relative w-12 h-6 rounded-full transition-colors ${
                setting.enabled ? 'bg-blue-600' : 'bg-gray-200'
              }`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  setting.enabled ? 'right-1' : 'left-1'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Appearance Settings */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Appearance
          </h3>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-700">Dark Mode</span>
            <button className="relative w-12 h-6 rounded-full bg-gray-200 transition-colors">
              <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-2xl border border-red-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-red-100 bg-red-50">
          <h3 className="text-lg font-semibold text-red-700">Danger Zone</h3>
        </div>
        <div className="p-6">
          <p className="text-gray-600 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
          <button className="px-6 py-3 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen pt-16 bg-gray-50">
      {/* Improved Sidebar */}
      <aside className="fixed left-0 top-16 bottom-0 w-72 bg-white border-r border-gray-200 flex flex-col hidden lg:flex">
        {/* User Profile Section */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-lg font-bold text-white shadow-lg">
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 truncate">{user.email?.split('@')[0]}</div>
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Creator Account
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="p-4 border-b border-gray-100">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-green-700 font-mono">${(analytics.totalEarnings / 100).toFixed(0)}</div>
              <div className="text-xs text-green-600">Earnings</div>
            </div>
            <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-violet-700 font-mono">{analytics.totalReads}</div>
              <div className="text-xs text-violet-600">Reads</div>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveTab(item.key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                activeTab === item.key
                  ? 'bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className={`w-5 h-5 ${
                activeTab === item.key ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'
              }`} />
              <div className="flex-1 text-left">
                <span className="font-medium block">{item.label}</span>
                <span className={`text-xs ${
                  activeTab === item.key ? 'text-white/70' : 'text-gray-400'
                }`}>{item.description}</span>
              </div>
              {activeTab === item.key && (
                <ChevronRight className="w-4 h-4 text-white/70" />
              )}
            </button>
          ))}
        </nav>
        
        {/* New Content Button */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={() => setShowUploadModal(true)}
            className="w-full btn-glow py-3.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-shadow"
          >
            <Plus className="w-5 h-5" />
            New Content
          </button>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 lg:ml-72 p-6 lg:p-8">
        {/* Mobile Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 lg:hidden">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-display">Dashboard</h1>
            <p className="text-gray-500">Welcome back! Here's your content performance.</p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-glow px-6 py-3 rounded-xl text-white font-semibold flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Content
          </button>
        </div>

        {/* Conditional Tab Content */}
        {activeTab === 'analytics' && renderAnalyticsTab()}
        {activeTab === 'earnings' && renderEarningsTab()}
        {activeTab === 'settings' && renderSettingsTab()}
        
        {/* Overview and Content tabs show the existing content */}
        {(activeTab === 'overview' || activeTab === 'content') && (
          <>
            {/* Header for Overview/Content */}
            <div className="hidden lg:flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 font-display">
                  {activeTab === 'overview' ? 'Dashboard' : 'My Content'}
                </h1>
                <p className="text-gray-500">
                  {activeTab === 'overview' 
                    ? "Welcome back! Here's your content performance." 
                    : 'Manage and organize your published content.'}
                </p>
              </div>
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
          </>
        )}
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
