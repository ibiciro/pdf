'use client';

import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { 
  DollarSign, 
  Users, 
  BookOpen, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Plus,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Star,
  BarChart3,
  FileText,
  Settings,
  Home
} from 'lucide-react';
import Link from 'next/link';
import UploadModal from './upload-modal';

interface CreatorDashboardProps {
  user: User;
}

// Mock analytics data
const analyticsCards = [
  {
    title: 'Total Earnings',
    value: '$12,450',
    change: '+12.5%',
    trend: 'up',
    icon: DollarSign,
    color: 'cyan',
  },
  {
    title: 'Active Readers',
    value: '1,234',
    change: '+8.2%',
    trend: 'up',
    icon: Users,
    color: 'purple',
  },
  {
    title: 'Total Reads',
    value: '45,678',
    change: '+23.1%',
    trend: 'up',
    icon: BookOpen,
    color: 'green',
  },
  {
    title: 'Avg. Session Time',
    value: '24 min',
    change: '-2.3%',
    trend: 'down',
    icon: Clock,
    color: 'amber',
  },
];

// Mock content data
const contentItems = [
  {
    id: '1',
    title: 'The Future of AI in Content Creation',
    status: 'published',
    earnings: '$2,450',
    reads: 1520,
    rating: 4.8,
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=200&q=80',
  },
  {
    id: '2',
    title: 'Mastering Web3 Development',
    status: 'published',
    earnings: '$1,890',
    reads: 980,
    rating: 4.9,
    thumbnail: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=200&q=80',
  },
  {
    id: '3',
    title: 'Investment Strategies for 2024',
    status: 'draft',
    earnings: '$0',
    reads: 0,
    rating: 0,
    thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=200&q=80',
  },
  {
    id: '4',
    title: 'The Psychology of Success',
    status: 'published',
    earnings: '$3,210',
    reads: 1890,
    rating: 4.6,
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
  },
];

const sidebarItems = [
  { icon: Home, label: 'Overview', active: true },
  { icon: FileText, label: 'My Content', active: false },
  { icon: BarChart3, label: 'Analytics', active: false },
  { icon: DollarSign, label: 'Earnings', active: false },
  { icon: Settings, label: 'Settings', active: false },
];

export default function CreatorDashboard({ user }: CreatorDashboardProps) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="flex min-h-screen pt-16 bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 p-6 hidden lg:block">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-sm font-bold text-white">
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-semibold text-gray-900 text-sm">{user.email?.split('@')[0]}</div>
              <div className="text-xs text-gray-500">Creator</div>
            </div>
          </div>
        </div>
        
        <nav className="space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                item.active
                  ? 'bg-blue-50 text-blue-600 border border-blue-200'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        
        <div className="absolute bottom-6 left-6 right-6">
          <button
            onClick={() => setShowUploadModal(true)}
            className="w-full btn-glow py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Content
          </button>
        </div>
      </aside>
      
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
            <h2 className="text-xl font-bold text-gray-900 font-display">Content Library</h2>
            <Link href="/dashboard/content" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Content</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Earnings</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Reads</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Rating</th>
                  <th className="text-right p-4 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {contentItems.map((item) => (
                  <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-16 h-12 rounded-lg bg-cover bg-center"
                          style={{
                            backgroundImage: `url(${item.thumbnail})`,
                            filter: item.status === 'draft' ? 'blur(4px) grayscale(50%)' : 'none',
                          }}
                        />
                        <div>
                          <div className="font-medium text-gray-900">{item.title}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.status === 'published'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-gray-900">{item.earnings}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-600">{item.reads.toLocaleString()}</span>
                    </td>
                    <td className="p-4">
                      {item.rating > 0 ? (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                          <span className="text-gray-900">{item.rating}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      
      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal onClose={() => setShowUploadModal(false)} />
      )}
    </div>
  );
}
