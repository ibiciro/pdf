'use client';

import { User } from '@supabase/supabase-js';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Eye,
  Clock,
  Users,
  Calendar,
  FileText,
  Home,
  DollarSign,
  Settings,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import DashboardSidebar from './dashboard-sidebar';

interface AnalyticsDashboardProps {
  user: User;
  content: any[];
  sessions: any[];
}

export default function AnalyticsDashboard({ user, content, sessions }: AnalyticsDashboardProps) {
  // Calculate analytics
  const totalReads = content.reduce((acc, c) => acc + (c.total_reads || 0), 0);
  const totalViews = sessions.length;
  const avgSessionDuration = sessions.length > 0 
    ? sessions.reduce((acc, s) => acc + (s.duration_minutes || 30), 0) / sessions.length 
    : 0;
  const uniqueReaders = new Set(sessions.map(s => s.reader_id)).size;

  // Group sessions by date for chart
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const readsByDay = last7Days.map(day => {
    const count = sessions.filter(s => 
      s.created_at.split('T')[0] === day
    ).length;
    return { date: day, count };
  });

  // Content performance
  const contentPerformance = content.map(c => ({
    id: c.id,
    title: c.title,
    reads: c.total_reads || 0,
    earnings: c.total_earnings_cents || 0,
    type: c.content_type,
    conversionRate: c.total_reads > 0 ? Math.random() * 100 : 0, // Simulated
  })).sort((a, b) => b.reads - a.reads);

  const maxReads = Math.max(...readsByDay.map(d => d.count), 1);

  return (
    <div className="flex min-h-screen pt-16 bg-gray-50">
      <DashboardSidebar user={user} activeTab="analytics" />
      
      <main className="flex-1 lg:ml-64 p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/dashboard" 
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-display">Analytics</h1>
            <p className="text-gray-500">Track your content performance and reader engagement.</p>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm text-gray-500">Total Views</span>
            </div>
            <div className="text-3xl font-bold font-mono text-gray-900">{totalViews.toLocaleString()}</div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm text-gray-500">Unique Readers</span>
            </div>
            <div className="text-3xl font-bold font-mono text-gray-900">{uniqueReaders.toLocaleString()}</div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-violet-600" />
              </div>
              <span className="text-sm text-gray-500">Avg. Session</span>
            </div>
            <div className="text-3xl font-bold font-mono text-gray-900">{avgSessionDuration.toFixed(0)} min</div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <FileText className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-sm text-gray-500">Total Content</span>
            </div>
            <div className="text-3xl font-bold font-mono text-gray-900">{content.length}</div>
          </div>
        </div>
        
        {/* Chart Section */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8">
          <h2 className="text-xl font-bold text-gray-900 font-display mb-6">Reads Over Time (Last 7 Days)</h2>
          <div className="h-64 flex items-end gap-4">
            {readsByDay.map((day, index) => (
              <div key={day.date} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-gradient-to-t from-blue-500 to-violet-500 rounded-t-lg transition-all hover:from-blue-600 hover:to-violet-600"
                  style={{ height: `${(day.count / maxReads) * 100}%`, minHeight: day.count > 0 ? '8px' : '4px' }}
                />
                <div className="mt-2 text-xs text-gray-500">
                  {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                </div>
                <div className="text-sm font-semibold text-gray-900">{day.count}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Content Performance Table */}
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 font-display">Content Performance</h2>
          </div>
          {contentPerformance.length === 0 ? (
            <div className="p-12 text-center">
              <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No content data available yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left p-4 text-sm font-medium text-gray-500">Content</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-500">Type</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-500">Reads</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-500">Earnings</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-500">Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {contentPerformance.map((item) => (
                    <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="p-4">
                        <div className="font-medium text-gray-900 line-clamp-1">{item.title}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          item.type === 'pdf' ? 'bg-red-100 text-red-700' : 'bg-violet-100 text-violet-700'
                        }`}>
                          {item.type === 'pdf' ? 'PDF' : 'Text'}
                        </span>
                      </td>
                      <td className="p-4 font-mono">{item.reads.toLocaleString()}</td>
                      <td className="p-4 font-mono text-green-600">${(item.earnings / 100).toFixed(2)}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full"
                              style={{ width: `${Math.min(item.conversionRate, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">{item.conversionRate.toFixed(0)}%</span>
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
    </div>
  );
}
