'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, FileText, DollarSign, TrendingUp, Clock, Search, 
  MoreVertical, Edit, Trash2, Shield, ShieldCheck, Eye,
  RefreshCw, BarChart3, AlertCircle, Loader2, ChevronDown,
  UserCheck, UserX, BookOpen, Filter, X
} from 'lucide-react';
import { 
  getAllUsersAction, 
  getAllContentAdminAction, 
  getPlatformStatsAction,
  updateUserRoleAction,
  deleteUserAdminAction,
  deleteContentAdminAction
} from '@/app/actions';
import DashboardNavbar from './dashboard-navbar';

interface AdminDashboardProps {
  isSuperAdmin: boolean;
}

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
  avatar_url?: string;
}

interface ContentItem {
  id: string;
  title: string;
  content_type: string;
  status: string;
  price_cents: number;
  total_reads: number;
  total_earnings_cents: number;
  created_at: string;
  users?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
}

interface PlatformStats {
  totalUsers: number;
  totalCreators: number;
  totalContent: number;
  publishedContent: number;
  totalSessions: number;
  totalRevenue: number;
  newUsers: number;
  newContent: number;
}

export default function AdminDashboard({ isSuperAdmin }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'content'>('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showRoleMenu, setShowRoleMenu] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [usersRes, contentRes, statsRes] = await Promise.all([
        getAllUsersAction(),
        getAllContentAdminAction(),
        getPlatformStatsAction()
      ]);

      if (usersRes.error) throw new Error(usersRes.error);
      if (contentRes.error) throw new Error(contentRes.error);
      if (statsRes.error) throw new Error(statsRes.error);

      setUsers(usersRes.users as User[]);
      setContent(contentRes.content as ContentItem[]);
      setStats(statsRes as PlatformStats);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    const result = await updateUserRoleAction(userId, newRole);
    if (result.error) {
      setError(result.error);
    } else {
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    }
    setShowRoleMenu(null);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    const result = await deleteUserAdminAction(userId);
    if (result.error) {
      setError(result.error);
    } else {
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  const handleDeleteContent = async (contentId: string) => {
    if (!confirm('Are you sure you want to delete this content? This action cannot be undone.')) return;
    
    const result = await deleteContentAdminAction(contentId);
    if (result.error) {
      setError(result.error);
    } else {
      setContent(content.filter(c => c.id !== contentId));
    }
  };

  const filteredUsers = users.filter(user => {
    if (searchQuery && !user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !user.email?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (roleFilter !== 'all' && user.role !== roleFilter) return false;
    return true;
  });

  const filteredContent = content.filter(item => {
    if (searchQuery && !item.title?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    return true;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'superadmin': return 'bg-red-100 text-red-700';
      case 'admin': return 'bg-purple-100 text-purple-700';
      case 'creator': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-700';
      case 'draft': return 'bg-yellow-100 text-yellow-700';
      case 'archived': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 font-display">
                  {isSuperAdmin ? 'Super Admin Dashboard' : 'Admin Dashboard'}
                </h1>
              </div>
              <p className="text-gray-500">
                {isSuperAdmin 
                  ? 'Full platform control - manage users, content, and settings'
                  : 'Manage platform content and view analytics'
                }
              </p>
            </div>
            <button
              onClick={loadData}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-700">{error}</p>
              <button onClick={() => setError(null)} className="ml-auto">
                <X className="w-4 h-4 text-red-400 hover:text-red-600" />
              </button>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 mb-8 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-3 font-medium text-sm transition-colors relative ${
                activeTab === 'overview'
                  ? 'text-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Overview
              </span>
              {activeTab === 'overview' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
              )}
            </button>
            {isSuperAdmin && (
              <button
                onClick={() => setActiveTab('users')}
                className={`px-4 py-3 font-medium text-sm transition-colors relative ${
                  activeTab === 'users'
                    ? 'text-purple-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Users ({users.length})
                </span>
                {activeTab === 'users' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
                )}
              </button>
            )}
            <button
              onClick={() => setActiveTab('content')}
              className={`px-4 py-3 font-medium text-sm transition-colors relative ${
                activeTab === 'content'
                  ? 'text-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Content ({content.length})
              </span>
              {activeTab === 'content' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
              )}
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && stats && (
                <div className="space-y-8">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                          <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                          +{stats.newUsers} this week
                        </span>
                      </div>
                      <div className="text-3xl font-bold text-gray-900 font-mono">{stats.totalUsers}</div>
                      <div className="text-sm text-gray-500">Total Users</div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                          <UserCheck className="w-6 h-6 text-purple-600" />
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-gray-900 font-mono">{stats.totalCreators}</div>
                      <div className="text-sm text-gray-500">Creators</div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                          <FileText className="w-6 h-6 text-green-600" />
                        </div>
                        <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                          +{stats.newContent} this week
                        </span>
                      </div>
                      <div className="text-3xl font-bold text-gray-900 font-mono">{stats.totalContent}</div>
                      <div className="text-sm text-gray-500">Total Content</div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                          <DollarSign className="w-6 h-6 text-amber-600" />
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-gray-900 font-mono">
                        ${(stats.totalRevenue / 100).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">Total Revenue</div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Overview</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Published Content</span>
                          <span className="font-medium text-gray-900">{stats.publishedContent}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Total Reading Sessions</span>
                          <span className="font-medium text-gray-900">{stats.totalSessions}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Avg. Content per Creator</span>
                          <span className="font-medium text-gray-900">
                            {stats.totalCreators ? (stats.totalContent / stats.totalCreators).toFixed(1) : 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">User Distribution</h3>
                      <div className="space-y-4">
                        {['reader', 'creator', 'admin', 'superadmin'].map(role => {
                          const count = users.filter(u => u.role === role).length;
                          const percentage = users.length ? ((count / users.length) * 100).toFixed(1) : 0;
                          return (
                            <div key={role} className="flex items-center gap-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getRoleBadgeColor(role)}`}>
                                {role}
                              </span>
                              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${role === 'superadmin' ? 'bg-red-500' : role === 'admin' ? 'bg-purple-500' : role === 'creator' ? 'bg-blue-500' : 'bg-gray-400'}`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-500 w-16 text-right">{count} ({percentage}%)</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Users Tab */}
              {activeTab === 'users' && isSuperAdmin && (
                <div>
                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search users by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      />
                    </div>
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    >
                      <option value="all">All Roles</option>
                      <option value="reader">Readers</option>
                      <option value="creator">Creators</option>
                      <option value="admin">Admins</option>
                      <option value="superadmin">Super Admins</option>
                    </select>
                  </div>

                  {/* Users Table */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          <th className="text-left p-4 text-sm font-medium text-gray-500">User</th>
                          <th className="text-left p-4 text-sm font-medium text-gray-500">Role</th>
                          <th className="text-left p-4 text-sm font-medium text-gray-500">Joined</th>
                          <th className="text-right p-4 text-sm font-medium text-gray-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((user) => (
                          <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                                  {user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">{user.full_name || 'No name'}</div>
                                  <div className="text-sm text-gray-500">{user.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="relative">
                                <button
                                  onClick={() => setShowRoleMenu(showRoleMenu === user.id ? null : user.id)}
                                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getRoleBadgeColor(user.role || 'reader')} flex items-center gap-1`}
                                >
                                  {user.role || 'reader'}
                                  <ChevronDown className="w-3 h-3" />
                                </button>
                                
                                {showRoleMenu === user.id && (
                                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                    {['reader', 'creator', 'admin', 'superadmin'].map(role => (
                                      <button
                                        key={role}
                                        onClick={() => handleRoleChange(user.id, role)}
                                        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 capitalize"
                                      >
                                        {role}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="p-4 text-sm text-gray-500">
                              {new Date(user.created_at).toLocaleDateString()}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {filteredUsers.length === 0 && (
                      <div className="p-12 text-center">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No users found</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Content Tab */}
              {activeTab === 'content' && (
                <div>
                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search content by title..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    >
                      <option value="all">All Status</option>
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  {/* Content Table */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          <th className="text-left p-4 text-sm font-medium text-gray-500">Content</th>
                          <th className="text-left p-4 text-sm font-medium text-gray-500">Creator</th>
                          <th className="text-left p-4 text-sm font-medium text-gray-500">Type</th>
                          <th className="text-left p-4 text-sm font-medium text-gray-500">Status</th>
                          <th className="text-left p-4 text-sm font-medium text-gray-500">Price</th>
                          <th className="text-left p-4 text-sm font-medium text-gray-500">Reads</th>
                          <th className="text-right p-4 text-sm font-medium text-gray-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredContent.map((item) => (
                          <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50">
                            <td className="p-4">
                              <div className="font-medium text-gray-900 line-clamp-1">{item.title}</div>
                              <div className="text-xs text-gray-500">
                                {new Date(item.created_at).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="text-sm text-gray-700">{item.users?.full_name || 'Unknown'}</div>
                              <div className="text-xs text-gray-500">{item.users?.email}</div>
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
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadgeColor(item.status)}`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className="font-mono text-gray-900">
                                ${(item.price_cents / 100).toFixed(2)}
                              </span>
                            </td>
                            <td className="p-4 text-gray-600">
                              {item.total_reads.toLocaleString()}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-end gap-2">
                                <Link
                                  href={`/content/${item.id}`}
                                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                  <Eye className="w-4 h-4" />
                                </Link>
                                <button
                                  onClick={() => handleDeleteContent(item.id)}
                                  className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {filteredContent.length === 0 && (
                      <div className="p-12 text-center">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No content found</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
