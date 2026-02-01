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
  Loader2,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import DashboardSidebar from './dashboard-sidebar';
import { useState, useEffect } from 'react';
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

  // PayPal payout settings
  const [paypalEmail, setPaypalEmail] = useState(profile?.paypal_email || '');
  const [paypalConnected, setPaypalConnected] = useState(!!profile?.paypal_email);
  const [savingPaypal, setSavingPaypal] = useState(false);
  const [paypalSaved, setPaypalSaved] = useState(false);
  
  // Bank account settings  
  const [bankName, setBankName] = useState(profile?.bank_name || '');
  const [bankAccountNumber, setBankAccountNumber] = useState(profile?.bank_account || '');
  const [bankRoutingNumber, setBankRoutingNumber] = useState(profile?.bank_routing || '');

  const handleSavePaypal = async () => {
    if (!paypalEmail || !paypalEmail.includes('@')) {
      setError('Please enter a valid PayPal email address');
      return;
    }

    setSavingPaypal(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from('users')
        .update({
          paypal_email: paypalEmail,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) {
        setError(updateError.message);
        setSavingPaypal(false);
        return;
      }

      setPaypalConnected(true);
      setPaypalSaved(true);
      setTimeout(() => setPaypalSaved(false), 3000);
    } catch (err) {
      console.error('Error saving PayPal:', err);
      setError('Failed to connect PayPal. Please try again.');
    } finally {
      setSavingPaypal(false);
    }
  };

  const handleSaveBankAccount = async () => {
    if (!bankName || !bankAccountNumber || !bankRoutingNumber) {
      setError('Please fill in all bank account details');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from('users')
        .update({
          bank_name: bankName,
          bank_account: bankAccountNumber,
          bank_routing: bankRoutingNumber,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) {
        setError(updateError.message);
        setSaving(false);
        return;
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error saving bank account:', err);
      setError('Failed to save bank details. Please try again.');
    } finally {
      setSaving(false);
    }
  };

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
                    <div className="space-y-4">
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

                      {/* PayPal - Expanded Form */}
                      <div className={`rounded-xl p-5 border-2 transition-all ${
                        paypalConnected 
                          ? 'bg-white border-green-200' 
                          : 'bg-blue-50 border-blue-200'
                      }`}>
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 bg-[#003087] rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                            <svg className="w-10 h-6" viewBox="0 0 124 33" fill="none">
                              <path fill="#fff" d="M46.211 6.749h-6.839a.95.95 0 0 0-.939.802l-2.766 17.537a.57.57 0 0 0 .564.658h3.265a.95.95 0 0 0 .939-.803l.746-4.73a.95.95 0 0 1 .938-.803h2.165c4.505 0 7.105-2.18 7.784-6.5.306-1.89.013-3.375-.872-4.415-.97-1.142-2.694-1.746-4.985-1.746zM47 13.154c-.374 2.454-2.249 2.454-4.062 2.454h-1.032l.724-4.583a.57.57 0 0 1 .563-.481h.473c1.235 0 2.4 0 3.002.704.359.42.469 1.044.332 1.906zM66.654 13.075h-3.275a.57.57 0 0 0-.563.481l-.145.916-.229-.332c-.709-1.029-2.289-1.373-3.867-1.373-3.619 0-6.709 2.741-7.311 6.586-.313 1.918.132 3.752 1.22 5.031.998 1.176 2.426 1.666 4.125 1.666 2.916 0 4.533-1.875 4.533-1.875l-.146.91a.57.57 0 0 0 .562.66h2.95a.95.95 0 0 0 .939-.803l1.77-11.209a.567.567 0 0 0-.563-.658zm-4.565 6.374c-.316 1.871-1.801 3.127-3.695 3.127-.951 0-1.711-.305-2.199-.883-.484-.574-.668-1.391-.514-2.301.295-1.855 1.805-3.152 3.67-3.152.93 0 1.686.309 2.184.892.499.589.697 1.411.554 2.317zM84.096 13.075h-3.291a.954.954 0 0 0-.787.417l-4.539 6.686-1.924-6.425a.953.953 0 0 0-.912-.678h-3.234a.57.57 0 0 0-.541.754l3.625 10.638-3.408 4.811a.57.57 0 0 0 .465.9h3.287a.949.949 0 0 0 .781-.408l10.946-15.8a.57.57 0 0 0-.468-.895z"/>
                              <path fill="#009cde" d="M94.992 6.749h-6.84a.95.95 0 0 0-.938.802l-2.766 17.537a.569.569 0 0 0 .562.658h3.51a.665.665 0 0 0 .656-.562l.785-4.971a.95.95 0 0 1 .938-.803h2.164c4.506 0 7.105-2.18 7.785-6.5.307-1.89.012-3.375-.873-4.415-.971-1.142-2.694-1.746-4.983-1.746zm.789 6.405c-.373 2.454-2.248 2.454-4.062 2.454h-1.031l.725-4.583a.568.568 0 0 1 .562-.481h.473c1.234 0 2.4 0 3.002.704.359.42.468 1.044.331 1.906zM115.434 13.075h-3.273a.567.567 0 0 0-.562.481l-.145.916-.23-.332c-.709-1.029-2.289-1.373-3.867-1.373-3.619 0-6.709 2.741-7.311 6.586-.312 1.918.131 3.752 1.219 5.031 1 1.176 2.426 1.666 4.125 1.666 2.916 0 4.533-1.875 4.533-1.875l-.146.91a.57.57 0 0 0 .564.66h2.949a.95.95 0 0 0 .938-.803l1.771-11.209a.571.571 0 0 0-.565-.658zm-4.565 6.374c-.314 1.871-1.801 3.127-3.695 3.127-.949 0-1.711-.305-2.199-.883-.484-.574-.666-1.391-.514-2.301.297-1.855 1.805-3.152 3.67-3.152.93 0 1.686.309 2.184.892.501.589.699 1.411.554 2.317zM119.295 7.23l-2.807 17.858a.569.569 0 0 0 .562.658h2.822c.469 0 .867-.34.939-.803l2.768-17.536a.57.57 0 0 0-.562-.659h-3.16a.571.571 0 0 0-.562.482z"/>
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <p className="font-semibold text-gray-900">PayPal Payout</p>
                              {paypalConnected && (
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                  Connected
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 mb-4">
                              {paypalConnected 
                                ? 'Your PayPal account is connected for payouts' 
                                : 'Enter your PayPal email to receive payouts'}
                            </p>
                            
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">PayPal Email</label>
                                <input
                                  type="email"
                                  value={paypalEmail}
                                  onChange={(e) => setPaypalEmail(e.target.value)}
                                  placeholder="your-email@example.com"
                                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300"
                                />
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <a 
                                  href="https://www.paypal.com/myaccount/settings/" 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  Manage PayPal settings
                                </a>
                                <button
                                  onClick={handleSavePaypal}
                                  disabled={savingPaypal || !paypalEmail}
                                  className="px-4 py-2 bg-[#003087] text-white rounded-lg text-sm font-medium hover:bg-[#002570] transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                  {savingPaypal ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : paypalSaved ? (
                                    <Check className="w-4 h-4" />
                                  ) : null}
                                  {paypalConnected ? 'Update PayPal' : 'Connect PayPal'}
                                </button>
                              </div>
                              
                              {paypalSaved && (
                                <p className="text-sm text-green-600 flex items-center gap-1">
                                  <Check className="w-4 h-4" /> PayPal connected successfully!
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bank Transfer - Expanded Form */}
                      <div className="bg-white rounded-xl p-5 border border-gray-200">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                            <CreditCard className="w-7 h-7 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 mb-1">Bank Transfer</p>
                            <p className="text-sm text-gray-500 mb-4">Direct bank deposit (2-3 business days)</p>
                            
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                                <input
                                  type="text"
                                  value={bankName}
                                  onChange={(e) => setBankName(e.target.value)}
                                  placeholder="e.g., Chase Bank"
                                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-300"
                                />
                              </div>
                              
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                                  <input
                                    type="text"
                                    value={bankAccountNumber}
                                    onChange={(e) => setBankAccountNumber(e.target.value)}
                                    placeholder="••••••••1234"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-300"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Routing Number</label>
                                  <input
                                    type="text"
                                    value={bankRoutingNumber}
                                    onChange={(e) => setBankRoutingNumber(e.target.value)}
                                    placeholder="123456789"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-300"
                                  />
                                </div>
                              </div>
                              
                              <div className="flex justify-end">
                                <button
                                  onClick={handleSaveBankAccount}
                                  disabled={saving || !bankName || !bankAccountNumber || !bankRoutingNumber}
                                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                  Save Bank Details
                                </button>
                              </div>
                            </div>
                          </div>
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
