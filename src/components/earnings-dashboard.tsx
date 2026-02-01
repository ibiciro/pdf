'use client';

import { User } from '@supabase/supabase-js';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  CreditCard,
  Clock,
  ArrowRight,
  ArrowLeft,
  Download,
  CheckCircle,
  Wallet,
  Banknote,
  FileText,
  AlertCircle,
  Loader2,
  X
} from 'lucide-react';
import Link from 'next/link';
import DashboardSidebar from './dashboard-sidebar';
import { useState, useEffect } from 'react';
import { createClient } from '../../supabase/client';

interface EarningsDashboardProps {
  user: User;
  content: any[];
  transactions: any[];
}

export default function EarningsDashboard({ user, content, transactions }: EarningsDashboardProps) {
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutProcessing, setPayoutProcessing] = useState(false);
  const [payoutSuccess, setPayoutSuccess] = useState(false);
  const [selectedPayoutMethod, setSelectedPayoutMethod] = useState<'stripe' | 'paypal' | 'bank'>('stripe');
  const [userBalances, setUserBalances] = useState({
    available: 0,
    pending: 0,
    totalPaidOut: 0
  });

  // Fetch real user balances
  useEffect(() => {
    const fetchBalances = async () => {
      const supabase = createClient();
      const { data: userData } = await supabase
        .from('users')
        .select('available_balance_cents, pending_balance_cents, total_paid_out_cents')
        .eq('id', user.id)
        .single();
      
      if (userData) {
        setUserBalances({
          available: userData.available_balance_cents || 0,
          pending: userData.pending_balance_cents || 0,
          totalPaidOut: userData.total_paid_out_cents || 0
        });
      }
    };
    fetchBalances();
  }, [user.id]);

  // Calculate earnings from actual transactions
  const totalEarningsFromContent = content.reduce((acc, c) => acc + (c.total_earnings_cents || 0), 0);
  const totalEarningsFromTransactions = transactions
    .filter(t => t.status === 'completed')
    .reduce((acc, t) => acc + (t.amount_paid_cents || 0), 0);
  
  // Use the higher value between content totals and transaction totals
  const totalEarnings = Math.max(totalEarningsFromContent, totalEarningsFromTransactions);
  const platformFee = totalEarnings * 0.15; // 15% platform fee
  const netEarnings = totalEarnings - platformFee;
  
  // Use real balances if available, otherwise calculate from transactions
  const pendingPayout = userBalances.pending > 0 ? userBalances.pending : Math.floor(netEarnings * 0.3);
  const paidOut = userBalances.totalPaidOut > 0 ? userBalances.totalPaidOut : Math.floor(netEarnings * 0.7);
  const availableBalance = userBalances.available > 0 ? userBalances.available : pendingPayout;

  // Monthly earnings breakdown
  const currentMonth = new Date().getMonth();
  const monthlyEarnings = Array.from({ length: 6 }, (_, i) => {
    const month = (currentMonth - i + 12) % 12;
    const monthName = new Date(2024, month, 1).toLocaleDateString('en', { month: 'short' });
    // Simulated monthly earnings
    return {
      month: monthName,
      earnings: Math.floor(Math.random() * 5000) + 1000,
    };
  }).reverse();

  // Top earning content
  const topEarning = content
    .sort((a, b) => (b.total_earnings_cents || 0) - (a.total_earnings_cents || 0))
    .slice(0, 5);

  // Recent transactions
  const recentTransactions = transactions.slice(0, 10).map(t => ({
    id: t.id,
    amount: t.amount_paid_cents || 0,
    date: t.created_at,
    contentId: t.content_id,
    status: t.status,
    type: 'reading_session',
  }));

  return (
    <div className="flex min-h-screen pt-16 bg-gray-50">
      <DashboardSidebar user={user} activeTab="earnings" />
      
      <main className="flex-1 lg:ml-64 p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard" 
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 font-display">Earnings</h1>
              <p className="text-gray-500">Track your revenue and manage payouts.</p>
            </div>
          </div>
          <button 
            onClick={() => setShowPayoutModal(true)}
            className="btn-glow px-6 py-3 rounded-xl text-white font-semibold flex items-center gap-2"
            disabled={availableBalance < 5000}
          >
            <Wallet className="w-5 h-5" />
            Request Payout
          </button>
        </div>
        
        {/* Earnings Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-8 h-8 opacity-80" />
              <span className="text-green-100">Total Earnings</span>
            </div>
            <div className="text-4xl font-bold font-mono mb-2">
              ${(totalEarnings / 100).toFixed(2)}
            </div>
            <div className="flex items-center gap-2 text-green-200 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>+12.5% from last month</span>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-sm text-gray-500">Pending Payout</span>
            </div>
            <div className="text-3xl font-bold font-mono text-gray-900">
              ${(pendingPayout / 100).toFixed(2)}
            </div>
            <p className="text-xs text-gray-400 mt-2">Minimum $50 for payout</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm text-gray-500">Paid Out</span>
            </div>
            <div className="text-3xl font-bold font-mono text-gray-900">
              ${(paidOut / 100).toFixed(2)}
            </div>
            <p className="text-xs text-gray-400 mt-2">Lifetime payouts</p>
          </div>
        </div>
        
        {/* Platform Fee Notice */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800 font-medium">Platform Fee: 15%</p>
            <p className="text-xs text-blue-600 mt-1">
              After fees, your net earnings are ${(netEarnings / 100).toFixed(2)}
            </p>
          </div>
        </div>
        
        {/* Monthly Chart */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8">
          <h2 className="text-xl font-bold text-gray-900 font-display mb-6">Monthly Earnings</h2>
          <div className="h-48 flex items-end gap-4">
            {monthlyEarnings.map((month) => {
              const maxEarnings = Math.max(...monthlyEarnings.map(m => m.earnings));
              return (
                <div key={month.month} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-gradient-to-t from-green-500 to-emerald-400 rounded-t-lg transition-all hover:from-green-600 hover:to-emerald-500"
                    style={{ height: `${(month.earnings / maxEarnings) * 100}%`, minHeight: '8px' }}
                  />
                  <div className="mt-2 text-xs text-gray-500">{month.month}</div>
                  <div className="text-sm font-semibold text-gray-900">${(month.earnings / 100).toFixed(0)}</div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Earning Content */}
          <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 font-display">Top Earning Content</h2>
            </div>
            {topEarning.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No earnings data yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {topEarning.map((item, index) => (
                  <div key={item.id} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-700' :
                      index === 1 ? 'bg-gray-200 text-gray-600' :
                      index === 2 ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{item.title}</div>
                      <div className="text-xs text-gray-500">{item.total_reads || 0} reads</div>
                    </div>
                    <div className="font-mono text-green-600 font-semibold">
                      ${((item.total_earnings_cents || 0) / 100).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Recent Transactions */}
          <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 font-display">Recent Transactions</h2>
            </div>
            {recentTransactions.length === 0 ? (
              <div className="p-12 text-center">
                <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No transactions yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
                {recentTransactions.map((tx) => (
                  <div key={tx.id} className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                      <ArrowRight className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900">Reading Session</div>
                      <div className="text-xs text-gray-500">
                        {new Date(tx.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-green-600 font-semibold">
                        +${(tx.amount / 100).toFixed(2)}
                      </div>
                      <div className={`text-xs ${
                        tx.status === 'completed' ? 'text-green-500' : 'text-amber-500'
                      }`}>
                        {tx.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Payout Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                <Wallet className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Request Payout</h3>
                <p className="text-gray-500 text-sm">Transfer your earnings to your wallet</p>
              </div>
            </div>
            
            {/* Payout Amount */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-6 border border-green-100">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Available for payout</p>
                <p className="text-4xl font-bold text-gray-900">${(availableBalance / 100).toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">After 15% platform fee</p>
              </div>
            </div>

            {/* Connected Wallet */}
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-3">Payout Method</p>
              <div className="space-y-3">
                <div 
                  onClick={() => setSelectedPayoutMethod('stripe')}
                  className={`p-4 bg-gray-50 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedPayoutMethod === 'stripe' ? 'border-blue-500' : 'border-transparent hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Stripe Connect</p>
                      <p className="text-sm text-gray-500">Instant payout to your account</p>
                    </div>
                    {selectedPayoutMethod === 'stripe' && <CheckCircle className="w-6 h-6 text-blue-500" />}
                  </div>
                </div>
                
                <div 
                  onClick={() => setSelectedPayoutMethod('paypal')}
                  className={`p-4 bg-gray-50 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedPayoutMethod === 'paypal' ? 'border-blue-500' : 'border-transparent hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#003087] rounded-xl flex items-center justify-center">
                      <svg className="w-8 h-5" viewBox="0 0 124 33" fill="none">
                        <path fill="#fff" d="M46.211 6.749h-6.839a.95.95 0 0 0-.939.802l-2.766 17.537a.57.57 0 0 0 .564.658h3.265a.95.95 0 0 0 .939-.803l.746-4.73a.95.95 0 0 1 .938-.803h2.165c4.505 0 7.105-2.18 7.784-6.5.306-1.89.013-3.375-.872-4.415-.97-1.142-2.694-1.746-4.985-1.746z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">PayPal</p>
                      <p className="text-sm text-gray-500">Payout to your PayPal account</p>
                    </div>
                    {selectedPayoutMethod === 'paypal' && <CheckCircle className="w-6 h-6 text-blue-500" />}
                  </div>
                </div>
                
                <div 
                  onClick={() => setSelectedPayoutMethod('bank')}
                  className={`p-4 bg-gray-50 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedPayoutMethod === 'bank' ? 'border-blue-500' : 'border-transparent hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <Banknote className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Bank Transfer</p>
                      <p className="text-sm text-gray-500">Direct deposit (2-3 days)</p>
                    </div>
                    {selectedPayoutMethod === 'bank' && <CheckCircle className="w-6 h-6 text-blue-500" />}
                  </div>
                </div>
              </div>
            </div>

            {/* Payout Schedule Info */}
            <div className="bg-amber-50 rounded-xl p-4 mb-6 border border-amber-100">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-800 font-medium">Payout Schedule</p>
                  <p className="text-xs text-amber-600 mt-1">
                    Payouts are processed weekly on Mondays. Minimum payout amount is $50.00.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowPayoutModal(false); setPayoutSuccess(false); }}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium transition-colors"
              >
                {payoutSuccess ? 'Close' : 'Cancel'}
              </button>
              {!payoutSuccess && (
                <button
                  onClick={async () => {
                    setPayoutProcessing(true);
                    
                    try {
                      const supabase = createClient();
                      
                      // Create payout request record
                      await supabase.from('activity_logs').insert({
                        user_id: user.id,
                        action_type: 'payout_request',
                        entity_type: 'payout',
                        description: `Payout request for $${(pendingPayout / 100).toFixed(2)}`,
                        metadata: { 
                          amount_cents: pendingPayout, 
                          method: selectedPayoutMethod,
                          status: 'pending'
                        }
                      });
                      
                      // Create notification
                      await supabase.from('notifications').insert({
                        user_id: user.id,
                        type: 'earning',
                        title: 'Payout Requested',
                        message: `Your payout request for $${(pendingPayout / 100).toFixed(2)} has been submitted and will be processed within 2-3 business days.`,
                        metadata: { amount_cents: pendingPayout }
                      });
                      
                      // Simulate processing time
                      await new Promise(resolve => setTimeout(resolve, 1500));
                      
                      setPayoutSuccess(true);
                    } catch (error) {
                      console.error('Payout error:', error);
                      alert('Failed to process payout. Please try again.');
                    } finally {
                      setPayoutProcessing(false);
                    }
                  }}
                  disabled={pendingPayout < 5000 || payoutProcessing}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-3 rounded-xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:shadow-lg transition-shadow"
                >
                  {payoutProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Wallet className="w-5 h-5" />
                      Request Payout
                    </>
                  )}
                </button>
              )}
            </div>
            
            {payoutSuccess && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-800">Payout Requested Successfully!</p>
                    <p className="text-sm text-green-600">You will receive funds within 2-3 business days.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
