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
import { createClient } from '../../supabase/client';

interface SettingsDashboardProps {
  user: User;
  profile: any;
}

export default function SettingsDashboard({ user, profile }: SettingsDashboardProps) {
  const [activeSection, setActiveSection] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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
    setError(null);
    
    try {
      const supabase = createClient();
      
      // Update user profile in the database
      const { error: updateError } = await supabase
        .from('users')
        .update({
          full_name: fullName,
          bio: bio,
          website: website,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
      
      if (updateError) {
        console.error('Error updating profile:', updateError);
        setError(updateError.message);
        setSaving(false);
        return;
      }
      
      // Also update auth metadata
      await supabase.auth.updateUser({
        data: { full_name: fullName }
      });
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  const handlePasswordChange = async () => {
    if (!newPassword || newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      const supabase = createClient();
      
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (updateError) {
        setError(updateError.message);
        setSaving(false);
        return;
      }
      
      setNewPassword('');
      setCurrentPassword('');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error changing password:', err);
      setError('Failed to change password. Please try again.');
    } finally {
      setSaving(false);
    }
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
                <h2 className="text-xl font-bold text-gray-900 font-display mb-6">Payment & Wallet Settings</h2>
                <div className="space-y-6">
                  {/* Connected Payment Methods */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Connected Payout Methods</h3>
                    <div className="space-y-3">
                      {/* Stripe */}
                      <div className="bg-white rounded-xl p-5 border border-gray-200 hover:border-blue-300 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                            <CreditCard className="w-7 h-7 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-gray-900">Stripe Connect</p>
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                Primary
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">••••••••1234 · Instant payouts enabled</p>
                          </div>
                          <div className="text-right">
                            <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                              <Check className="w-4 h-4" /> Connected
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* PayPal */}
                      <div className="bg-gray-50 rounded-xl p-5 border border-dashed border-gray-300 hover:border-blue-300 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                            <CreditCard className="w-7 h-7 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">PayPal</p>
                            <p className="text-sm text-gray-500">Connect your PayPal account for payouts</p>
                          </div>
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                            Connect
                          </button>
                        </div>
                      </div>

                      {/* Bank Transfer */}
                      <div className="bg-gray-50 rounded-xl p-5 border border-dashed border-gray-300 hover:border-blue-300 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                            <CreditCard className="w-7 h-7 text-emerald-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">Bank Transfer</p>
                            <p className="text-sm text-gray-500">Direct bank deposit (2-3 business days)</p>
                          </div>
                          <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
                            Add Bank
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payout Schedule */}
                  <div className="bg-gradient-to-r from-blue-50 to-violet-50 rounded-xl p-6 border border-blue-100">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Bell className="w-5 h-5 text-blue-600" />
                      Payout Schedule
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {['Daily', 'Weekly', 'Monthly'].map((schedule) => (
                        <button
                          key={schedule}
                          className={`p-4 rounded-xl border-2 text-center transition-all ${
                            schedule === 'Weekly'
                              ? 'border-blue-500 bg-white shadow-lg'
                              : 'border-transparent bg-white/50 hover:bg-white hover:border-gray-200'
                          }`}
                        >
                          <p className={`font-semibold ${schedule === 'Weekly' ? 'text-blue-600' : 'text-gray-700'}`}>
                            {schedule}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {schedule === 'Daily' && 'Next day'}
                            {schedule === 'Weekly' && 'Every Monday'}
                            {schedule === 'Monthly' && '1st of month'}
                          </p>
                          {schedule === 'Weekly' && (
                            <span className="inline-block mt-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                              Active
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Minimum Payout */}
                  <div className="bg-white rounded-xl p-5 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">Minimum Payout Threshold</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Payouts will only be processed when your balance exceeds this amount
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-gray-900">$50</span>
                        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600">
                          <Settings className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Platform Fee Notice */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-amber-800 font-medium">Platform Fee: 15%</p>
                        <p className="text-xs text-amber-600 mt-1">
                          PayPerRead takes a 15% platform fee from each transaction. Upgrade to Creator Pro to reduce this to 10%.
                        </p>
                      </div>
                    </div>
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
