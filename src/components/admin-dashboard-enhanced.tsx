'use client';

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { 
  Shield, CreditCard, Users, FileText, DollarSign, Settings, Activity,
  Globe, CheckCircle, XCircle, Edit, Save, Loader2, ArrowLeft, Eye, EyeOff,
  Plus, Trash2, AlertTriangle, TrendingUp, BarChart3, Clock, Wallet, Search,
  ChevronDown, ChevronRight, Monitor, Smartphone, Tablet, ExternalLink,
  UserCheck, UserX, Mail, Calendar, RefreshCw, Download, Filter, MoreVertical
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

type ActiveSection = 'overview' | 'gateways' | 'users' | 'content' | 'transactions' | 'visitors' | 'activity' | 'security';

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

  // Filter states
  const [userFilter, setUserFilter] = useState<'all' | 'creators' | 'readers'>('all');
  const [contentFilter, setContentFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [searchQuery, setSearchQuery] = useState('');

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
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
      setLoading(false);
    };

    loadData();
  }, [activeSection]);

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
            {(Object.entries(gateways) as [PaymentGateway, PaymentGatewayConfig][]).map(([key, gateway]) => (
              <div
                key={key}
                className={`bg-white rounded-2xl border ${gateway.isEnabled ? 'border-green-200' : 'border-gray-100'} shadow-sm overflow-hidden`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                        key === 'stripe' ? 'bg-indigo-100' :
                        key === 'paystack' ? 'bg-blue-100' :
                        key === 'flutterwave' ? 'bg-orange-100' :
                        'bg-gray-100'
                      }`}>
                        <CreditCard className={`w-8 h-8 ${
                          key === 'stripe' ? 'text-indigo-600' :
                          key === 'paystack' ? 'text-blue-600' :
                          key === 'flutterwave' ? 'text-orange-600' :
                          'text-gray-600'
                        }`} />
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{gateway.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{gateway.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-gray-400">
                            Fee: {gateway.fees.percentage}% + ${gateway.fees.fixed / 100}
                          </span>
                          <span className="text-xs text-gray-400">
                            Currencies: {gateway.supportedCurrencies.slice(0, 3).join(', ')}
                            {gateway.supportedCurrencies.length > 3 && `+${gateway.supportedCurrencies.length - 3}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        gateway.isEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {gateway.isEnabled ? 'Enabled' : 'Disabled'}
                      </span>

                      <button
                        onClick={() => handleToggleGateway(key)}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          gateway.isEnabled ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                          gateway.isEnabled ? 'left-7' : 'left-1'
                        }`} />
                      </button>

                      <button
                        onClick={() => setEditingGateway(editingGateway === key ? null : key)}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Configuration */}
                  {editingGateway === key && (
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Public Key</label>
                          <input
                            type="text"
                            value={gateway.publicKey || ''}
                            onChange={(e) => setGateways(prev => ({
                              ...prev,
                              [key]: { ...prev[key], publicKey: e.target.value }
                            }))}
                            placeholder={`Enter ${gateway.name} public key`}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Secret Key</label>
                          <div className="relative">
                            <input
                              type={showSecrets[key] ? 'text' : 'password'}
                              value={gatewaySecrets[key] || ''}
                              onChange={(e) => setGatewaySecrets(prev => ({ ...prev, [key]: e.target.value }))}
                              placeholder={`Enter ${gateway.name} secret key`}
                              className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                              type="button"
                              onClick={() => setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }))}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showSecrets[key] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex justify-end gap-3">
                        <button
                          onClick={() => setEditingGateway(null)}
                          className="px-4 py-2 text-gray-600 hover:text-gray-900"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveGateway(key)}
                          disabled={saving}
                          className="px-6 py-2 bg-gradient-to-r from-blue-500 to-violet-500 text-white rounded-xl font-medium flex items-center gap-2 hover:shadow-lg disabled:opacity-50"
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
                            <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600">
                              <MoreVertical className="w-4 h-4" />
                            </button>
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
