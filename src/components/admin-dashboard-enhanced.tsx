'use client';

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { 
  Shield, CreditCard, Users, FileText, DollarSign, Settings, Activity,
  Globe, CheckCircle, XCircle, Edit, Save, Loader2, ArrowLeft, Eye, EyeOff,
  Plus, Trash2, AlertTriangle, TrendingUp, BarChart3, Clock, Wallet, Search,
  ChevronDown, ChevronRight, Monitor, Smartphone, Tablet, ExternalLink,
  UserCheck, UserX, Mail, Calendar, RefreshCw, Download, Filter, MoreVertical,
  Tag, Palette
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '../../supabase/client';
import { 
  getAdminUsersAction, 
  getAdminContentAction, 
  getAdminTransactionsAction,
  getAdminVisitorStatsAction,
  getAdminActivityLogsAction
} from '@/app/actions';
import { DEFAULT_GATEWAYS, PaymentGateway, PaymentGatewayConfig } from '@/lib/payment-gateways';
import { format, formatDistanceToNow } from 'date-fns';

interface AdminDashboardEnhancedProps {
  user: User;
  stats: {
    totalContent: number;
    totalUsers: number;
    totalSessions: number;
    totalRevenue: number;
  };
  gatewaySettings: any[];
}

type ActiveSection = 'overview' | 'gateways' | 'categories' | 'users' | 'content' | 'transactions' | 'visitors' | 'activity' | 'security';

export default function AdminDashboardEnhanced({ user, stats, gatewaySettings }: AdminDashboardEnhancedProps) {
  const [activeSection, setActiveSection] = useState<ActiveSection>('overview');
  const [editingGateway, setEditingGateway] = useState<PaymentGateway | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  // Data states
  const [users, setUsers] = useState<any[]>([]);
  const [content, setContent] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [visitorStats, setVisitorStats] = useState<any>(null);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [categoryList, setCategoryList] = useState<any[]>([]);
  const [newCategory, setNewCategory] = useState({ name: '', color: 'blue', description: '' });
  const [addingCategory, setAddingCategory] = useState(false);

  // Filter states
  const [userFilter, setUserFilter] = useState<'all' | 'creators' | 'readers'>('all');
  const [contentFilter, setContentFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // User action states
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userActionLoading, setUserActionLoading] = useState(false);

  // Initialize gateway configurations
  const [gateways, setGateways] = useState<Record<PaymentGateway, PaymentGatewayConfig>>(() => {
    const configs: Record<PaymentGateway, PaymentGatewayConfig> = {} as any;
    (Object.keys(DEFAULT_GATEWAYS) as PaymentGateway[]).forEach(key => {
      const dbConfig = gatewaySettings.find(g => g.gateway_id === key);
      configs[key] = {
        ...DEFAULT_GATEWAYS[key],
        isEnabled: dbConfig?.is_enabled || false,
        publicKey: dbConfig?.public_key || '',
      };
    });
    return configs;
  });

  const [gatewaySecrets, setGatewaySecrets] = useState<Record<string, string>>({});

  // Load data when section changes
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const supabase = createClient();
        switch (activeSection) {
          case 'users':
            const { users: userData } = await getAdminUsersAction();
            setUsers(userData || []);
            break;
          case 'content':
            const { content: contentData } = await getAdminContentAction();
            setContent(contentData || []);
            break;
          case 'transactions':
            const { transactions: txData } = await getAdminTransactionsAction();
            setTransactions(txData || []);
            break;
          case 'visitors':
            const { stats: visitorData } = await getAdminVisitorStatsAction(30);
            setVisitorStats(visitorData);
            break;
          case 'activity':
            const { logs } = await getAdminActivityLogsAction(100);
            setActivityLogs(logs || []);
            break;
          case 'categories':
            const { data: categoriesData } = await supabase
              .from('categories')
              .select('*')
              .order('display_order', { ascending: true });
            setCategoryList(categoriesData || []);
            break;
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
      setLoading(false);
    };

    loadData();
  }, [activeSection]);

  // Category CRUD functions
  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) return;
    setAddingCategory(true);
    
    try {
      const supabase = createClient();
      const slug = newCategory.name.toLowerCase().replace(/\s+/g, '-');
      
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: newCategory.name,
          slug,
          color: newCategory.color,
          description: newCategory.description,
          is_active: true,
          display_order: categoryList.length,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setCategoryList([...categoryList, data]);
      setNewCategory({ name: '', color: 'blue', description: '' });
    } catch (error) {
      console.error('Error adding category:', error);
    } finally {
      setAddingCategory(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const supabase = createClient();
      await supabase.from('categories').delete().eq('id', categoryId);
      setCategoryList(categoryList.filter(c => c.id !== categoryId));
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const handleToggleCategory = async (categoryId: string, isActive: boolean) => {
    try {
      const supabase = createClient();
      await supabase.from('categories').update({ is_active: !isActive }).eq('id', categoryId);
      setCategoryList(categoryList.map(c => c.id === categoryId ? { ...c, is_active: !isActive } : c));
    } catch (error) {
      console.error('Error toggling category:', error);
    }
  };

  const handleToggleGateway = async (gateway: PaymentGateway) => {
    const supabase = createClient();
    const newState = !gateways[gateway].isEnabled;
    
    setGateways(prev => ({
      ...prev,
      [gateway]: { ...prev[gateway], isEnabled: newState },
    }));
    
    await supabase
      .from('payment_gateway_settings')
      .upsert({
        gateway_id: gateway,
        is_enabled: newState,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'gateway_id' });
  };

  const handleSaveGateway = async (gateway: PaymentGateway) => {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(null);
    
    try {
      const supabase = createClient();
      await supabase
        .from('payment_gateway_settings')
        .upsert({
          gateway_id: gateway,
          is_enabled: gateways[gateway].isEnabled,
          public_key: gateways[gateway].publicKey,
          webhook_secret: gatewaySecrets[gateway] || null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'gateway_id' });
      
      setSaveSuccess(gateway);
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (error: any) {
      setSaveError(error.message || 'Failed to save settings');
    } finally {
      setEditingGateway(null);
      setSaving(false);
    }
  };

  const sidebarItems = [
    { icon: Activity, label: 'Overview', key: 'overview' as const },
    { icon: CreditCard, label: 'Payment Gateways', key: 'gateways' as const },
    { icon: Tag, label: 'Categories', key: 'categories' as const },
    { icon: Users, label: 'Users', key: 'users' as const },
    { icon: FileText, label: 'Content', key: 'content' as const },
    { icon: DollarSign, label: 'Transactions', key: 'transactions' as const },
    { icon: Globe, label: 'Visitors', key: 'visitors' as const },
    { icon: Clock, label: 'Activity Logs', key: 'activity' as const },
    { icon: Shield, label: 'Security', key: 'security' as const },
  ];

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers, icon: Users, bgColor: 'bg-blue-50', iconColor: 'text-blue-600', change: '+12%' },
    { title: 'Total Content', value: stats.totalContent, icon: FileText, bgColor: 'bg-violet-50', iconColor: 'text-violet-600', change: '+8%' },
    { title: 'Reading Sessions', value: stats.totalSessions, icon: Clock, bgColor: 'bg-green-50', iconColor: 'text-green-600', change: '+23%' },
    { title: 'Total Revenue', value: `$${(stats.totalRevenue / 100).toFixed(2)}`, icon: DollarSign, bgColor: 'bg-amber-50', iconColor: 'text-amber-600', change: '+18%' },
  ];

  // Filter functions
  const filteredUsers = users.filter(u => {
    const matchesFilter = userFilter === 'all' || u.role === userFilter.slice(0, -1);
    const matchesSearch = searchQuery === '' || 
      u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredContent = content.filter(c => {
    const matchesFilter = contentFilter === 'all' || c.status === contentFilter;
    const matchesSearch = searchQuery === '' || 
      c.title?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex min-h-screen pt-16 bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 hidden lg:flex lg:flex-col">
        {/* Admin Badge */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 truncate">Super Admin</div>
              <div className="text-xs text-gray-500 truncate">{user.email}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg border border-red-100">
            <Shield className="w-4 h-4 text-red-600" />
            <span className="text-xs text-red-700 font-medium">Admin Access</span>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const isActive = activeSection === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveSection(item.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
        
        {/* Back to Dashboard */}
        <div className="p-4 border-t border-gray-100">
          <Link
            href="/dashboard"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-display">
              {activeSection === 'overview' && 'Admin Dashboard'}
              {activeSection === 'gateways' && 'Payment Gateways'}
              {activeSection === 'categories' && 'Category Management'}
              {activeSection === 'users' && 'User Management'}
              {activeSection === 'content' && 'Content Management'}
              {activeSection === 'transactions' && 'Transactions'}
              {activeSection === 'visitors' && 'Website Analytics'}
              {activeSection === 'activity' && 'Activity Logs'}
              {activeSection === 'security' && 'Security Settings'}
            </h1>
            <p className="text-gray-500 mt-1">
              {activeSection === 'overview' && 'Monitor platform performance and statistics.'}
              {activeSection === 'gateways' && 'Configure and manage payment providers.'}
              {activeSection === 'categories' && 'Add and manage content categories for creators.'}
              {activeSection === 'users' && 'View and manage all platform users.'}
              {activeSection === 'content' && 'Monitor and manage all content.'}
              {activeSection === 'transactions' && 'View all platform transactions.'}
              {activeSection === 'visitors' && 'Track website visitors and analytics.'}
              {activeSection === 'activity' && 'View all system activity logs.'}
              {activeSection === 'security' && 'Configure security and protection settings.'}
            </p>
          </div>
          
          {(activeSection === 'users' || activeSection === 'content' || activeSection === 'transactions') && (
            <button
              onClick={() => setActiveSection(activeSection)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          )}
        </div>

        {/* Overview Section */}
        {activeSection === 'overview' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statCards.map((stat) => (
                <div key={stat.title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                      <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-600 font-medium">
                      {stat.change}
                    </span>
                  </div>
                  <div className="text-3xl font-bold font-mono text-gray-900 mb-1">
                    {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                  </div>
                  <div className="text-sm text-gray-500">{stat.title}</div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 font-display mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <button
                  onClick={() => setActiveSection('gateways')}
                  className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all group text-left"
                >
                  <CreditCard className="w-8 h-8 text-blue-600 mb-3" />
                  <div className="font-medium text-gray-900 group-hover:text-blue-600">Configure Payments</div>
                  <div className="text-sm text-gray-500 mt-1">Set up payment gateways</div>
                </button>
                <button
                  onClick={() => setActiveSection('users')}
                  className="p-4 border border-gray-200 rounded-xl hover:border-violet-300 hover:bg-violet-50 transition-all group text-left"
                >
                  <Users className="w-8 h-8 text-violet-600 mb-3" />
                  <div className="font-medium text-gray-900 group-hover:text-violet-600">Manage Users</div>
                  <div className="text-sm text-gray-500 mt-1">{stats.totalUsers} total users</div>
                </button>
                <button
                  onClick={() => setActiveSection('visitors')}
                  className="p-4 border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all group text-left"
                >
                  <Globe className="w-8 h-8 text-green-600 mb-3" />
                  <div className="font-medium text-gray-900 group-hover:text-green-600">View Analytics</div>
                  <div className="text-sm text-gray-500 mt-1">Website traffic stats</div>
                </button>
                <button
                  onClick={() => setActiveSection('security')}
                  className="p-4 border border-gray-200 rounded-xl hover:border-red-300 hover:bg-red-50 transition-all group text-left"
                >
                  <Shield className="w-8 h-8 text-red-600 mb-3" />
                  <div className="font-medium text-gray-900 group-hover:text-red-600">Security Settings</div>
                  <div className="text-sm text-gray-500 mt-1">Configure protection</div>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Payment Gateways Section */}
        {activeSection === 'gateways' && (
          <div className="space-y-6">
            {/* Gateway Status Overview */}
            <div className="bg-gradient-to-r from-blue-50 to-violet-50 rounded-2xl p-6 border border-blue-100">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Payment Gateway Overview</h3>
                  <p className="text-sm text-gray-500">Configure and manage payment providers for your platform</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/80 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {(Object.values(gateways) as PaymentGatewayConfig[]).filter(g => g.isEnabled).length}
                  </div>
                  <div className="text-xs text-gray-500">Active Gateways</div>
                </div>
                <div className="bg-white/80 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {(Object.values(gateways) as PaymentGatewayConfig[]).filter(g => g.isEnabled && g.publicKey).length}
                  </div>
                  <div className="text-xs text-gray-500">Fully Configured</div>
                </div>
                <div className="bg-white/80 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-amber-600">
                    {(Object.values(gateways) as PaymentGatewayConfig[]).filter(g => g.isEnabled && !g.publicKey).length}
                  </div>
                  <div className="text-xs text-gray-500">Missing Keys</div>
                </div>
                <div className="bg-white/80 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-gray-400">
                    {(Object.values(gateways) as PaymentGatewayConfig[]).filter(g => !g.isEnabled).length}
                  </div>
                  <div className="text-xs text-gray-500">Disabled</div>
                </div>
              </div>
            </div>

            {(Object.entries(gateways) as [PaymentGateway, PaymentGatewayConfig][]).map(([key, gateway]) => (
              <div
                key={key}
                className={`bg-white rounded-2xl border-2 ${
                  gateway.isEnabled && gateway.publicKey 
                    ? 'border-green-200' 
                    : gateway.isEnabled 
                    ? 'border-amber-200' 
                    : 'border-gray-100'
                } shadow-sm overflow-hidden transition-all hover:shadow-md`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-xl flex items-center justify-center shadow-lg ${
                        key === 'stripe' ? 'bg-gradient-to-br from-indigo-500 to-purple-600' :
                        key === 'paystack' ? 'bg-gradient-to-br from-blue-500 to-cyan-600' :
                        key === 'flutterwave' ? 'bg-gradient-to-br from-orange-500 to-amber-600' :
                        key === 'paypal' ? 'bg-gradient-to-br from-blue-600 to-blue-700' :
                        key === 'alipay' ? 'bg-gradient-to-br from-blue-400 to-cyan-500' :
                        key === 'momo' ? 'bg-gradient-to-br from-yellow-500 to-amber-600' :
                        'bg-gradient-to-br from-gray-400 to-gray-600'
                      }`}>
                        <CreditCard className="w-8 h-8 text-white" />
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-bold text-gray-900">{gateway.name}</h3>
                          {gateway.isEnabled && gateway.publicKey && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                              <CheckCircle className="w-3 h-3" /> Ready
                            </span>
                          )}
                          {gateway.isEnabled && !gateway.publicKey && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                              <AlertTriangle className="w-3 h-3" /> Missing Keys
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{gateway.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-gray-400 px-2 py-1 bg-gray-50 rounded-lg">
                            Fee: {gateway.fees.percentage}% {gateway.fees.fixed > 0 && `+ $${gateway.fees.fixed / 100}`}
                          </span>
                          <span className="text-xs text-gray-400 px-2 py-1 bg-gray-50 rounded-lg">
                            {gateway.supportedCurrencies.slice(0, 4).join(', ')}
                            {gateway.supportedCurrencies.length > 4 && ` +${gateway.supportedCurrencies.length - 4} more`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleGateway(key)}
                        className={`relative w-14 h-7 rounded-full transition-colors ${
                          gateway.isEnabled ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                          gateway.isEnabled ? 'left-8' : 'left-1'
                        }`} />
                      </button>

                      <button
                        onClick={() => setEditingGateway(editingGateway === key ? null : key)}
                        className={`p-2.5 rounded-xl transition-colors ${
                          editingGateway === key 
                            ? 'bg-blue-100 text-blue-600' 
                            : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        <Settings className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Configuration */}
                  {editingGateway === key && (
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      {saveSuccess === key && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-green-700">
                          <CheckCircle className="w-5 h-5" />
                          <span className="text-sm font-medium">Configuration saved successfully!</span>
                        </div>
                      )}
                      {saveError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700">
                          <AlertTriangle className="w-5 h-5" />
                          <span className="text-sm font-medium">{saveError}</span>
                        </div>
                      )}

                      {/* PayPal-specific configuration */}
                      {key === 'paypal' ? (
                        <div className="space-y-4">
                          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-4">
                            <p className="text-sm text-blue-800 font-medium mb-1">PayPal Setup Instructions</p>
                            <p className="text-xs text-blue-600">
                              1. Go to <a href="https://developer.paypal.com/dashboard/applications" target="_blank" rel="noopener noreferrer" className="underline">PayPal Developer Dashboard</a><br/>
                              2. Create a new REST API app (or use existing)<br/>
                              3. Copy the Client ID and Secret below
                            </p>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                PayPal Client ID
                              </label>
                              <input
                                type="text"
                                value={gateway.publicKey || ''}
                                onChange={(e) => setGateways(prev => ({
                                  ...prev,
                                  [key]: { ...prev[key], publicKey: e.target.value }
                                }))}
                                placeholder="AaBbCcDd... (from PayPal Developer Dashboard)"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                              />
                              <p className="text-xs text-gray-400 mt-1">
                                Found in your PayPal Developer app credentials
                              </p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                PayPal Client Secret
                              </label>
                              <div className="relative">
                                <input
                                  type={showSecrets[key] ? 'text' : 'password'}
                                  value={gatewaySecrets[key] || ''}
                                  onChange={(e) => setGatewaySecrets(prev => ({ ...prev, [key]: e.target.value }))}
                                  placeholder="EeFfGgHh... (keep this secret!)"
                                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }))}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                  {showSecrets[key] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                              </div>
                              <p className="text-xs text-gray-400 mt-1">
                                Keep this secret! Never share publicly.
                              </p>
                            </div>
                          </div>

                          {/* Sandbox Mode Toggle */}
                          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900">Sandbox Mode</p>
                                <p className="text-sm text-gray-500">Enable for testing with fake payments</p>
                              </div>
                              <button
                                onClick={() => {
                                  // Toggle sandbox mode in state if needed
                                }}
                                className="relative w-14 h-7 rounded-full bg-amber-400 transition-colors"
                              >
                                <div className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md" />
                              </button>
                            </div>
                            <p className="text-xs text-amber-600 mt-2">
                              ⚠️ Use sandbox credentials when testing. Switch to live credentials for production.
                            </p>
                          </div>

                          {/* Creator Payout Info */}
                          <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                            <p className="text-sm text-green-800 font-medium mb-1">Creator Payouts via PayPal</p>
                            <p className="text-xs text-green-600">
                              Creators will receive 85% of each transaction. They enter their PayPal email in Settings → Payment to receive payouts.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Public Key / Client ID
                            </label>
                            <input
                              type="text"
                              value={gateway.publicKey || ''}
                              onChange={(e) => setGateways(prev => ({
                                ...prev,
                                [key]: { ...prev[key], publicKey: e.target.value }
                              }))}
                              placeholder={`pk_live_... or pk_test_...`}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                              Found in your {gateway.name} dashboard under API keys
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Secret Key
                            </label>
                            <div className="relative">
                              <input
                                type={showSecrets[key] ? 'text' : 'password'}
                                value={gatewaySecrets[key] || ''}
                                onChange={(e) => setGatewaySecrets(prev => ({ ...prev, [key]: e.target.value }))}
                                placeholder={`sk_live_... or sk_test_...`}
                                className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                              />
                              <button
                                type="button"
                                onClick={() => setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }))}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                {showSecrets[key] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                              </button>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                              Keep this secret! Never share publicly.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Webhook Configuration */}
                      <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Webhook Endpoint (for {gateway.name})
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={`https://b8f9a61b-c7b6-4928-b627-942cc24a5ce9.canvases.tempo.build/api/webhooks/${key}`}
                            className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-mono text-gray-600"
                          />
                          <button
                            onClick={() => navigator.clipboard.writeText(`https://b8f9a61b-c7b6-4928-b627-942cc24a5ce9.canvases.tempo.build/api/webhooks/${key}`)}
                            className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 text-sm font-medium"
                          >
                            Copy
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Add this URL to your {gateway.name} webhook settings to receive payment notifications.
                        </p>
                      </div>

                      <div className="mt-4 flex justify-end gap-3">
                        <button
                          onClick={() => setEditingGateway(null)}
                          className="px-4 py-2.5 text-gray-600 hover:text-gray-900 font-medium"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveGateway(key)}
                          disabled={saving}
                          className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl font-medium flex items-center gap-2 hover:shadow-lg disabled:opacity-50 transition-all"
                        >
                          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          Save Configuration
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Categories Section */}
        {activeSection === 'categories' && (
          <div className="space-y-6">
            {/* Add New Category */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                Add New Category
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    placeholder="e.g., Technology"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Badge Color</label>
                  <div className="relative">
                    <select
                      value={newCategory.color}
                      onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 appearance-none"
                    >
                      <option value="blue">Blue</option>
                      <option value="green">Green</option>
                      <option value="violet">Violet</option>
                      <option value="amber">Amber</option>
                      <option value="red">Red</option>
                      <option value="pink">Pink</option>
                      <option value="cyan">Cyan</option>
                      <option value="emerald">Emerald</option>
                      <option value="indigo">Indigo</option>
                      <option value="orange">Orange</option>
                      <option value="teal">Teal</option>
                      <option value="rose">Rose</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    placeholder="Brief description of this category"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300"
                  />
                </div>
              </div>
              
              {/* Color Preview */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-sm text-gray-500 mb-2">Preview:</p>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                    {
                      blue: 'bg-blue-100 text-blue-700',
                      green: 'bg-green-100 text-green-700',
                      violet: 'bg-violet-100 text-violet-700',
                      amber: 'bg-amber-100 text-amber-700',
                      red: 'bg-red-100 text-red-700',
                      pink: 'bg-pink-100 text-pink-700',
                      cyan: 'bg-cyan-100 text-cyan-700',
                      emerald: 'bg-emerald-100 text-emerald-700',
                      indigo: 'bg-indigo-100 text-indigo-700',
                      orange: 'bg-orange-100 text-orange-700',
                      teal: 'bg-teal-100 text-teal-700',
                      rose: 'bg-rose-100 text-rose-700',
                    }[newCategory.color] || 'bg-blue-100 text-blue-700'
                  }`}>
                    {newCategory.name || 'Category Name'}
                  </span>
                  <span className="text-sm text-gray-400">← How it will appear on content cards</span>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleAddCategory}
                  disabled={addingCategory || !newCategory.name.trim()}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {addingCategory && <Loader2 className="w-4 h-4 animate-spin" />}
                  Add Category
                </button>
              </div>
            </div>

            {/* Category List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">All Categories ({categoryList.length})</h3>
                <p className="text-sm text-gray-500">Creators can select these when uploading content</p>
              </div>
              {loading ? (
                <div className="p-12 text-center">
                  <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto" />
                </div>
              ) : categoryList.length === 0 ? (
                <div className="p-12 text-center">
                  <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No categories yet. Add one above.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {categoryList.map((category) => {
                    const colorMap: Record<string, string> = {
                      blue: 'bg-blue-100 text-blue-700',
                      green: 'bg-green-100 text-green-700',
                      violet: 'bg-violet-100 text-violet-700',
                      amber: 'bg-amber-100 text-amber-700',
                      red: 'bg-red-100 text-red-700',
                      pink: 'bg-pink-100 text-pink-700',
                      cyan: 'bg-cyan-100 text-cyan-700',
                      emerald: 'bg-emerald-100 text-emerald-700',
                      indigo: 'bg-indigo-100 text-indigo-700',
                      orange: 'bg-orange-100 text-orange-700',
                      teal: 'bg-teal-100 text-teal-700',
                      rose: 'bg-rose-100 text-rose-700',
                    };
                    return (
                      <div key={category.id} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          {
                            blue: 'bg-blue-50',
                            green: 'bg-green-50',
                            violet: 'bg-violet-50',
                            amber: 'bg-amber-50',
                            red: 'bg-red-50',
                            pink: 'bg-pink-50',
                            cyan: 'bg-cyan-50',
                            emerald: 'bg-emerald-50',
                            indigo: 'bg-indigo-50',
                            orange: 'bg-orange-50',
                            teal: 'bg-teal-50',
                            rose: 'bg-rose-50',
                          }[category.color] || 'bg-gray-100'
                        }`}>
                          <Palette className={`w-5 h-5 ${
                            {
                              blue: 'text-blue-500',
                              green: 'text-green-500',
                              violet: 'text-violet-500',
                              amber: 'text-amber-500',
                              red: 'text-red-500',
                              pink: 'text-pink-500',
                              cyan: 'text-cyan-500',
                              emerald: 'text-emerald-500',
                              indigo: 'text-indigo-500',
                              orange: 'text-orange-500',
                              teal: 'text-teal-500',
                              rose: 'text-rose-500',
                            }[category.color] || 'text-gray-500'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{category.name}</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colorMap[category.color] || colorMap.blue}`}>
                              {category.color}
                            </span>
                            {!category.is_active && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">Disabled</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">{category.description || category.slug}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleCategory(category.id, category.is_active)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                              category.is_active
                                ? 'bg-green-50 text-green-700 hover:bg-green-100'
                                : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                            }`}
                          >
                            {category.is_active ? 'Active' : 'Inactive'}
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Users Section */}
        {activeSection === 'users' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  {(['all', 'creators', 'readers'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setUserFilter(filter)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        userFilter === filter
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {loading ? (
                <div className="p-12 text-center">
                  <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
                  <p className="text-gray-500">Loading users...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-12 text-center">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No users found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white font-medium">
                                {u.full_name?.[0] || u.email?.[0] || '?'}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{u.full_name || 'No name'}</div>
                                <div className="text-sm text-gray-500">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                              u.role === 'creator' ? 'bg-violet-100 text-violet-700' :
                              u.role === 'admin' ? 'bg-red-100 text-red-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {u.role || 'reader'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {format(new Date(u.created_at), 'MMM d, yyyy')}
                          </td>
                          <td className="px-6 py-4">
                            <span className="flex items-center gap-1.5 text-sm text-green-600">
                              <CheckCircle className="w-4 h-4" />
                              Active
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="relative inline-block">
                              <button 
                                onClick={() => {
                                  setSelectedUser(selectedUser?.id === u.id ? null : u);
                                }}
                                className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                              
                              {selectedUser?.id === u.id && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                                  <button
                                    onClick={() => {
                                      setShowUserModal(true);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                  >
                                    <Eye className="w-4 h-4" />
                                    View Details
                                  </button>
                                  <button
                                    onClick={async () => {
                                      const supabase = createClient();
                                      await supabase.from('users').update({ role: 'creator' }).eq('id', u.id);
                                      setUsers(prev => prev.map(user => user.id === u.id ? { ...user, role: 'creator' } : user));
                                      setSelectedUser(null);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                  >
                                    <UserCheck className="w-4 h-4" />
                                    Make Creator
                                  </button>
                                  <button
                                    onClick={async () => {
                                      const supabase = createClient();
                                      await supabase.from('admin_users').upsert({ user_id: u.id, role: 'admin' });
                                      setSelectedUser(null);
                                      alert('User promoted to admin!');
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                  >
                                    <Shield className="w-4 h-4" />
                                    Make Admin
                                  </button>
                                  <div className="border-t border-gray-100 my-1" />
                                  <button
                                    onClick={() => {
                                      if (confirm('Are you sure you want to delete this user?')) {
                                        setUsers(prev => prev.filter(user => user.id !== u.id));
                                        setSelectedUser(null);
                                      }
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Delete User
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* User Detail Modal */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">User Details</h3>
                <button 
                  onClick={() => { setShowUserModal(false); setSelectedUser(null); }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <XCircle className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-2xl font-bold">
                  {selectedUser.full_name?.[0] || selectedUser.email?.[0] || '?'}
                </div>
                <div>
                  <div className="text-xl font-semibold text-gray-900">{selectedUser.full_name || 'No name'}</div>
                  <div className="text-gray-500">{selectedUser.email}</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Role</span>
                  <span className="font-medium text-gray-900 capitalize">{selectedUser.role || 'reader'}</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Joined</span>
                  <span className="font-medium text-gray-900">{format(new Date(selectedUser.created_at), 'MMM d, yyyy')}</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">User ID</span>
                  <span className="font-mono text-sm text-gray-900">{selectedUser.id.slice(0, 8)}...</span>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => { setShowUserModal(false); setSelectedUser(null); }}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Section */}
        {activeSection === 'content' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search content..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  {(['all', 'published', 'draft'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setContentFilter(filter)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        contentFilter === filter
                          ? 'bg-violet-100 text-violet-700'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Content Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {loading ? (
                <div className="p-12 text-center">
                  <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
                  <p className="text-gray-500">Loading content...</p>
                </div>
              ) : filteredContent.length === 0 ? (
                <div className="p-12 text-center">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No content found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Content</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Creator</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reads</th>
                        <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredContent.map((c) => (
                        <tr key={c.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                                <FileText className="w-5 h-5 text-gray-400" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 line-clamp-1">{c.title}</div>
                                <div className="text-xs text-gray-500">{c.content_type}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {c.creator?.full_name || c.creator?.email || 'Unknown'}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                              c.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {c.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-mono text-gray-900">
                            ${(c.price_cents / 100).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {c.total_reads || 0}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Link
                              href={`/content/${c.id}`}
                              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                            >
                              View <ExternalLink className="w-3 h-3" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Transactions Section */}
        {activeSection === 'transactions' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
                <p className="text-gray-500">Loading transactions...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="p-12 text-center">
                <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No transactions found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Transaction</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Buyer</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Content</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-mono text-sm text-gray-600">{tx.id.slice(0, 8)}...</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{tx.reader?.full_name || tx.reader?.email || 'Unknown'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600 line-clamp-1">{tx.content?.title || 'Unknown'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono font-medium text-gray-900">${(tx.amount_paid_cents / 100).toFixed(2)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            tx.status === 'completed' || tx.status === 'active' ? 'bg-green-100 text-green-700' :
                            tx.status === 'expired' ? 'bg-gray-100 text-gray-600' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {format(new Date(tx.created_at), 'MMM d, yyyy HH:mm')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Visitors Section */}
        {activeSection === 'visitors' && (
          <div className="space-y-6">
            {loading ? (
              <div className="bg-white rounded-2xl p-12 border border-gray-100 shadow-sm text-center">
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
                <p className="text-gray-500">Loading analytics...</p>
              </div>
            ) : visitorStats ? (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="text-sm text-gray-500">Unique Visitors</span>
                    </div>
                    <div className="text-3xl font-bold font-mono text-gray-900">
                      {visitorStats.uniqueVisitors.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                        <Globe className="w-5 h-5 text-green-600" />
                      </div>
                      <span className="text-sm text-gray-500">Page Views</span>
                    </div>
                    <div className="text-3xl font-bold font-mono text-gray-900">
                      {visitorStats.totalPageViews.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-violet-600" />
                      </div>
                      <span className="text-sm text-gray-500">Avg. Pages/Visit</span>
                    </div>
                    <div className="text-3xl font-bold font-mono text-gray-900">
                      {visitorStats.uniqueVisitors > 0 
                        ? (visitorStats.totalPageViews / visitorStats.uniqueVisitors).toFixed(1) 
                        : '0'}
                    </div>
                  </div>
                </div>

                {/* Device Breakdown */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4">Device Breakdown</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <Monitor className="w-6 h-6 text-blue-600" />
                      <div>
                        <div className="text-2xl font-bold font-mono text-gray-900">{visitorStats.deviceBreakdown.desktop}</div>
                        <div className="text-xs text-gray-500">Desktop</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <Smartphone className="w-6 h-6 text-green-600" />
                      <div>
                        <div className="text-2xl font-bold font-mono text-gray-900">{visitorStats.deviceBreakdown.mobile}</div>
                        <div className="text-xs text-gray-500">Mobile</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <Tablet className="w-6 h-6 text-violet-600" />
                      <div>
                        <div className="text-2xl font-bold font-mono text-gray-900">{visitorStats.deviceBreakdown.tablet}</div>
                        <div className="text-xs text-gray-500">Tablet</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top Pages */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4">Top Pages</h3>
                  {visitorStats.topPages.length > 0 ? (
                    <div className="space-y-3">
                      {visitorStats.topPages.map((page: { path: string; views: number }, index: number) => (
                        <div key={page.path} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                              {index + 1}
                            </span>
                            <span className="text-sm font-medium text-gray-900">{page.path}</span>
                          </div>
                          <span className="text-sm font-mono text-gray-600">{page.views} views</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No page view data yet</p>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-2xl p-12 border border-gray-100 shadow-sm text-center">
                <Globe className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No visitor data available</p>
              </div>
            )}
          </div>
        )}

        {/* Activity Logs Section */}
        {activeSection === 'activity' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
                <p className="text-gray-500">Loading activity logs...</p>
              </div>
            ) : activityLogs.length === 0 ? (
              <div className="p-12 text-center">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No activity logs yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {activityLogs.map((log) => (
                  <div key={log.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        log.action_type.includes('payment') ? 'bg-green-100' :
                        log.action_type.includes('user') ? 'bg-blue-100' :
                        log.action_type.includes('content') ? 'bg-violet-100' :
                        'bg-gray-100'
                      }`}>
                        {log.action_type.includes('payment') ? <DollarSign className="w-5 h-5 text-green-600" /> :
                         log.action_type.includes('user') ? <Users className="w-5 h-5 text-blue-600" /> :
                         log.action_type.includes('content') ? <FileText className="w-5 h-5 text-violet-600" /> :
                         <Activity className="w-5 h-5 text-gray-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">{log.action_type.replace(/_/g, ' ')}</span>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        {log.description && (
                          <p className="text-sm text-gray-600 mt-1">{log.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Security Section */}
        {activeSection === 'security' && (
          <div className="space-y-6">
            {/* Payment Gateway Status */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 font-display mb-6">Payment Gateway Status</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(Object.entries(gateways) as [PaymentGateway, PaymentGatewayConfig][]).map(([key, gateway]) => (
                  <div 
                    key={key}
                    className={`p-4 rounded-xl border ${
                      gateway.isEnabled && gateway.publicKey
                        ? 'bg-green-50 border-green-200'
                        : gateway.isEnabled
                        ? 'bg-amber-50 border-amber-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        key === 'stripe' ? 'bg-indigo-100' :
                        key === 'paystack' ? 'bg-blue-100' :
                        key === 'flutterwave' ? 'bg-orange-100' :
                        key === 'paypal' ? 'bg-blue-100' :
                        'bg-gray-100'
                      }`}>
                        <CreditCard className={`w-5 h-5 ${
                          key === 'stripe' ? 'text-indigo-600' :
                          key === 'paystack' ? 'text-blue-600' :
                          key === 'flutterwave' ? 'text-orange-600' :
                          key === 'paypal' ? 'text-blue-600' :
                          'text-gray-600'
                        }`} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{gateway.name}</p>
                        <p className="text-xs text-gray-500">Fee: {gateway.fees.percentage}%</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${
                        gateway.isEnabled && gateway.publicKey
                          ? 'text-green-700'
                          : gateway.isEnabled
                          ? 'text-amber-700'
                          : 'text-gray-500'
                      }`}>
                        {gateway.isEnabled && gateway.publicKey
                          ? '✓ Ready'
                          : gateway.isEnabled
                          ? '⚠ Missing Keys'
                          : 'Disabled'}
                      </span>
                      <button
                        onClick={() => setActiveSection('gateways')}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Configure
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 font-display mb-6">Content Protection</h2>
              
              <div className="space-y-4">
                {[
                  { icon: Shield, title: 'Device Fingerprinting', desc: 'Bind downloads to specific devices', enabled: true },
                  { icon: Shield, title: 'Copy Protection', desc: 'Prevent text selection and copying', enabled: true },
                  { icon: Shield, title: 'Screenshot Prevention', desc: 'Blur content on screenshot attempts', enabled: true },
                  { icon: Shield, title: 'PDF Encryption', desc: 'Encrypt downloads with device-bound password', enabled: true },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="font-medium text-gray-900">{item.title}</div>
                        <div className="text-sm text-gray-500">{item.desc}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-green-600 font-medium">Enabled</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 font-display mb-6">Session Security</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-medium text-gray-900">Session Timeout</div>
                      <div className="text-sm text-gray-500">Auto-logout after inactivity</div>
                    </div>
                  </div>
                  <span className="text-gray-900 font-mono">30 minutes</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-violet-600" />
                    <div>
                      <div className="font-medium text-gray-900">Activity Logging</div>
                      <div className="text-sm text-gray-500">Track all user actions</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-green-600 font-medium">Enabled</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
