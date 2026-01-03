'use client';

import { User } from '@supabase/supabase-js';
import { 
  Home,
  FileText,
  BarChart3,
  DollarSign,
  Settings,
  Plus,
  LogOut,
  Shield,
  Sparkles,
  Bell
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface DashboardSidebarProps {
  user: User;
  activeTab?: string;
  activePage?: string;
}

const sidebarItems = [
  { icon: Home, label: 'Overview', key: 'overview', href: '/dashboard' },
  { icon: FileText, label: 'My Content', key: 'content', href: '/dashboard' },
  { icon: BarChart3, label: 'Analytics', key: 'analytics', href: '/dashboard/analytics' },
  { icon: DollarSign, label: 'Earnings', key: 'earnings', href: '/dashboard/earnings' },
  { icon: Bell, label: 'Notifications', key: 'notifications', href: '/dashboard/notifications' },
  { icon: Settings, label: 'Settings', key: 'settings', href: '/dashboard/settings' },
  { icon: Shield, label: 'Admin Panel', key: 'admin', href: '/admin', isAdmin: true },
];

export default function DashboardSidebar({ user, activeTab, activePage }: DashboardSidebarProps) {
  const currentPage = activePage || activeTab;
  const router = useRouter();

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 hidden lg:flex lg:flex-col">
      {/* User Profile */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-lg font-bold text-white shadow-lg">
            {user.email?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 truncate">{user.email?.split('@')[0]}</div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Creator</span>
            </div>
          </div>
        </div>
        
        {/* Protection Badge */}
        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-100">
          <Shield className="w-4 h-4 text-green-600" />
          <span className="text-xs text-green-700 font-medium">Content Protected</span>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {sidebarItems.map((item) => {
          const isActive = currentPage === item.key;
          const isAdminItem = (item as any).isAdmin;
          
          // Show admin link styled differently
          if (isAdminItem) {
            return (
              <Link
                key={item.key}
                href={item.href}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-amber-600 hover:bg-amber-50 hover:text-amber-700 border border-amber-200 mt-4"
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                  Admin
                </span>
              </Link>
            );
          }
          
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
              <span className="font-medium">{item.label}</span>
              {item.key === 'earnings' && (
                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700'
                }`}>
                  New
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      
      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-100 space-y-3">
        <Link
          href="/dashboard"
          className="w-full btn-glow py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Content
        </Link>
        
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  );
}
