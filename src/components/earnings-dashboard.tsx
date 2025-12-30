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
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import DashboardSidebar from './dashboard-sidebar';
import { useState } from 'react';

interface EarningsDashboardProps {
  user: User;
  content: any[];
  transactions: any[];
}

export default function EarningsDashboard({ user, content, transactions }: EarningsDashboardProps) {
  const [showPayoutModal, setShowPayoutModal] = useState(false);

  // Calculate earnings
  const totalEarnings = content.reduce((acc, c) => acc + (c.total_earnings_cents || 0), 0);
  const platformFee = totalEarnings * 0.15; // 15% platform fee
  const netEarnings = totalEarnings - platformFee;
  const pendingPayout = netEarnings * 0.3; // Simulated pending
  const paidOut = netEarnings * 0.7; // Simulated paid out

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
            disabled={pendingPayout < 5000}
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
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Request Payout</h3>
            <p className="text-gray-500 mb-6">
              Your pending balance of ${(pendingPayout / 100).toFixed(2)} will be transferred to your connected payment method.
            </p>
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3 mb-2">
                <Banknote className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600">Bank Account</span>
              </div>
              <p className="text-sm text-gray-500">••••1234 (Connected via Stripe)</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPayoutModal(false)}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Payout requested! This is a demo.');
                  setShowPayoutModal(false);
                }}
                className="flex-1 btn-glow px-4 py-3 rounded-xl text-white font-semibold"
              >
                Confirm Payout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
