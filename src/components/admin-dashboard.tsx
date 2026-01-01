'use client';

import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { 
  Shield,
  CreditCard,
  Users,
  FileText,
  DollarSign,
  Settings,
  Activity,
  Globe,
  CheckCircle,
  XCircle,
  Edit,
  Save,
  Loader2,
  ArrowLeft,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { DEFAULT_GATEWAYS, PaymentGateway, PaymentGatewayConfig } from '@/lib/payment-gateways';

interface AdminDashboardProps {
  user: User;
  stats: {
    totalContent: number;
    totalUsers: number;
    totalSessions: number;
    totalRevenue: number;
  };
  gatewaySettings: any[];
}

export default function AdminDashboard({ user, stats, gatewaySettings }: AdminDashboardProps) {
  const [activeSection, setActiveSection] = useState<'overview' | 'gateways' | 'users' | 'content' | 'security'>('overview');
  const [editingGateway, setEditingGateway] = useState<PaymentGateway | null>(null);
  const [saving, setSaving] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  // Initialize gateway configurations from database or defaults
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

  const handleToggleGateway = async (gateway: PaymentGateway) => {
    setGateways(prev => ({
      ...prev,
      [gateway]: {
        ...prev[gateway],
        isEnabled: !prev[gateway].isEnabled,
      },
    }));
  };

  const handleSaveGateway = async (gateway: PaymentGateway) => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setEditingGateway(null);
    setSaving(false);
  };

  const sidebarItems = [
    { icon: Activity, label: 'Overview', key: 'overview' as const },
    { icon: CreditCard, label: 'Payment Gateways', key: 'gateways' as const },
    { icon: Users, label: 'Users', key: 'users' as const },
    { icon: FileText, label: 'Content', key: 'content' as const },
    { icon: Shield, label: 'Security', key: 'security' as const },
  ];

  const statCards = [
    { 
      title: 'Total Users', 
      value: stats.totalUsers.toLocaleString(), 
      icon: Users, 
      color: 'blue',
      change: '+12%' 
    },
    { 
      title: 'Total Content', 
      value: stats.totalContent.toLocaleString(), 
      icon: FileText, 
      color: 'violet',
      change: '+8%' 
    },
    { 
      title: 'Reading Sessions', 
      value: stats.totalSessions.toLocaleString(), 
      icon: Clock, 
      color: 'green',
      change: '+23%' 
    },
    { 
      title: 'Total Revenue', 
      value: `$${(stats.totalRevenue / 100).toFixed(2)}`, 
      icon: DollarSign, 
      color: 'amber',
      change: '+18%' 
    },
  ];

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 font-display">
            {activeSection === 'overview' && 'Admin Dashboard'}
            {activeSection === 'gateways' && 'Payment Gateways'}
            {activeSection === 'users' && 'User Management'}
            {activeSection === 'content' && 'Content Management'}
            {activeSection === 'security' && 'Security Settings'}
          </h1>
          <p className="text-gray-500 mt-1">
            {activeSection === 'overview' && 'Monitor platform performance and statistics.'}
            {activeSection === 'gateways' && 'Configure and manage payment providers.'}
            {activeSection === 'users' && 'View and manage platform users.'}
            {activeSection === 'content' && 'Monitor all content on the platform.'}
            {activeSection === 'security' && 'Configure security and protection settings.'}
          </p>
        </div>

        {/* Overview Section */}
        {activeSection === 'overview' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statCards.map((stat) => (
                <div
                  key={stat.title}
                  className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-${stat.color}-50 flex items-center justify-center`}>
                      <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-600 font-medium">
                      {stat.change}
                    </span>
                  </div>
                  <div className="text-3xl font-bold font-mono text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.title}</div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 font-display mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveSection('gateways')}
                  className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all group"
                >
                  <CreditCard className="w-8 h-8 text-blue-600 mb-3" />
                  <div className="font-medium text-gray-900 group-hover:text-blue-600">Configure Payments</div>
                  <div className="text-sm text-gray-500 mt-1">Set up payment gateways</div>
                </button>
                <button
                  onClick={() => setActiveSection('users')}
                  className="p-4 border border-gray-200 rounded-xl hover:border-violet-300 hover:bg-violet-50 transition-all group"
                >
                  <Users className="w-8 h-8 text-violet-600 mb-3" />
                  <div className="font-medium text-gray-900 group-hover:text-violet-600">Manage Users</div>
                  <div className="text-sm text-gray-500 mt-1">View and moderate users</div>
                </button>
                <button
                  onClick={() => setActiveSection('security')}
                  className="p-4 border border-gray-200 rounded-xl hover:border-red-300 hover:bg-red-50 transition-all group"
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
            {/* Gateway List */}
            {(Object.entries(gateways) as [PaymentGateway, PaymentGatewayConfig][]).map(([key, gateway]) => (
              <div
                key={key}
                className={`bg-white rounded-2xl border ${
                  gateway.isEnabled ? 'border-green-200' : 'border-gray-100'
                } shadow-sm overflow-hidden`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      {/* Gateway Logo/Icon */}
                      <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                        key === 'stripe' ? 'bg-indigo-100' :
                        key === 'paystack' ? 'bg-blue-100' :
                        key === 'flutterwave' ? 'bg-orange-100' :
                        key === 'alipay' ? 'bg-sky-100' :
                        key === 'momo' ? 'bg-yellow-100' :
                        'bg-gray-100'
                      }`}>
                        <CreditCard className={`w-8 h-8 ${
                          key === 'stripe' ? 'text-indigo-600' :
                          key === 'paystack' ? 'text-blue-600' :
                          key === 'flutterwave' ? 'text-orange-600' :
                          key === 'alipay' ? 'text-sky-600' :
                          key === 'momo' ? 'text-yellow-600' :
                          'text-gray-600'
                        }`} />
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{gateway.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{gateway.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-gray-400">
                            Fee: {gateway.fees.percentage}% + {gateway.fees.currency === 'USD' ? '$' : ''}{gateway.fees.fixed / 100}
                          </span>
                          <span className="text-xs text-gray-400">
                            Currencies: {gateway.supportedCurrencies.slice(0, 3).join(', ')}
                            {gateway.supportedCurrencies.length > 3 && `+${gateway.supportedCurrencies.length - 3}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Status Badge */}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        gateway.isEnabled
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {gateway.isEnabled ? 'Enabled' : 'Disabled'}
                      </span>

                      {/* Toggle */}
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

                      {/* Edit Button */}
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
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Public Key
                          </label>
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
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Secret Key
                          </label>
                          <div className="relative">
                            <input
                              type={showSecrets[key] ? 'text' : 'password'}
                              value={gatewaySecrets[key] || ''}
                              onChange={(e) => setGatewaySecrets(prev => ({
                                ...prev,
                                [key]: e.target.value
                              }))}
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

                      {key !== 'manual' && (
                        <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm text-amber-800 font-medium">Important</p>
                            <p className="text-xs text-amber-600 mt-1">
                              Never share your secret key. Store it securely in environment variables for production.
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="mt-4 flex justify-end gap-3">
                        <button
                          onClick={() => setEditingGateway(null)}
                          className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveGateway(key)}
                          disabled={saving}
                          className="px-6 py-2 bg-gradient-to-r from-blue-500 to-violet-500 text-white rounded-xl font-medium flex items-center gap-2 hover:shadow-lg transition-all disabled:opacity-50"
                        >
                          {saving ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4" />
                              Save Configuration
                            </>
                          )}
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
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 font-display">All Users</h2>
            </div>
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">User management functionality coming soon.</p>
              <p className="text-sm text-gray-400 mt-2">Total registered users: {stats.totalUsers}</p>
            </div>
          </div>
        )}

        {/* Content Section */}
        {activeSection === 'content' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 font-display">All Content</h2>
            </div>
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Content management functionality coming soon.</p>
              <p className="text-sm text-gray-400 mt-2">Total content items: {stats.totalContent}</p>
            </div>
          </div>
        )}

        {/* Security Section */}
        {activeSection === 'security' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 font-display mb-6">Content Protection</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="font-medium text-gray-900">Device Fingerprinting</div>
                      <div className="text-sm text-gray-500">Bind downloads to specific devices</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-green-600 font-medium">Enabled</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="font-medium text-gray-900">Copy Protection</div>
                      <div className="text-sm text-gray-500">Prevent text selection and copying</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-green-600 font-medium">Enabled</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="font-medium text-gray-900">Screenshot Prevention</div>
                      <div className="text-sm text-gray-500">Blur content on screenshot attempts</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-green-600 font-medium">Enabled</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="font-medium text-gray-900">PDF Encryption</div>
                      <div className="text-sm text-gray-500">Encrypt downloads with device-bound password</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-green-600 font-medium">Enabled</span>
                  </div>
                </div>
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
