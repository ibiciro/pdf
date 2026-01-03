'use client';

import { useState } from 'react';
import { 
  Bell, Check, DollarSign, Heart, Star, Clock, FileText, 
  User, AlertCircle, CheckCheck, Trash2, Filter
} from 'lucide-react';
import { markNotificationReadAction, markAllNotificationsReadAction } from '@/app/actions';
import { formatDistanceToNow, format } from 'date-fns';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  content_id: string | null;
  related_user_id: string | null;
  is_read: boolean;
  metadata: Record<string, any>;
  created_at: string;
}

interface NotificationsPageProps {
  notifications: Notification[];
}

export default function NotificationsPage({ notifications: initialNotifications }: NotificationsPageProps) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(false);

  const filteredNotifications = notifications.filter(n => 
    filter === 'all' || !n.is_read
  );

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkRead = async (id: string) => {
    await markNotificationReadAction(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const handleMarkAllRead = async () => {
    setLoading(true);
    await markAllNotificationsReadAction();
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setLoading(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'purchase': return <DollarSign className="w-5 h-5 text-green-600" />;
      case 'like': return <Heart className="w-5 h-5 text-red-500" />;
      case 'review': return <Star className="w-5 h-5 text-amber-500" />;
      case 'session_start': case 'session_end': return <Clock className="w-5 h-5 text-blue-500" />;
      case 'content_published': return <FileText className="w-5 h-5 text-violet-500" />;
      case 'new_follower': return <User className="w-5 h-5 text-cyan-500" />;
      case 'earning': return <DollarSign className="w-5 h-5 text-emerald-500" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'purchase': return 'bg-green-50 border-green-200';
      case 'like': return 'bg-red-50 border-red-200';
      case 'review': return 'bg-amber-50 border-amber-200';
      case 'session_start': case 'session_end': return 'bg-blue-50 border-blue-200';
      case 'content_published': return 'bg-violet-50 border-violet-200';
      case 'earning': return 'bg-emerald-50 border-emerald-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 font-display">Notifications</h1>
        <p className="text-gray-500 mt-1">Stay updated with your activity</p>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'unread'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-500">
              {filter === 'unread' 
                ? "You're all caught up!" 
                : "You don't have any notifications yet."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-5 hover:bg-gray-50 transition-colors ${
                  !notification.is_read ? 'bg-blue-50/50' : ''
                }`}
              >
                <div className="flex gap-4">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full ${getNotificationColor(notification.type)} border-2 flex items-center justify-center`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className={`font-semibold ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-gray-400">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </span>
                          <span className="text-xs text-gray-300">•</span>
                          <span className="text-xs text-gray-400">
                            {format(new Date(notification.created_at), 'MMM d, yyyy h:mm a')}
                          </span>
                        </div>
                      </div>
                      
                      {!notification.is_read && (
                        <button
                          onClick={() => handleMarkRead(notification.id)}
                          className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          Mark read
                        </button>
                      )}
                    </div>

                    {/* Additional metadata display */}
                    {notification.metadata && Object.keys(notification.metadata).length > 0 && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
                        {notification.metadata.amount_cents && (
                          <span className="font-medium text-green-600">
                            ${(notification.metadata.amount_cents / 100).toFixed(2)} earned
                          </span>
                        )}
                        {notification.metadata.rating && (
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            {notification.metadata.rating} star rating
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
