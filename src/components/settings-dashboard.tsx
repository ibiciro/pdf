'use client';

import { User } from '@supabase/supabase-js';
import { 
  Settings, 
  User as UserIcon,
  Mail,
  Lock,
  CreditCard,
  Bell,
  Shield,
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import DashboardSidebar from './dashboard-sidebar';
import { useState } from 'react';

interface SettingsDashboardProps {
  user: User;
  profile: any;
}

export default function SettingsDashboard({ user, profile }: SettingsDashboardProps) {
  const [activeSection, setActiveSection] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Profile form
  const [fullName, setFullName] = useState(profile?.full_name || user.user_metadata?.full_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [website, setWebsite] = useState(profile?.website || '');
  
  // Security form
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // Notification preferences
  const [notifications, setNotifications] = useState({
    newReads: true,
    earnings: true,
    marketing: false,
    security: true,
  });

  const sections = [
    { id: 'profile', icon: UserIcon, label: 'Profile' },
    { id: 'security', icon: Lock, label: 'Security' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'payment', icon: CreditCard, label: 'Payment' },
    { id: 'protection', icon: Shield, label: 'Content Protection' },
  ];

  const handleSave = async () => {
    setSaving(true);
    // Simulate save
    await new Promise(r => setTimeout(r, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex min-h-screen pt-16 bg-gray-50">
      <DashboardSidebar user={user} activeTab="settings" />
      
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
            <h1 className="text-3xl font-bold text-gray-900 font-display">Settings</h1>
            <p className="text-gray-500">Manage your account and preferences.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Settings Navigation */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm h-fit">
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeSection === section.id
                      ? 'bg-blue-50 text-blue-600 border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <section.icon className="w-5 h-5" />
                  <span className="font-medium">{section.label}</span>
                </button>
              ))}
            </nav>
          </div>
          
          {/* Settings Content */}
          <div className="lg:col-span-3 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            {/* Profile Settings */}
            {activeSection === 'profile' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 font-display mb-6">Profile Settings</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="email"
                        value={user.email || ''}
                        disabled
                        className="flex-1 px-4 py-3 rounded-xl bg-gray-100 text-gray-500 border border-gray-200"
                      />
                      <Mail className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell readers about yourself..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none resize-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://yourwebsite.com"
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Security Settings */}
            {activeSection === 'security' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 font-display mb-6">Security Settings</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Minimum 8 characters</p>
                  </div>
                  
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-amber-800 font-medium">Two-Factor Authentication</p>
                        <p className="text-xs text-amber-600 mt-1">
                          Enable 2FA for additional security. Coming soon.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Notification Settings */}
            {activeSection === 'notifications' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 font-display mb-6">Notification Preferences</h2>
                <div className="space-y-4">
                  {[
                    { key: 'newReads', label: 'New Reads', desc: 'Get notified when someone reads your content' },
                    { key: 'earnings', label: 'Earnings Updates', desc: 'Receive updates about your earnings and payouts' },
                    { key: 'security', label: 'Security Alerts', desc: 'Important security notifications' },
                    { key: 'marketing', label: 'Marketing Emails', desc: 'News, tips, and promotional content' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-medium text-gray-900">{item.label}</p>
                        <p className="text-sm text-gray-500">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => setNotifications(prev => ({
                          ...prev,
                          [item.key]: !prev[item.key as keyof typeof prev]
                        }))}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          notifications[item.key as keyof typeof notifications]
                            ? 'bg-blue-600'
                            : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                          notifications[item.key as keyof typeof notifications]
                            ? 'translate-x-6'
                            : 'translate-x-0.5'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Payment Settings */}
            {activeSection === 'payment' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 font-display mb-6">Payment Settings</h2>
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-violet-600 rounded flex items-center justify-center">
                        <CreditCard className="w-6 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Stripe Connect</p>
                        <p className="text-sm text-gray-500">Connected</p>
                      </div>
                      <span className="ml-auto px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        Active
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Your earnings are automatically deposited to your connected Stripe account.
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Platform Fee:</strong> 15% of each transaction goes to PayPerRead.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Content Protection Settings */}
            {activeSection === 'protection' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 font-display mb-6">Content Protection</h2>
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-green-800 font-medium">Maximum Protection Enabled</p>
                        <p className="text-xs text-green-600 mt-1">
                          Your content is protected with encryption, watermarking, and device fingerprinting.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Protection Features</h3>
                    {[
                      { label: 'Copy Prevention', desc: 'Prevents text selection and copying', enabled: true },
                      { label: 'Screenshot Blocking', desc: 'Detects and blocks screenshots', enabled: true },
                      { label: 'Device Fingerprinting', desc: 'Downloads are locked to specific devices', enabled: true },
                      { label: 'Encrypted Downloads', desc: 'PDFs are encrypted with personal passwords', enabled: true },
                      { label: 'Watermarking', desc: 'Dynamic watermarks with user info', enabled: true },
                    ].map((feature) => (
                      <div key={feature.label} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <p className="font-medium text-gray-900">{feature.label}</p>
                          <p className="text-sm text-gray-500">{feature.desc}</p>
                        </div>
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                          <Check className="w-4 h-4 text-green-600" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Save Button */}
            <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-end gap-4">
              {saved && (
                <span className="flex items-center gap-2 text-green-600 text-sm">
                  <Check className="w-4 h-4" />
                  Saved successfully
                </span>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-glow px-6 py-3 rounded-xl text-white font-semibold flex items-center gap-2"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
